import http.server
import socketserver
import mimetypes

PORT = 8081

# Fix for Windows registry issues where .js is sometimes served as text/plain
mimetypes.add_type('application/javascript', '.js')

class NoCacheRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

with http.server.ThreadingHTTPServer(("", PORT), NoCacheRequestHandler) as httpd:
    print(f"Serving at http://localhost:{PORT} with NO CACHING (Threaded)")
    httpd.serve_forever()
