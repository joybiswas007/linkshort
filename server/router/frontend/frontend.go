// Package frontend handles all frontend routing and static file serving.
package frontend

import (
	"embed"
	"io/fs"
	"log"
	"net/http"

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

	r.NotFound = http.FileServer(distFS)
}

func getFileSystem(path string) http.FileSystem {
	fileSystem, err := fs.Sub(embeddedFiles, path)
	if err != nil {
		log.Panic(err)
	}

	return http.FS(fileSystem)
}
