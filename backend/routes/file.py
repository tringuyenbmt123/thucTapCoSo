from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import pandas as pd
from PyPDF2 import PdfReader
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
import re
import os
from utils.model_registry import ModelRegistry
from utils.common import compute_ensemble_score, temp_file
import logging
from utils.file_third_party import check_scanii_from_file
bp = Blueprint("file", __name__)
logger = logging.getLogger(__name__)
model_registry = ModelRegistry(os.getenv("MODEL_DIR", "models"))
ALLOWED_PDF_EXTENSION = {"pdf"}
EXPECTED_FEATURES = [
    "PdfSize", "MetadataSize", "Pages", "XrefLength", "TitleCharacters",
    "isEncrypted", "EmbeddedFiles", "Images", "Text", "Header", "Obj",
    "Endobj", "Stream", "Endstream", "Xref", "Trailer", "StartXref",
    "PageNo", "Encrypt", "ObjStm", "JS", "Javascript", "AA", "OpenAction",
    "Acroform", "JBIG2Decode", "RichMedia", "Launch", "EmbeddedFile",
    "XFA", "Colors"
]

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_PDF_EXTENSION

def extract_pdf_features(pdf_path: str) -> dict:
    try:
        pdf = PdfReader(pdf_path)
        features = {feat: 0 for feat in EXPECTED_FEATURES}
        features["PdfSize"]       = os.path.getsize(pdf_path) / 1024.0
        features["MetadataSize"]  = len(str(pdf.metadata)) if pdf.metadata else 0
        features["Pages"]         = len(pdf.pages)
        features["PageNo"]        = len(pdf.pages)
        features["TitleCharacters"] = len(pdf.metadata.get("/Title", "")) if pdf.metadata else 0
        features["isEncrypted"]   = 1 if pdf.is_encrypted else 0

        with open(pdf_path, "rb") as f:
            content = f.read()

        features["Header"] = content.count(b"%PDF")
        xref_sections = re.findall(b"xref(.*?)trailer", content, re.DOTALL)
        features["XrefLength"] = sum(len(sec) for sec in xref_sections)
        features["Obj"]        = content.count(b" obj")
        features["Endobj"]     = content.count(b"endobj")
        features["Stream"]     = content.count(b"stream")
        features["Endstream"]  = content.count(b"endstream")
        features["Xref"]       = content.count(b"xref")
        features["Trailer"]    = content.count(b"trailer")
        features["StartXref"]  = content.count(b"startxref")
        features["Encrypt"]    = content.count(b"/Encrypt")
        features["ObjStm"]     = content.count(b"/ObjStm")
        features["AA"]         = content.count(b"/AA")
        features["OpenAction"] = content.count(b"/OpenAction")
        features["Acroform"]   = content.count(b"/AcroForm")
        features["JBIG2Decode"] = content.count(b"JBIG2Decode")
        features["RichMedia"]  = content.count(b"/RichMedia")
        features["Launch"]     = content.count(b"/Launch")
        features["EmbeddedFile"] = content.count(b"/EmbeddedFile")
        features["EmbeddedFiles"] = content.count(b"/EmbeddedFiles")
        features["XFA"]        = content.count(b"/XFA")
        features["Colors"]     = content.count(b"/Color")

        try:
            text = extract_text(pdf_path, laparams=LAParams())
            features["Text"]       = len(text) if text else 0
            features["JS"]         = 1 if "javascript" in text.lower() else 0
            features["Javascript"] = features["JS"]
        except Exception as e:
            logger.warning(f"Không thể trích xuất văn bản từ PDF {pdf_path}: {e}")
            features["Text"] = 0
            features["JS"] = features["Javascript"] = 0

        features["Images"] = 1 if features["Pages"] > 0 and (features["PdfSize"] / features["Pages"]) > 50 else 0
        return features
    except Exception as e:
        logger.error(f"Lỗi khi trích xuất đặc trưng PDF từ {pdf_path}: {e}")
        raise ValueError(f"Không thể xử lý PDF: {e}")

@bp.route("/predict", methods=["POST"])
def predict_file():
    threshold = 0.5
    try:
        if "file" not in request.files or not request.files["file"].filename:
            return jsonify({"error": "Không có tệp được chọn"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)

        # Quét bằng Scanii trước khi phân tích
        file_bytes = file.read()
        scanii_result = check_scanii_from_file(file_bytes, filename)

        # Ghi lại file tạm để phân tích đặc trưng
        file.stream.seek(0)  # reset lại con trỏ file




        if not allowed_file(filename):
            return jsonify({"error": "Loại tệp không hợp lệ"}), 400


        with temp_file(file, filename) as file_path:
            features = extract_pdf_features(file_path)
            feature_df = pd.DataFrame([features], columns=EXPECTED_FEATURES)
            rf_model = model_registry.load_model("random_forest_file", "pickle")
            rf_prob = rf_model.predict_proba(feature_df)[0][1]
            ensemble = compute_ensemble_score(rf_prob)
            result = "nguy hiểm" if ensemble > threshold else "hợp pháp"  # Sử dụng tiếng Việt
            legitimate_prob = round((1.0 - rf_prob) * 100, 2)  # Tính xác suất hợp pháp và nhân với 100
            rf_confidence = round(float(rf_prob) * 100, 2)  # Nhân với 100 để thành phần trăm
            logger.info(f"Dự đoán tệp {filename}: rf_confidence={rf_confidence}%, result={result}")
            features_dict = feature_df.to_dict(orient='records')[0]
            return jsonify({
                "rf_confidence": rf_confidence,
                "legitimate_prob": legitimate_prob,
                "result": result,
                "features": features_dict,
                "third_party_eval": {
                    "scanii": scanii_result
                }
            }), 200
    except Exception as e:
        logger.error(f"Lỗi khi xử lý tệp {filename}: {e}")
        return jsonify({"error": f"Không thể xử lý tệp: {str(e)}"}), 500