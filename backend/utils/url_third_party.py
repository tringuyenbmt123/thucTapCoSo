import base64
import requests

VIRUSTOTAL_API_KEY = "6f18cf7ea43aacfc849ecde556378a4666b9f79c9dd875bb9e69b2955fc6ba67"
GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyA3r7GbF0swsjECuvQz5_1pwO0lNLp86t0"

def check_virustotal(url):
    """Kiểm tra URL với VirusTotal."""
    try:
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        endpoint = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        response = requests.get(endpoint, headers=headers)
        response.raise_for_status()
        data = response.json()
        stats = data["data"]["attributes"]["last_analysis_stats"]
        status = "An toàn" if stats["malicious"] == 0 else "Nguy hiểm"
        details = f"{stats['malicious']}/{stats['malicious'] + stats['harmless']} công cụ phát hiện mối đe dọa."
        color = "green" if stats["malicious"] == 0 else "red"
        return {"status": status, "details": details, "color": color}
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            try:
                endpoint = "https://www.virustotal.com/api/v3/urls"
                data = {"url": url}
                response = requests.post(endpoint, headers=headers, data=data)
                response.raise_for_status()
                return {
                    "status": "Đang xử lý",
                    "details": "URL đã được gửi để quét. Kiểm tra lại sau vài phút.",
                    "color": "yellow"
                }
            except Exception as e2:
                print(f"Lỗi khi gửi URL để quét: {e2}")
                return {"status": "Lỗi", "details": "Không thể gửi URL để quét.", "color": "gray"}
        else:
            print(f"Lỗi HTTP khi kiểm tra VirusTotal: {e}")
            return {"status": "Lỗi", "details": "Không thể kiểm tra VirusTotal.", "color": "gray"}
    except Exception as e:
        print(f"Lỗi khi kiểm tra VirusTotal: {e}")
        return {"status": "Lỗi", "details": "Không thể kiểm tra VirusTotal.", "color": "gray"}

def check_google_safe_browsing(url):
    """Kiểm tra URL với Google Safe Browsing."""
    try:
        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"
        payload = {
            "client": {"clientId": "URLPhishingChecker", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }
        response = requests.post(endpoint, json=payload)
        response.raise_for_status()
        data = response.json()
        if "matches" in data and data["matches"]:
            threat_types = ", ".join(match["threatType"] for match in data["matches"])
            status = "Nguy hiểm"
            details = f"Phát hiện mối đe dọa: {threat_types}"
            color = "red"
        else:
            status = "An toàn"
            details = "Không phát hiện mối đe dọa."
            color = "green"
        return {"status": status, "details": details, "color": color}
    except requests.exceptions.HTTPError as e:
        print(f"Lỗi HTTP khi kiểm tra Google Safe Browsing: {e}")
        return {"status": "Lỗi", "details": "Không thể kiểm tra Google Safe Browsing.", "color": "gray"}
    except Exception as e:
        print(f"Lỗi khi kiểm tra Google Safe Browsing: {e}")
        return {"status": "Lỗi", "details": "Không thể kiểm tra Google Safe Browsing.", "color": "gray"}