package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/joybiswas007/linkshort/config"
	"github.com/joybiswas007/linkshort/internal/database"
	"github.com/joybiswas007/linkshort/server"
)

func main() {
	var cfg config.Config

	flag.IntVar(&cfg.Port, "port", 8000, "API server port")
	flag.StringVar(&cfg.Env, "env", "development", "Environment (development|production)")

	flag.Float64Var(&cfg.Limiter.Rps, "limiter-rps", 1, "Rate limiter maximum requests per second")
	flag.IntVar(&cfg.Limiter.Burst, "limiter-burst", 10, "Rate limiter maximum burst")

	flag.Parse()

	db, err := database.New()
	if err != nil {
		log.Panic(err)
	}
	defer func() {
		log.Println("Disconnected from database")
		db.Close()
	}()

	if err := database.Migrate(db); err != nil {
		log.Panic(err)
	}

	srv := server.NewServer(cfg, db)

	// Create a done channel to signal when the shutdown is complete
	done := make(chan bool)

	// Run graceful shutdown in a separate goroutine
	go gracefulShutdown(srv, done)

	err = srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}

	// Wait for the graceful shutdown to complete
	<-done
	log.Println("Graceful shutdown complete.")
}

func gracefulShutdown(apiServer *http.Server, done chan<- bool) {
	// Listen for interrupt signals (SIGINT, SIGTERM)
	sigCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Block until a signal is received
	<-sigCtx.Done()
	log.Println("Shutting down gracefully, press Ctrl+C again to force")

	// Create a new context for server shutdown timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := apiServer.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}

	log.Println("Server exiting")

	// Notify main goroutine that shutdown is complete
	done <- true
}
