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
	// Embed the entire "dist" directory produced by the frontend build.
	// This contains index.html at dist/index.html and assets under dist/assets/...
	distFS := getFileSystem("dist")

	// Important: ServeFiles uses the filesystem root plus the captured *filepath.
	// If we pointed root at "dist" and mounted at "/assets/*filepath", requests like
	// /assets/hello.txt would try to open "hello.txt" at the FS root ("dist/hello.txt"),
	// which is wrong because the actual file lives at "dist/assets/hello.txt".
	// To avoid a duplicated "assets" segment in the URL (e.g., /assets/dist/assets/hello.txt)
	// or incorrect lookups, set the FS root directly to "dist/assets".
	assetsFS := getFileSystem("dist/assets")

	r.ServeFiles("/assets/*filepath", assetsFS)

	r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.RequestURI, "/api") {
			index, err := distFS.Open("index.html")
			if err != nil {
				log.Panicf("Could not open index.html: %v\n", err)
			}
			defer index.Close()

			stat, _ := index.Stat()
			http.ServeContent(w, r, "index.html", stat.ModTime(), index)
		}
	})
}

func getFileSystem(path string) http.FileSystem {
	fileSystem, err := fs.Sub(embeddedFiles, path)
	if err != nil {
		log.Panic(err)
	}

	return http.FS(fileSystem)
}
