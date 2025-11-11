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
		index, err := distFS.Open("index.html")
		if err != nil {
			log.Panicf("Could not open index.html: %v\n", err)
		}
		defer index.Close()

		stat, _ := index.Stat()
		http.ServeContent(w, r, "index.html", stat.ModTime(), index)
	})

	r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.RequestURI, "/api") {
			assetPath := strings.TrimPrefix(r.RequestURI, "/")
			if assetPath == "" {
				assetPath = "index.html"
			}
			asset, err := distFS.Open(assetPath)
			if err != nil {
				asset, err = distFS.Open("index.html")
				if err != nil {
					log.Panic(err)
				}
			}
			defer asset.Close()

			stat, _ := asset.Stat()

			http.ServeContent(w, r, path.Base(r.RequestURI), stat.ModTime(), asset)
		}
	})
}

func getFileSystem(fsPath string) http.FileSystem {
	fileSystem, err := fs.Sub(embeddedFiles, fsPath)
	if err != nil {
		log.Panic(err)
	}

	return http.FS(fileSystem)
}
