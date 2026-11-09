import http.server
import socketserver
import urllib.parse
import os

PORT = 3000

class PandaHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
            return super().do_GET()
        elif self.path.startswith('/set-location'):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            try:
                lat = params.get('lat', ['0'])[0]
                lng = params.get('lng', ['0'])[0]
                
                print(f"[PANDA-Switch] >>> MOCK TELEPORT: Lat {lat}, Lng {lng}")
                os.system(f"am broadcast -a com.pandaswitch.ACTION_MOCK --ef lat {lat} --ef lng {lng}")
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status":"success","message":"Coordinates broadcasted to system!"}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'{{"status":"error","message":"{str(e)}"}}'.encode())
        else:
            return super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
print("==========================================")
print("     PANDA-Switch Cyber Engine v2.2       ")
print("     System Mocking Ready for Testing     ")
print("==========================================")
with socketserver.TCPServer(("", PORT), PandaHandler) as httpd:
    print(f"[*] Dashboard running at: http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] PANDA-Switch server shut down.")
