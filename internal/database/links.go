package database

import (
	"context"
	"database/sql"
	"time"
)

type Link struct {
	ID          int       `db:"id" json:"-"`
	Code        string    `db:"code" json:"code"`
	ShortURL    string    `db:"short_url" json:"short_url"`
	OriginalURL string    `db:"original_url" json:"original_url"`
	ExpiresAt   int       `db:"expires_at" json:"expires_at,omitempty"`
	CreatedAt   time.Time `db:"created_at" json:"-"`
	UpdatedAt   time.Time `db:"updated_at" json:"-"`
}

type LinkModel struct {
	DB *sql.DB
}

// Create inserts a new shortened URL into the database and returns the generated ID
// It returns an error if the insert fails
func (m *LinkModel) Create(link *Link) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO links (code, short_url, original_url, expires_at)
		VALUES ($1, $2, $3, $4)
	`
	stmt, err := m.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.ExecContext(ctx, link.Code, link.ShortURL, link.OriginalURL, link.ExpiresAt)
	if err != nil {
		return err
	}
	return nil
}

func (m LinkModel) Exists(code string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT EXISTS(SELECT 1 FROM links WHERE code = $1)`

	var exists bool
	err := m.DB.QueryRowContext(ctx, query, code).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}
