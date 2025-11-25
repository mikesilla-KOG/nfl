#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import sys
import os

# Add paths for both scrapers
sys.path.insert(0, '/workspaces/nfl')
sys.path.insert(0, '/workspaces/nba')

class CombinedHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Redirect root and old index.html to combined_index.html
        if self.path == '/' or self.path == '/index.html':
            self.path = '/combined_index.html'
        
        if self.path == '/api/standings/nfl':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                import fetch_standings as nfl_fetch
                data = nfl_fetch.fetch_nfl_standings()
                if data:
                    self.wfile.write(json.dumps(data).encode())
                else:
                    self.wfile.write(json.dumps({'error': 'Failed to fetch NFL data'}).encode())
            except Exception as e:
                self.wfile.write(json.dumps({'error': str(e)}).encode())
                
        elif self.path == '/api/standings/nba':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                # Import from nba directory
                nba_path = '/workspaces/nba'
                if nba_path not in sys.path:
                    sys.path.insert(0, nba_path)
                    
                import importlib
                nba_fetch = importlib.import_module('fetch_standings')
                data = nba_fetch.fetch_nba_standings()
                if data:
                    self.wfile.write(json.dumps(data).encode())
                else:
                    self.wfile.write(json.dumps({'error': 'Failed to fetch NBA data'}).encode())
            except Exception as e:
                print(f"NBA fetch error: {e}")
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_GET()

if __name__ == '__main__':
    import os
    PORT = int(os.environ.get('PORT', 8000))
    server = HTTPServer(('0.0.0.0', PORT), CombinedHandler)
    print(f'Server running on port {PORT}...')
    server.serve_forever()
