import pickle
import pandas as pd
from .url_features import extract_features

def load_model(model_path):
    """Tải mô hình từ file."""
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        print(f"Lỗi khi tải mô hình: {e}")
        return None

def predict_url(model, url):
    """Dự đoán phân loại URL."""
    try:
        features = extract_features(url)
        X_new = pd.DataFrame([features])
        feature_names = model.feature_names_in_
        common_columns = [col for col in X_new.columns if col in feature_names]
        X_new = X_new[common_columns]
        prob = model.predict_proba(X_new)[0]
        phishing_prob = prob[1]
        legitimate_prob = prob[0]
        prediction = "Phishing" if phishing_prob > legitimate_prob else "Hợp pháp"
        return prediction, phishing_prob, legitimate_prob, features
    except Exception as e:
        print(f"Lỗi khi dự đoán URL '{url}': {e}")
        return "Lỗi", 0, 0, features