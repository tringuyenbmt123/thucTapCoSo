from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import logging
from routes import url, image, file, email

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "../Uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("server.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

class UnicodeSafeFormatter(logging.Formatter):
    def format(self, record):
        record.msg = record.msg.encode('ascii', errors='replace').decode('ascii')
        return super().format(record)

for handler in logging.getLogger().handlers:
    if isinstance(handler, logging.StreamHandler) and not isinstance(handler, logging.FileHandler):
        handler.setFormatter(UnicodeSafeFormatter("%(asctime)s - %(levelname)s - %(message)s"))

app.register_blueprint(url.bp, url_prefix="/api/url")
app.register_blueprint(image.bp, url_prefix="/api/image")
app.register_blueprint(file.bp, url_prefix="/api/file")
app.register_blueprint(email.bp, url_prefix="/api/email")

# Phục vụ file tĩnh từ thư mục build
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_static(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)