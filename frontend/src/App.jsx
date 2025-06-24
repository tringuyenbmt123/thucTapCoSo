import React, { useState } from 'react';
import Tabs from './components/Tabs';
import URLChecker from './components/URLChecker';
import ImageChecker from './components/ImageChecker';
import FileChecker from './components/FileChecker';
import EmailChecker from './components/EmailChecker';
import ResultDisplay from './components/ResultDisplay';
import FeaturesDisplay from './components/FeaturesDisplay';

const App = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [result, setResult] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'url', label: 'Kiểm Tra URL' },
    { id: 'image', label: 'Kiểm Tra Hình Ảnh' },
    { id: 'file', label: 'Kiểm Tra Tập Tin' },
    { id: 'email', label: 'Kiểm Tra Email' },
  ];

  const handleResult = (data, featuresData) => {
    setResult(data);
    setFeatures(featuresData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 text-shadow">
          Kiểm Tra Lừa Đảo - Bảo Vệ Bạn Trực Tuyến
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Nhập URL, tải hình ảnh, email hoặc tập tin để kiểm tra độ an toàn.
        </p>

        {/* Smaller Input Section */}
        <div className="max-w-3xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'url' && <URLChecker setLoading={setLoading} onResult={handleResult} />}
            {activeTab === 'image' && <ImageChecker setLoading={setLoading} onResult={handleResult} />}
            {activeTab === 'file' && <FileChecker setLoading={setLoading} onResult={handleResult} />}
            {activeTab === 'email' && <EmailChecker setLoading={setLoading} onResult={handleResult} />}
          </div>
        </div>
        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        {result && (
          <div className="max-w-7xl mx-auto rounded-lg p-6">
            <div className="flex flex-row space-x-4">
              {/* Left Side: Screenshot and Third-Party Evaluations */}
              <div className="w-2/5 p-4 bg-white border rounded-lg shadow"> 
                {result.screenshot_url && (
                  <div className="mb-4">
                    <p className="text-md font-semibold mb-2 text-gray-700">Ảnh chụp màn hình:</p>
                    <img src={result.screenshot_url} alt="Screenshot" className="w-full max-w-md rounded-lg border-2 border-gray-300 shadow-md" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá từ bên thứ ba</h3>
                <div className="space-y-4">
                  {result.third_party_eval?.virusTotal && (
                    <div className={`p-4 rounded-lg ${getColorClass(result.third_party_eval.virusTotal.status)} border`}>
                      <p className="text-md font-semibold">VirusTotal: <span className="font-bold">{result.third_party_eval.virusTotal.status}</span></p>
                      <p className="text-sm">{result.third_party_eval.virusTotal.details}</p>
                    </div>
                  )}
                  {result.third_party_eval?.googleSafeBrowsing && (
                    <div className={`p-4 rounded-lg ${getColorClass(result.third_party_eval.googleSafeBrowsing.status)} border`}>
                      <p className="text-md font-semibold">Google Safe Browsing: <span className="font-bold">{result.third_party_eval.googleSafeBrowsing.status}</span></p>
                      <p className="text-sm">{result.third_party_eval.googleSafeBrowsing.details}</p>
                    </div>
                  )}

                  {result.third_party_eval?.scanii && (
                  <div className={`p-4 rounded-lg ${getColorClass(result.third_party_eval.scanii.status)} border`}>
                    <p className="text-md font-semibold">Scanii: <span className="font-bold">{result.third_party_eval.scanii.status}</span></p>
                    <p className="text-sm">{result.third_party_eval.scanii.details}</p>
                  </div>
                )}

                </div>
              </div>

              {/* Right Side: Analysis Results and Characteristics */}
              <div className="w-3/5 p-4 bg-white border rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết quả phân tích</h2>
                
                {result.qr_results ? (
                  <div>
                    {result.qr_results.map((qr, index) => (
                      <div key={index} className={`p-4 rounded-lg mb-6 ${getColorClass(qr.prediction)} border`}>
                        <p className="text-lg font-semibold">URL từ mã QR: <span className="font-bold">{qr.qr_url}</span></p>
                        <p className="text-lg font-semibold">Phân loại: <span className="font-bold">{qr.prediction}</span></p>
                        <div className="mt-3">
                          <p className="text-md">Xác suất Phishing: <span className="font-bold text-lg">{qr.rf_confidence || 0}%</span></p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-red-600 h-3 rounded-full" style={{ width: `${qr.rf_confidence || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-md">Xác suất Hợp pháp: <span className="font-bold text-lg">{qr.legitimate_prob || 0}%</span></p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-green-600 h-3 rounded-full" style={{ width: `${qr.legitimate_prob || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg mb-6 ${getColorClass(activeTab === 'file' ? result.result : result.prediction)} border`}>
                    <p className="text-lg font-semibold">Phân loại: <span className="font-bold">{activeTab === 'file' ? result.result : result.prediction}</span></p>
                    <div className="mt-3">
                      <p className="text-md">Xác suất Phishing: <span className="font-bold text-lg">{result.rf_confidence || 0}%</span></p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{ width: `${result.rf_confidence || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-md">Xác suất Hợp pháp: <span className="font-bold text-lg">{result.legitimate_prob || 0}%</span></p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: `${result.legitimate_prob || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {features && !result.qr_results && <FeaturesDisplay features={features} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Assuming getColorClass is defined here for consistency
const getColorClass = (status) => {
  if (!status || typeof status !== 'string') return 'bg-gray-100 text-gray-700';

  switch (status.toLowerCase()) {
    case 'phishing':
    case 'nguy hiểm':
      return 'bg-red-100 text-red-600';
    case 'hợp pháp':
    case 'an toàn':
      return 'bg-green-100 text-green-700';
    case 'đang xử lý':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default App;