// Package frontend handles all frontend routing and static file serving.
package frontend

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"path"
	"strings"

	"github.com/julienschmidt/httprouter"
)

// Embed the entire "dist" directory, which includes index.html and assets.
//
//go:embed "dist"
var embeddedFiles embed.FS

// Serve sets up the frontend routes to serve embedded static files.
func Serve(r *httprouter.Router) {
	distFS := getFileSystem("dist")

	r.GET("/", func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		serveIndex(distFS, w, r)
	})

	// NotFound handles all unmatched routes for SPA client-side routing.
	// It serves static assets when they exist, otherwise falls back to index.html
	// to allow React Router to handle the route.
	r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.RequestURI, "/api") {
			assetPath := strings.TrimPrefix(r.RequestURI, "/")
			if assetPath == "" {
				assetPath = "index.html"
			}
			asset, err := distFS.Open(assetPath)
			if err != nil {
				// Asset not found, serve index.html for client-side routing
				serveIndex(distFS, w, r)
				return
			}
			defer asset.Close()

			stat, _ := asset.Stat()

			http.ServeContent(w, r, path.Base(r.RequestURI), stat.ModTime(), asset)
		}
	})
}

// serveIndex opens and serves the index.html file from the embedded filesystem.
// It panics if index.html cannot be opened, as this is a critical error.
func serveIndex(fsys http.FileSystem, w http.ResponseWriter, r *http.Request) {
	index, err := fsys.Open("index.html")
	if err != nil {
		log.Panic(err)
	}
	defer index.Close()

	stat, _ := index.Stat()
	http.ServeContent(w, r, "index.html", stat.ModTime(), index)
}

func getFileSystem(fsPath string) http.FileSystem {
	fileSystem, err := fs.Sub(embeddedFiles, fsPath)
	if err != nil {
		log.Panic(err)
	}

	return http.FS(fileSystem)
}
