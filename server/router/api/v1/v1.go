// Package v1 provides HTTP handlers for the blog API version 1 endpoints.
package v1

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/joybiswas007/linkshort/internal/database"
	"github.com/joybiswas007/linkshort/server/router/frontend"
	"github.com/julienschmidt/httprouter"
)

// APIV1Service handles all API v1 endpoints and dependencies.
type APIV1Service struct {
	db database.Models
}

// NewAPIV1Service creates a new API v1 service instance.
func NewAPIV1Service(db database.Models) *APIV1Service {
	return &APIV1Service{db: db}
}

// RegisterRoutes configures and returns an HTTP handler with all API v1 routes.
func (s *APIV1Service) RegisterRoutes() http.Handler {
	r := httprouter.New()

	r.POST("/api/v1/links", s.shortLinkHandler)
	r.GET("/api/v1/links/:code", s.linkByCodeHandler)

	// serve the frontend
	frontend.Serve(r)

	production := false

	switch production {
	case true:
		return s.recoverPanic(s.rateLimit(r))
	default:
		return s.recoverPanic(s.enableCORS(s.rateLimit(r)))
	}
}

func (s *APIV1Service) shortLinkHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		URL       string `json:"url" validate:"required,url"`
		ExpiresAt int    `json:"expires_at,omitempty"`
	}

	err := s.readJSON(w, r, &input)
	if err != nil {
		s.errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	validate := validator.New(validator.WithRequiredStructEnabled())

	if err := validate.Struct(&input); err != nil {
		s.inputValidationErrors(w, err)
		return
	}

	code, err := s.generateShortCode(6)
	if err != nil {
		s.errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	exists, err := s.db.Links.Exists(code)
	if err != nil {
		s.errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	var shortCode string
	if exists {
		shortCode, err = s.generateShortCode(6)
		if err != nil {
			s.errorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	} else {
		shortCode = code
	}

	link := &database.Link{
		Code:        shortCode,
		ShortURL:    fmt.Sprintf("http://localhost:8000/%s", shortCode),
		OriginalURL: input.URL,
	}

	if input.ExpiresAt > 0 {
		link.ExpiresAt = input.ExpiresAt
	}

	err = s.db.Links.Create(link)
	if err != nil {
		s.errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	err = s.writeJSON(w, http.StatusOK, link)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (s *APIV1Service) linkByCodeHandler(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	code := params.ByName("code")
	if code == "" {
		s.errorResponse(w, http.StatusBadRequest, "missing required path parameter: code")
		return
	}

	exists, err := s.db.Links.Exists(code)
	if err != nil {
		s.errorResponse(w, http.StatusBadRequest, "invalid code")
		return
	}

	if !exists {
		s.errorResponse(w, http.StatusBadRequest, "link not found for code")
		return
	}

	link, err := s.db.Links.GetByCode(code)
	if err != nil {
		s.errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	nowMs := time.Now().UnixMilli()
	if link.ExpiresAt > 0 && nowMs >= int64(link.ExpiresAt) {
		s.errorResponse(w, http.StatusBadRequest, "link has expired")
		return
	}

	err = s.writeJSON(w, http.StatusOK, link)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
}
