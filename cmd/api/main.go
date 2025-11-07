package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/joybiswas007/url-shortner-go/server/router/frontend"
	"github.com/julienschmidt/httprouter"
)

type application struct {
	port int
	wg   sync.WaitGroup
}

func main() {
	var app application
	flag.IntVar(&app.port, "port", 8000, "--port")
	flag.Parse()

	err := app.serve()
	if err != nil {
		log.Fatal(err)
	}
}

func (app *application) serve() error {
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", app.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Create a shutdownError channel. We will use this to receive any errors returned
	// by the graceful Shutdown() function.
	shutdownErr := make(chan error)

	// Start a background goroutine
	app.wg.Go(func() {
		quit := make(chan os.Signal, 1)

		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

		s := <-quit

		log.Printf("shutting down server: %s", s.String())

		// Create a context with a 20-second timeout.
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		// Call Shutdown() on the server like before, but now we only send on the
		// shutdownError channel if it returns an
		err := srv.Shutdown(ctx)
		if err != nil {
			shutdownErr <- err
		}

		// Log a message to say that we're waiting for any background goroutines to
		// complete their tasks.
		log.Printf("completing background tasks: %s", srv.Addr)

		// Call Wait() to block until our WaitGroup counter is zero --- essentially
		// blocking until the background goroutines have finished. Then we return nil on
		// the shutdownError channel, to indicate that the shutdown completed without
		// any issues.
		app.wg.Wait()
		shutdownErr <- nil
	})

	log.Printf("starting server: %s", srv.Addr)

	err := srv.ListenAndServe()
	if err != nil {
		if errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}
	err = <-shutdownErr
	if err != nil {
		return err
	}
	// At this point we know that the graceful shutdown completed successfully and we
	// log a "stopped server" message.
	log.Printf("stopped server: %s", srv.Addr)

	return nil
}

func (app *application) routes() http.Handler {
	r := httprouter.New()

	frontend.Serve(r)

	return r
}
