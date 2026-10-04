#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سيرفر متكامل لموقع بورتفوليو المصور محمد علي (Mohamed Ali)
يدعم تقديم الموقع، رفع ملفات الصور والفيديوهات، وحفظ البيانات تلقائياً
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
import time
import re
import email
import email.policy

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(DIRECTORY, "uploads")
DATA_FILE = os.path.join(DIRECTORY, "data.json")

# Ensure uploads directory exists
os.makedirs(UPLOADS_DIR, exist_ok=True)


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and remove unsafe chars"""
    base = os.path.basename(filename)
    name, ext = os.path.splitext(base)
    # clean name
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\u0600-\u06FF]', '_', name).strip('_')
    if not clean_name:
        clean_name = "upload"
    timestamp = int(time.time() * 1000)
    ext = ext.lower()
    return f"{clean_name}_{timestamp}{ext}"


class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # API: Get stored portfolio data
        if self.path == '/api/data':
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        data = f.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(data.encode('utf-8'))
                    return
                except Exception as e:
                    self.send_error(500, f"Error reading data.json: {e}")
                    return
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "data.json not found"}).encode('utf-8'))
                return

        # Fallback to standard static file serving
        super().do_GET()

    def do_POST(self):
        # API: Save full portfolio data
        if self.path == '/api/data':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                parsed_json = json.loads(body.decode('utf-8'))
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(parsed_json, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "تم حفظ البيانات بنجاح"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        # API: Upload Media (Images and Videos)
        if self.path == '/api/upload':
            try:
                content_type = self.headers.get('Content-Type', '')
                content_length = int(self.headers.get('Content-Length', 0))

                if not content_type.startswith('multipart/form-data'):
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Content-Type must be multipart/form-data"}).encode('utf-8'))
                    return

                raw_body = self.rfile.read(content_length)
                header_bytes = f"Content-Type: {content_type}\r\n\r\n".encode('latin-1')
                msg = email.message_from_bytes(header_bytes + raw_body, policy=email.policy.default)

                uploaded_files = []
                for part in msg.iter_parts():
                    filename = part.get_filename()
                    if filename:
                        safe_name = sanitize_filename(filename)
                        file_path = os.path.join(UPLOADS_DIR, safe_name)
                        file_data = part.get_payload(decode=True)
                        with open(file_path, 'wb') as f:
                            f.write(file_data)
                        
                        rel_url = f"/uploads/{safe_name}"
                        uploaded_files.append({
                            "original_name": filename,
                            "filename": safe_name,
                            "url": rel_url,
                            "size": len(file_data),
                            "content_type": part.get_content_type()
                        })

                if uploaded_files:
                    first_file = uploaded_files[0]
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "success": True,
                        "url": first_file["url"],
                        "filename": first_file["filename"],
                        "all": uploaded_files
                    }).encode('utf-8'))
                else:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "لم يتم العثور على أي ملفات مرفوعة"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        self.send_error(404, "Endpoint not found")


def run():
    try:
        if sys.platform == 'win32':
            sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), PortfolioHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("🎥 موقع بورتفوليو المصور محمد علي (Mohamed Ali Portfolio)")
        print(f"🚀 السيرفر يعمل الآن على: {url}")
        print(f"⚙️ لوحة التحكم والإدارة:  {url}/admin.html")
        print(f"📁 مجلد المرفوعات:        {UPLOADS_DIR}")
        print("=" * 60)
        print("اضغط Ctrl + C لإيقاف السيرفر في أي وقت.")

        # Try to open in default browser
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nتم إيقاف السيرفر بنجاح.")
            sys.exit(0)


if __name__ == '__main__':
    run()
