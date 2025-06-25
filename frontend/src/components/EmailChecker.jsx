import React, { useState, useRef } from 'react';

const EmailChecker = ({ setLoading, onResult }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.name.endsWith('.eml')) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.eml')) {
      fileInputRef.current.files = e.dataTransfer.files; // cần để upload
      handleFile(file);
    } else {
      alert('Chỉ chấp nhận tệp .eml!');
    }
  };

  return (
    <div>
      <div
        className={`mb-4 border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-gray-700'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 text-center">
          Kéo và thả tệp `.eml` vào đây hoặc:
        </label>
        <div className="flex justify-center">
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer transition duration-300">
            📁 Chọn tệp
            <input
              type="file"
              accept=".eml"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="text-center mt-2 text-gray-500 dark:text-gray-400 text-sm">
          {selectedFile ? selectedFile.name : "Không có tệp nào được chọn"}
        </div>
      </div>

      <button
        onClick={handleUpload}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
         Tải lên và kiểm tra
      </button>
    </div>
  );
};

export default EmailChecker;
