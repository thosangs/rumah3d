#!/usr/bin/env python3
"""Server statis tanpa cache (supaya perubahan file langsung terlihat). Pakai: python3 serve.py [port]"""
import http.server, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
class S(http.server.ThreadingHTTPServer):
    request_queue_size = 128  # default 5 → Chrome paralel (scripts/shots.mjs) kehabisan antrean, modul gagal dimuat
    daemon_threads = True
print(f'http://localhost:{port}'); S(('127.0.0.1', port), H).serve_forever()
