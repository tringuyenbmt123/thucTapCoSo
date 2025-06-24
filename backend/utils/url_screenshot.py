import base64
from playwright.sync_api import sync_playwright

def get_screenshot_base64(url):
    """Chụp màn hình URL và trả về chuỗi base64."""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            # Increase timeout and handle navigation errors
            response = page.goto(url, wait_until="networkidle", timeout=15000)
            if response and response.status != 200:
                raise Exception(f"Failed to load URL, status code: {response.status}")
            screenshot_bytes = page.screenshot()
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            browser.close()
            return screenshot_base64
    except Exception as e:
        print(f"Lỗi khi chụp màn hình: {e}")
        return None