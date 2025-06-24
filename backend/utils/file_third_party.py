import requests

# Khóa API của bạn
SCANII_API_KEY = "32eca24b70990ae32427c1fe256c1fba"
SCANII_API_SECRET = "80052915c"
SCANII_API_URL = "https://api.scanii.com/v2.1/files"

def check_scanii_from_file(file_bytes, filename="uploaded.pdf"):
    """
    Quét nội dung file với Scanii để phát hiện malware hoặc nội dung độc hại.

    :param file_bytes: Dữ liệu file ở dạng bytes (dùng file.read())
    :param filename: Tên file (chỉ để hiển thị, không ảnh hưởng kết quả)
    :return: dict chứa trạng thái và chi tiết
    """
    try:
        # Gửi file lên Scanii
        response = requests.post(
            SCANII_API_URL,
            auth=(SCANII_API_KEY, SCANII_API_SECRET),
            files={'file': (filename, file_bytes)}
        )
        response.raise_for_status()
        result = response.json()

        # Phân tích kết quả
        if result.get("findings"):
            threats = ", ".join([finding["type"] for finding in result["findings"]])
            return {
                "status": "Nguy hiểm",
                "details": f"Phát hiện: {threats}",
                "color": "red"
            }
        else:
            return {
                "status": "An toàn",
                "details": "Không phát hiện mối đe dọa.",
                "color": "green"
            }
    except Exception as e:
        print(f"[Scanii] Lỗi khi quét file: {e}")
        return {
            "status": "Lỗi",
            "details": "Không thể quét file bằng Scanii.",
            "color": "gray"
        }
