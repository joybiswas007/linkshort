// Package server handles HTTP server setup, routing, and middleware configuration.
package server

import (
	"fmt"
	"net/http"
	"time"

	v1 "github.com/joybiswas007/url-shortner-go/server/router/api/v1"
)

// Server holds the HTTP server configuration and dependencies.
type Server struct {
	port int
}

// NewServer creates and configures a new HTTP server instance.
func NewServer(port int) *http.Server {
	NewServer := &Server{
		port: port,
	}

	v1Server := v1.NewAPIV1Service()

	// Declare Server config.
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      v1Server.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
