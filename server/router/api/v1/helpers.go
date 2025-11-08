package v1

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateShortCode generates a random short code
func (s *APIV1Service) generateShortCode(length int) (string, error) {
	code := make([]byte, length)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		code[i] = charset[num.Int64()]
	}
	return string(code), nil
}

func (s *APIV1Service) readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	maxBytes := 1_048_576
	r.Body = http.MaxBytesReader(w, r.Body, int64(maxBytes))

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	err := dec.Decode(dst)
	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError
		var invalidUnmarshalError *json.InvalidUnmarshalError
		var maxBytesError *http.MaxBytesError

		switch {
		case errors.As(err, &syntaxError):
			return fmt.Errorf("body contains badly-formed JSON (at character %d)", syntaxError.Offset)
		case errors.Is(err, io.ErrUnexpectedEOF):
			return errors.New("body container badly-formed JSON")
		case errors.As(err, &unmarshalTypeError):
			if unmarshalTypeError.Field != "" {
				return fmt.Errorf("body contains incorrect JSON type for field %q", unmarshalTypeError.Field)
			}
			return fmt.Errorf("body contains incorrect JSON type (at character %d)", unmarshalTypeError.Offset)
		case errors.Is(err, io.EOF):
			return errors.New("body must not be empty")
		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return fmt.Errorf("body contains unknow key %s", fieldName)
		case errors.As(err, &maxBytesError):
			return fmt.Errorf("body must not be larger than %d bytes", maxBytesError.Limit)
		case errors.As(err, &invalidUnmarshalError):
			panic(err)
		default:
			return err
		}
	}
	err = dec.Decode(&struct{}{})
	if err != io.EOF {
		return errors.New("body must only contain a single JSON value")
	}
	return nil
}

func (s *APIV1Service) writeJSON(w http.ResponseWriter, status int, data any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		return err
	}
	return nil
}

func (s *APIV1Service) errorResponse(w http.ResponseWriter, status int, message any) {
	data := map[string]any{"error": message}

	err := s.writeJSON(w, status, data)
	if err != nil {
		w.WriteHeader(500)
	}
}

// inputValidationErrors processes validator errors and responds with a formatted JSON error.
func (s *APIV1Service) inputValidationErrors(w http.ResponseWriter, err error) {
	if errs, ok := err.(validator.ValidationErrors); ok {
		var errMessages []map[string]string
		for _, err := range errs {
			field := strings.ToLower(err.Field())
			tag := err.Tag()
			var message string

			switch tag {
			case "required":
				message = fmt.Sprintf("%s must be provided", field)
			case "url":
				message = fmt.Sprintf("%s must be valid type", field)
			default:
				message = fmt.Sprintf("invalid input for %s", field)
			}

			errMessages = append(errMessages, map[string]string{field: message})
		}

		err = s.writeJSON(w, http.StatusBadRequest, map[string]any{"errors": errMessages})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	s.errorResponse(w, http.StatusBadRequest, err.Error())
}
