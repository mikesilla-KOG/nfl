#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from urllib.parse import urlparse
from fetch_standings import fetch_nfl_standings

class NFLHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # API endpoint for standings
        if parsed_path.path == '/api/standings':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            standings = fetch_nfl_standings()
            if standings:
                self.wfile.write(json.dumps(standings).encode())
            else:
                self.wfile.write(json.dumps({'error': 'Failed to fetch standings'}).encode())
        else:
            # Serve static files
            super().do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('0.0.0.0', port), NFLHandler)
    print(f'Server running on port {port}...')
    server.serve_forever()
