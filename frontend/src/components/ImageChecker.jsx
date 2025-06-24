import React, { useState, useRef } from 'react';

const ImageChecker = ({ setLoading, onResult }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert('Vui lòng chọn tệp hình ảnh!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('/api/image/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setLoading(false);
      onResult({ ...data, filename: file.name }, data.features || null);
    } catch (error) {
      setLoading(false);
      onResult({ error: error.message, filename: file.name }, null);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="w-full p-2 border rounded-lg mb-4"
      />
      {preview && (
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-2">Ảnh đã tải lên:</p>
          <img src={preview} alt="Ảnh tải lên" className="max-w-xs rounded-lg border shadow" />
        </div>
      )}
      <button
        onClick={handleUpload}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
      >
        Tải lên và kiểm tra
      </button>
    </div>
  );
};

export default ImageChecker;