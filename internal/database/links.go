package database

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type Link struct {
	ID          int       `json:"-"`
	Code        string    `json:"code"`
	ShortURL    string    `json:"short_url"`
	OriginalURL string    `json:"original_url"`
	ExpiresAt   int       `json:"expires_at,omitempty"`
	Views       int       `json:"-"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
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

func (m LinkModel) GetByCode(code string) (*Link, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	const query = `
        SELECT id, code, short_url, original_url, expires_at
        FROM links
        WHERE code = $1
    `

	var l Link
	// If expires_at can be NULL in DB, prefer sql.NullTime or *time.Time in the struct.
	err := m.DB.QueryRowContext(ctx, query, code).Scan(
		&l.ID,
		&l.Code,
		&l.ShortURL,
		&l.OriginalURL,
		&l.ExpiresAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &l, nil
}

// UpdateViews increments the view count for a specific url by id.
func (m LinkModel) UpdateViews(linkID int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE links SET views = views + 1 WHERE id = $1`

	stmt, err := m.DB.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.ExecContext(ctx, linkID)
	if err != nil {
		return err
	}
	return nil
}
