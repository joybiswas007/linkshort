// Package server handles HTTP server setup, routing, and middleware configuration.
package server

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/joybiswas007/linkshortner-go/internal/database"
	v1 "github.com/joybiswas007/linkshortner-go/server/router/api/v1"
)

// Server holds the HTTP server configuration and dependencies.
type Server struct {
	port   int
	models database.Models
}

// NewServer creates and configures a new HTTP server instance.
func NewServer(port int, db *sql.DB) *http.Server {
	NewServer := &Server{
		port:   port,
		models: database.NewModels(db),
	}

	v1Server := v1.NewAPIV1Service(NewServer.models)

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
