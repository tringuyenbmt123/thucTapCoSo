import os
import pickle
import tensorflow as tf
from sklearn.ensemble import RandomForestClassifier
import logging

logger = logging.getLogger(__name__)

class ModelRegistry:
    def __init__(self, model_dir: str):
        self.model_dir = model_dir
        self.models = {}
    
    def load_model(self, model_name: str, model_type: str):
        key = f"{model_name}_{model_type}"
        if key not in self.models:
            try:
                model_path = os.path.join(self.model_dir, f"{model_name}.{'pkl' if model_type != 'keras' else 'keras'}")
                if not os.path.exists(model_path):
                    raise FileNotFoundError(f"Tệp mô hình {model_path} không tồn tại")
                if model_type == "pickle":
                    model = pickle.load(open(model_path, "rb"))
                    if not isinstance(model, RandomForestClassifier):
                        raise TypeError(f"Đối tượng tải từ {model_path} không phải là RandomForestClassifier")
                elif model_type == "keras":
                    model = tf.keras.models.load_model(model_path)
                self.models[key] = model
                logger.info(f"Đã tải mô hình: {key}")
            except Exception as e:
                logger.error(f"Không thể tải mô hình {key}: {e}")
                raise
        return self.models[key]