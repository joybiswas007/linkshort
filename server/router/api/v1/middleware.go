package v1

import (
	"net/http"

	"golang.org/x/time/rate"
)

func (s *APIV1Service) recoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Create a deferred function.
		defer func() {
			// Use the builtin recover function to check if there has been a panic or not.
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")
				s.errorResponse(w, http.StatusInternalServerError, "server encountered an issue")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func (s *APIV1Service) rateLimit(next http.Handler) http.Handler {
	limiter := rate.NewLimiter(rate.Limit(s.cfg.Limiter.Rps), s.cfg.Limiter.Burst)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.Allow() {
			s.errorResponse(w, http.StatusTooManyRequests, "too many requests")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// CORS middleware
func (s *APIV1Service) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3001") // Use "*" for all origins, or replace with specific origins
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "false") // Set to "true" if credentials are needed

		// Handle preflight OPTIONS requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
