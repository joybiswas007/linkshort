// Package config provides application configuration management using Viper.
package config

import (
	"fmt"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

// Config holds application runtime settings such as port, environment,
// and request rate-limiting parameters.
type Config struct {
	// Port is the TCP port the HTTP server listens on, for example 8000.
	Port int `mapstructure:"port" validate:"required"`

	// IsProduction is the deployment environment name
	// (e.g., false = "development", true = "production").
	IsProduction bool `mapstructure:"is_production"`

	// RateLimiter configures request rate limiting to protect the server.
	RateLimiter RateLimiter `mapstructure:"rate_limiter" validate:"required"`

	BuildInfo Build // BuildInfo holds build metadata injected via ldflags for version tracking.

	// Domain is the base domain used for generating short URLs (e.g., "short.link").
	Domain string `mapstructure:"domain" validate:"required"`

	// DBName is the database name to connect to (e.g., "urlshortener").
	DBName string `mapstructure:"db_name" validate:"required"`
}

// RateLimiter defines the rate limiting configuration.
type RateLimiter struct {
	Rate  float64 `mapstructure:"rate" validate:"required"`  // Requests per second
	Burst int     `mapstructure:"burst" validate:"required"` // Maximum burst size allowed
}

// Build holds metadata about the application's build process, including
// git commit hash, branch name, and build timestamp. These values are
// injected at compile time via ldflags for version tracking and debugging.
type Build struct {
	Commit string `json:"commit"` // Build commit hash from git rev-parse
	Branch string `json:"branch"` // Build branch from git rev-parse
	Time   int64  `json:"time"`   // Build time from date command
}

// Init reads in config file and ENV variables if set.
func Init(cfgFile string) {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find working directory.
		pwd, err := os.Getwd()
		if err != nil {
			panic(err)
		}

		// Search config in pwd directory with name ".linkshort" (without extension).
		viper.AddConfigPath(pwd)
		viper.SetConfigType("yaml")
		viper.SetConfigName(".linkshort")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}

// GetAll unmarshals all loaded configuration into a Config struct.
// It returns the populated Config or an error if unmarshaling fails.
func GetAll() (Config, error) {
	var config Config

	// Use Viper to unmarshal configuration values into the config struct
	if err := viper.Unmarshal(&config); err != nil {
		return Config{}, err
	}

	validate := validator.New(validator.WithRequiredStructEnabled())

	if err := validate.Struct(&config); err != nil {
		return Config{}, err
	}

	return config, nil
}
