// Package frontend handles all frontend routing and static file serving.
package frontend

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
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

	r.ServeFiles("/assets/*filepath", distFS)
	r.GET("/", serveIndex(distFS))

	r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.RequestURI, "/api") {
			serveIndex(distFS)
		}
	})
}

// serveIndex returns a handler that serves index.html
func serveIndex(fsys http.FileSystem) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		index, err := fsys.Open("index.html")
		if err != nil {
			log.Printf("Could not open index.html: %v\n", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer index.Close()

		stat, err := index.Stat()
		if err != nil {
			log.Printf("Could not get file stats: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		http.ServeContent(w, r, "index.html", stat.ModTime(), index)
	}
}

func getFileSystem(path string) http.FileSystem {
	fs, err := fs.Sub(embeddedFiles, path)
	if err != nil {
		log.Panic(err)
	}

	return http.FS(fs)
}
