from flask import Blueprint, request, jsonify
import pandas as pd
from utils.model_registry import ModelRegistry
from utils.common import compute_ensemble_score
from utils.url_features import extract_features
from utils.url_prediction import load_model, predict_url
from utils.url_screenshot import get_screenshot_base64
from utils.url_third_party import check_virustotal, check_google_safe_browsing
import logging
import os

bp = Blueprint("url", __name__)
logger = logging.getLogger(__name__)
model_registry = ModelRegistry(os.getenv("MODEL_DIR", "models"))
URL_FEATURES = [
    'url_length', 'num_special_chars', 'is_https', 'num_digits', 'domain_length',
    'num_subdomains', 'num_dashes', 'path_length', 'query_length', 'has_ip',
    'has_at_symbol', 'redirect_count', 'num_letters_in_domain', 'num_numbers_in_domain',
    'letter_to_number_ratio', 'has_phishing_keywords', 'num_query_params',
    'query_string_complexity', 'unicode_in_url'
]

@bp.route("/predict", methods=["POST"])
def predict_url_endpoint():
    threshold = 0.5
    try:
        data = request.get_json(silent=True)
        if not data or ("url" not in data and "text" not in data):
            return jsonify({"error": "URL hoặc text là bắt buộc"}), 400

        input_text = data.get("url", data.get("text", "")).strip()
        if not input_text:
            return jsonify({"error": "URL hoặc text là bắt buộc"}), 400

        # Dự đoán bằng mô hình
        rf_model = model_registry.load_model("random_forest_URL", "pickle")
        if rf_model is None:
            return jsonify({"error": "Không thể tải mô hình"}), 500

        prediction, phishing_prob, legitimate_prob, features = predict_url(rf_model, input_text)
        ensemble = compute_ensemble_score(phishing_prob)
        result = "Phishing" if ensemble > threshold else "Hợp pháp"
        features_dict = {k: v for k, v in features.items() if k in URL_FEATURES}

        # Chụp màn hình with improved error handling
        screenshot_base64 = get_screenshot_base64(input_text)
        if screenshot_base64:
            screenshot_url = f"data:image/png;base64,{screenshot_base64}"
        else:
            screenshot_url = "https://via.placeholder.com/400?text=Không+thể+chụp+màn+hình"
            logger.warning(f"Failed to capture screenshot for URL: {input_text}")

        # Đánh giá bên thứ ba
        third_party_eval = {
            "virusTotal": check_virustotal(input_text),
            "googleSafeBrowsing": check_google_safe_browsing(input_text)
        }

        logger.info(f"Dự đoán cho URL/text '{input_text}': rf_confidence={phishing_prob:.4f}, result={result}")
        return jsonify({
            "prediction": result,
            "rf_confidence": round(float(phishing_prob) * 100, 2),
            "legitimate_prob": round(float(legitimate_prob) * 100, 2),
            "features": features_dict,
            "screenshot_url": screenshot_url,
            "third_party_eval": third_party_eval
        }), 200
    except Exception as e:
        logger.error(f"Lỗi khi xử lý URL/text: {e}")
        return jsonify({"error": f"Lỗi khi xử lý URL/text: {str(e)}"}), 500