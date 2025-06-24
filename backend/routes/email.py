from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import pandas as pd
from email import policy
from email.parser import BytesParser
from datetime import datetime
import re
from utils.model_registry import ModelRegistry
from utils.common import compute_ensemble_score, temp_file
import logging
import os

bp = Blueprint("email", __name__)
logger = logging.getLogger(__name__)
model_registry = ModelRegistry(os.getenv("MODEL_DIR", "models"))
ALLOWED_EMAIL_EXTENSION = {"eml"}
EMAIL_FEATURES = [
    "hops", "missing_subject", "missing_to", "missing_content-type",
    "missing_mime-version", "missing_x-mailer", "missing_delivered-to",
    "missing_list-unsubscribe", "missing_received-spf", "missing_reply-to",
    "str_from_chevron", "str_to_chevron", "str_message-ID_dollar",
    "str_return-path_bounce", "str_content-type_texthtml",
    "domain_match_from_return-path", "domain_match_to_from",
    "domain_match_to_message-id", "domain_match_from_reply-to",
    "domain_match_message-id_from", "length_from", "num_recipients_to",
    "num_recipients_cc", "time_zone", "day_of_week", "span_time",
    "date_comp_date_received", "content-encoding-val", "received_str_forged",
    "number_replies", "label"
]

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EMAIL_EXTENSION

def extract_email_features(file_path: str) -> pd.DataFrame:
    try:
        with open(file_path, 'rb') as f:
            msg = BytesParser(policy=policy.default).parse(f)
        headers_dict = dict(msg.items())
        full_msg = msg

        sanitized_headers = {k: v.encode('ascii', errors='replace').decode('ascii') for k, v in headers_dict.items()}
        logger.info(f"Trích xuất headers: {sanitized_headers}")

        received_headers = full_msg.get_all("Received", []) if full_msg else []
        hops = len(received_headers)
        most_recent_received = received_headers[0] if received_headers else ""

        is_missing = lambda h: int(h not in headers_dict or not headers_dict[h].strip())
        contains = lambda h, pattern: int(bool(re.search(pattern, headers_dict.get(h, ''), re.IGNORECASE)))
        domain_match = lambda h1, h2_val: int(
            bool(re.search(r'@([\w\.-]+)', headers_dict.get(h1, ''))) and
            bool(re.search(r'@([\w\.-]+)', h2_val)) and
            re.search(r'@([\w\.-]+)', headers_dict.get(h1, '')).group(1) ==
            re.search(r'@([\w\.-]+)', h2_val).group(1)
        )

        span_time = 0
        if "Date" in headers_dict and most_recent_received:
            try:
                dt = datetime.strptime(headers_dict["Date"][:31], "%a, %d %b %Y %H:%M:%S %z")
                rec = most_recent_received.split(";")[-1].strip()
                if rec:
                    rec_dt = datetime.strptime(rec[:31], "%a, %d %b %Y %H:%M:%S %z")
                    span_time = abs((dt - rec_dt).total_seconds())
            except (ValueError, IndexError) as e:
                logger.debug(f"Không thể phân tích Date hoặc Received cho span_time: {e}")

        time_zone = int(bool(re.search(r'([+-]\d{4})', headers_dict.get("Date", ""))))
        day_of_week = 0
        if "Date" in headers_dict:
            try:
                dt = datetime.strptime(headers_dict["Date"][:31], "%a, %d %b %Y %H:%M:%S %z")
                day_of_week = dt.weekday()
            except ValueError as e:
                logger.debug(f"Không thể phân tích Date cho day_of_week: {e}")

        date_comp_date_received = int("Date" in headers_dict and "Received" in headers_dict)
        content_encoding_val = headers_dict.get("Content-Transfer-Encoding", "").lower()
        if not content_encoding_val:
            content_encoding_val = 0
        elif "quoted-printable" in content_encoding_val:
            content_encoding_val = 1
        elif "base64" in content_encoding_val:
            content_encoding_val = 2
        elif "7bit" in content_encoding_val or "8bit" in content_encoding_val:
            content_encoding_val = 3
        else:
            content_encoding_val = 4

        received_str_forged = 0
        for rec in received_headers:
            if "forged" in rec.lower() or not re.search(r'from [\w\.-]+', rec):
                received_str_forged = 1
                break

        str_from_chevron = int(bool(re.search(r'<[\w\.-]+@[\w\.-]+>', headers_dict.get("From", ""))))
        str_to_chevron = int(bool(re.search(r'<[\w\.-]+@[\w\.-]+>', headers_dict.get("To", ""))))
        length_from = len(headers_dict.get("From", ""))
        num_recipients_to = len([x for x in headers_dict.get("To", "").split(",") if x.strip()])
        num_recipients_cc = len([x for x in headers_dict.get("Cc", "").split(",") if x.strip()])
        missing_x_mailer = is_missing("X-Mailer")
        missing_reply_to = is_missing("Reply-To")
        str_message_id_dollar = int(bool(re.search(r'\$', headers_dict.get("Message-ID", ""))))
        str_return_path_bounce = int(bool(re.search(r'bounce', headers_dict.get("Return-Path", ""), re.IGNORECASE)))
        str_content_type_texthtml = int(bool(re.search(r'text/html', headers_dict.get("Content-Type", ""), re.IGNORECASE)))
        domain_match_to_from = domain_match("To", headers_dict.get("From", ""))
        domain_match_to_message_id = domain_match("To", headers_dict.get("Message-ID", ""))
        domain_match_from_reply_to = domain_match("From", headers_dict.get("Reply-To", ""))
        domain_match_message_id_from = domain_match("Message-ID", headers_dict.get("From", ""))
        number_replies = len([h for h in headers_dict.get("References", "").split() if h.strip()]) if "References" in headers_dict else 0

        feats = {
            "hops": hops,
            "missing_subject": is_missing("Subject"),
            "missing_to": is_missing("To"),
            "missing_content-type": is_missing("Content-Type"),
            "missing_mime-version": is_missing("MIME-Version"),
            "missing_x-mailer": missing_x_mailer,
            "missing_delivered-to": is_missing("Delivered-To"),
            "missing_list-unsubscribe": is_missing("List-Unsubscribe"),
            "missing_received-spf": is_missing("Received-SPF"),
            "missing_reply-to": missing_reply_to,
            "str_from_chevron": str_from_chevron,
            "str_to_chevron": str_to_chevron,
            "str_message-ID_dollar": str_message_id_dollar,
            "str_return-path_bounce": str_return_path_bounce,
            "str_content-type_texthtml": str_content_type_texthtml,
            "domain_match_from_return-path": domain_match("From", headers_dict.get("Return-Path", "")),
            "domain_match_to_from": domain_match_to_from,
            "domain_match_to_message-id": domain_match_to_message_id,
            "domain_match_from_reply-to": domain_match_from_reply_to,
            "domain_match_message-id_from": domain_match_message_id_from,
            "length_from": length_from,
            "num_recipients_to": num_recipients_to,
            "num_recipients_cc": num_recipients_cc,
            "time_zone": time_zone,
            "day_of_week": day_of_week,
            "span_time": span_time,
            "date_comp_date_received": date_comp_date_received,
            "content-encoding-val": content_encoding_val,
            "received_str_forged": received_str_forged,
            "number_replies": number_replies,
            "label": 0
        }

        # Kiểm tra xem tất cả các đặc trưng trong EMAIL_FEATURES (trừ 'label') có trong feats không
        missing_features = [f for f in EMAIL_FEATURES if f != "label" and f not in feats]
        if missing_features:
            logger.error(f"Các đặc trưng bị thiếu trong feats: {missing_features}")
            raise KeyError(f"Các đặc trưng bị thiếu: {missing_features}")

        df = pd.DataFrame([[feats[f] for f in EMAIL_FEATURES if f != "label"]], 
                         columns=[f for f in EMAIL_FEATURES if f != "label"])
        logger.info(f"Trích xuất đặc trưng email: {df.to_dict(orient='records')[0]}")
        return df
    except Exception as e:
        logger.error(f"Lỗi khi trích xuất đặc trưng từ {file_path}: {str(e)}")
        raise ValueError(f"Không thể trích xuất đặc trưng từ file email: {str(e)}")

