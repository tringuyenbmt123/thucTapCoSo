import re
from urllib.parse import urlparse

def extract_features(url):
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url

        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        path = parsed_url.path
        query = parsed_url.query

        if not domain:
            raise ValueError(f"Invalid URL: {url}")

        features = {
            'url_length': len(url),
            'num_special_chars': len(re.findall(r'[?|#|=|&]', url)),
            'is_https': 1 if parsed_url.scheme == "https" else 0,
            'num_digits': len(re.findall(r'\d', url)),
            'domain_length': len(domain),
            'num_subdomains': max(len(domain.split('.')) - 2, 0),
            'num_dashes': domain.count('-'),
            'path_length': len(path),
            'query_length': len(query),
            'has_ip': 1 if re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', domain) else 0,
            'has_at_symbol': 1 if '@' in url else 0,
            'redirect_count': url.count('http') - 1,
            'num_letters_in_domain': len(re.sub(r'[^a-zA-Z]', '', domain)),
            'num_numbers_in_domain': len(re.sub(r'[^0-9]', '', domain)),
            'letter_to_number_ratio': len(re.sub(r'[^a-zA-Z]', '', domain)) / (len(re.sub(r'[^0-9]', '', domain)) + 1) if len(re.sub(r'[^0-9]', '', domain)) > 0 else 0,
            'has_phishing_keywords': 1 if any(keyword in domain.lower() for keyword in ['login', 'secure', 'account', 'password', 'signin', 'update', 'verify']) else 0,
            'num_query_params': len(query.split('&')) if query else 0,
            'query_string_complexity': len(re.findall(r'=', query)) if query else 0,
            'unicode_in_url': 1 if any(ord(c) > 127 for c in url) else 0
        }
        return features
    except Exception as e:
        print(f"Lỗi khi trích xuất đặc trưng từ URL '{url}': {e}")
        return {k: -1 for k in ['url_length', 'num_special_chars', 'is_https', 'num_digits', 'domain_length',
                                'num_subdomains', 'num_dashes', 'path_length', 'query_length', 'has_ip',
                                'has_at_symbol', 'redirect_count', 'num_letters_in_domain', 'num_numbers_in_domain',
                                'letter_to_number_ratio', 'has_phishing_keywords', 'num_query_params',
                                'query_string_complexity', 'unicode_in_url']}