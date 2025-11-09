package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/spf13/viper"
)

func resetViper() {
	viper.Reset()
}

func writeTempConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()

	configPath := filepath.Join(dir, ".linkshort.yaml")
	if err := os.WriteFile(configPath, []byte(content), 0644); err != nil {
		t.Fatalf("failed to write temp config: %v", err)
	}

	return configPath
}

func TestInitWithConfigFile(t *testing.T) {
	resetViper()

	cfgContent := `
port: 8000
db: links.db 
rate_limiter:
  rate: 1
  burst: 25
is_production: true
domain: "https://sitename.com"
db_name: links.db
`
	configPath := writeTempConfig(t, cfgContent)
	Init(configPath)

	cfg, err := GetAll()
	if err != nil {
		t.Fatalf("GetAll failed: %v", err)
	}

	if cfg.Port != 8000 || !cfg.IsProduction {
		t.Errorf("unexpected config: %+v", cfg)
	}
}

func TestGetAll(t *testing.T) {
	resetViper()
	Init("")

	_, err := GetAll()
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}

func TestInitConfigFileNotFound(t *testing.T) {
	resetViper()
	Init("/nonexistent/path/to/config.yaml")
	_, err := GetAll()
	if err == nil {
		t.Fatal("expected error due to missing required fields")
	}
}