@bp.route("/predict", methods=["POST"])
def predict_email():
    threshold = 0.5
    try:
        if "file" not in request.files or not request.files["file"].filename:
            return jsonify({"error": "Không có tệp được chọn"}), 400

        file = request.files["file"]
        filename = secure_filename(file.filename)
        if not allowed_file(filename):
            return jsonify({"error": "Loại tệp không hợp lệ. Chỉ chấp nhận file .eml"}), 400

        with temp_file(file, filename) as file_path:
            df = extract_email_features(file_path)
            rf_model = model_registry.load_model("random_forest_email", "pickle")
            rf_pred = rf_model.predict_proba(df)[:, 1][0]
            ensemble = compute_ensemble_score(rf_pred)
            result = "Phishing" if ensemble > threshold else "Legitimate"
            features_dict = df.to_dict(orient='records')[0]
            logger.info(f"Dự đoán cho {filename}: rf_confidence={rf_pred:.4f}, result={result}")
            return jsonify({
                "rf_confidence": round(float(rf_pred), 4),
                "result": result,
                "features": features_dict
            }), 200
    except ValueError as ve:
        logger.error(f"Lỗi khi xử lý tệp .eml {filename}: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Lỗi không xác định khi xử lý tệp .eml {filename}: {str(e)}")
        return jsonify({"error": f"Lỗi không xác định khi xử lý file .eml: {str(e)}"}), 500