// Package v1 provides HTTP handlers for the blog API version 1 endpoints.
package v1

import (
	"net/http"

	"github.com/joybiswas007/url-shortner-go/server/router/frontend"
	"github.com/julienschmidt/httprouter"
)

// APIV1Service handles all API v1 endpoints and dependencies.
type APIV1Service struct {
}

// NewAPIV1Service creates a new API v1 service instance.
func NewAPIV1Service() *APIV1Service {
	return &APIV1Service{}
}

// RegisterRoutes configures and returns an HTTP handler with all API v1 routes.
func (s *APIV1Service) RegisterRoutes() http.Handler {
	r := httprouter.New()

	r.POST("/api/v1/links", s.shortenLinkHandler)

	// serve the frontend
	frontend.Serve(r)

	return r
}

func (s *APIV1Service) shortenLinkHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
}
