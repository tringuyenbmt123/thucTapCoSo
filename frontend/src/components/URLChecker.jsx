import React, { useState } from 'react';

const URLChecker = ({ setLoading, onResult }) => {
  const [url, setUrl] = useState('');

  const validateURL = (input) => {
    let formattedUrl = input.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    const urlPattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
    return urlPattern.test(formattedUrl) ? formattedUrl : null;
  };

  const handleCheck = async () => {
    const validatedUrl = validateURL(url);
    if (!validatedUrl) {
      alert('Vui lòng nhập URL hợp lệ (ví dụ: https://example.com)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/url/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validatedUrl }),
      });
      const data = await response.json();
      setLoading(false);
      onResult(data, data.features || null);
    } catch (error) {
      setLoading(false);
      onResult({ error: error.message }, null);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Nhập URL (ví dụ: https://example.com)"
        className="w-full p-2 border rounded-lg mb-4"
      />
      <button
        onClick={handleCheck}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
      >
        Kiểm tra ngay
      </button>
    </div>
  );
};

export default URLChecker;