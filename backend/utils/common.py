from contextlib import contextmanager
import os
import numpy as np
import cv2
import tensorflow as tf
import logging

logger = logging.getLogger(__name__)

def compute_ensemble_score(rf_prob: float, cnn_prob: float = None) -> float:
    if cnn_prob is not None:
        return (rf_prob + cnn_prob) / 2
    return rf_prob

def preprocess_image_for_cnn(image: np.ndarray, img_size: tuple = (128, 128)) -> np.ndarray:
    try:
        image = cv2.resize(image, img_size)
        image = image.astype("float32")
        image = tf.keras.applications.efficientnet.preprocess_input(image)
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        logger.error(f"Lỗi khi tiền xử lý hình ảnh: {e}")
        raise ValueError(f"Không thể tiền xử lý hình ảnh: {str(e)}")

@contextmanager
def temp_file(file, filename: str):
    file_path = os.path.join(os.getenv("UPLOAD_FOLDER", "./Uploads"), filename)
    try:
        file.save(file_path)
        yield file_path
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.debug(f"Đã dọn dẹp tệp: {file_path}")
            except Exception as e:
                logger.error(f"Không thể dọn dẹp tệp {file_path}: {e}")