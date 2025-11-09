// Package database provides PostgreSQL database access and models for the linkshort.
package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file" // Register file source driver for golang-migrate.
	_ "github.com/mattn/go-sqlite3"
)

// Models contains all database models.
type Models struct {
	Links LinkModel
}

// New creates a new database connection to an SQLite database.
func New(dbName string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbName)
	if err != nil {
		return nil, fmt.Errorf("could not open db: %v", err)
	}

	err = db.PingContext(context.Background())
	if err != nil {
		return nil, fmt.Errorf("could not ping db: %v", err)
	}

	log.Println("Connected to database!")

	return db, nil
}

// NewModels initializes all database models.
func NewModels(db *sql.DB) Models {
	return Models{
		Links: LinkModel{DB: db},
	}
}

// Migrate applies database migrations for an sqlite3 database.
// It reads migration files from the designated migration folder and
// ensures the database schema is updated accordingly.
func Migrate(dbName string, db *sql.DB) error {
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return err
	}

	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	migrationFilesPath := fmt.Sprintf("file://%s/migrations", cwd)

	m, err := migrate.NewWithDatabaseInstance(migrationFilesPath, dbName, driver)
	if err != nil {
		return fmt.Errorf("migration initialization failed: %v", err)
	}

	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		version, dirty, _ := m.Version()
		if dirty {
			log.Printf("Database is in a dirty state at version %d. Forcing reset...", version)
			_ = m.Force(int(version)) // Reset to last successful version

			// retry migration
			err = m.Up()
			if err != nil && err != migrate.ErrNoChange {
				return fmt.Errorf("migration failed after fixing dirty state: %v", err)
			}
			return nil
		}
		return fmt.Errorf("migration failed: %v", err)
	}

	return nil
}
