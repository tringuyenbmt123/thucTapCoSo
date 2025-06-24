import React, { useRef } from 'react';

const EmailChecker = ({ setLoading, onResult }) => {
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert('Vui lòng chọn tệp email (.eml)!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('/api/email/predict', {
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
        accept=".eml"
        ref={fileInputRef}
        className="w-full p-2 border rounded-lg mb-4"
      />
      <button
        onClick={handleUpload}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
      >
        Tải lên và kiểm tra
      </button>
    </div>
  );
};

export default EmailChecker;