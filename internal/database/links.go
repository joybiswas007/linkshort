package database

import (
	"database/sql"
	"time"
)

type Link struct {
	ID          int        `db:"id" json:"id"`
	Code        string     `db:"code" json:"code"`
	ShortURL    string     `db:"short_url" json:"short_url"`
	OriginalURL string     `db:"original_url" json:"original_url"`
	ExpiresAt   *time.Time `db:"expires_at" json:"expires_at,omitempty"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
}

type LinkModel struct {
	DB *sql.DB
}
