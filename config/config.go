package config

// Config holds application runtime settings such as port, environment,
// and request rate-limiting parameters.
type Config struct {
	// Port is the TCP port the HTTP server listens on, for example 8000.
	Port int

	// Env is the deployment environment name (e.g., "development", "production").
	Env string

	// Limiter configures request rate limiting to protect the server.
	Limiter Limiter
}

// Limiter defines token‑bucket rate limit settings used by middleware
// to control request throughput.
type Limiter struct {
	// Rps is the allowed requests per second (tokens added per second).
	Rps float64

	// Burst is the maximum burst size allowed above the steady Rps.
	Burst int
}
