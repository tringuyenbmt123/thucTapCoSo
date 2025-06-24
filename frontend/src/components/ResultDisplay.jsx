import React from 'react';

const ResultDisplay = ({ result }) => {
  if (!result) return null;
  if (result.error) return <div className="text-red-600 p-4 bg-red-100 rounded-lg mt-4">{result.error}</div>;

  const getColorClass = (status) => {
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

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-lg border border-gray-300">
      <div className="flex flex-row space-x-6">
        {/* Left Side: Analysis Results and Characteristics */}
        <div className="w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết quả phân tích</h2>
          <div className={`p-4 rounded-lg mb-6 ${getColorClass(result.prediction)}`}>
            <p className="text-lg font-semibold">Phân loại: <span className="font-bold">{result.prediction}</span></p>
            <div className="mt-2">
              <p className="text-md">Xác suất Phishing: <span className="font-bold text-lg">{result.rf_confidence}%</span></p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${result.rf_confidence}%` }}></div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-md">Xác suất Hợp pháp: <span className="font-bold text-lg">{result.legitimate_prob}%</span></p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${result.legitimate_prob}%` }}></div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Đặc trưng của URL</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p>url_length: {result.url_length}</p>
            <p>num_special_chars: {result.num_special_chars}</p>
            <p>is_https: {result.is_https}</p>
            <p>num_digits: {result.num_digits}</p>
            <p>domain_length: {result.domain_length}</p>
            <p>num_subdomains: {result.num_subdomains}</p>
            <p>num_dashes: {result.num_dashes}</p>
            <p>path_length: {result.path_length}</p>
          </div>
        </div>

        {/* Right Side: Screenshot and Third-Party Evaluations */}
        <div className="w-1/2">
          {result.screenshot_url && (
            <div className="mb-6">
              <p className="text-gray-700 font-semibold mb-3">Ảnh chụp màn hình:</p>
              <img src={result.screenshot_url} alt="Screenshot" className="w-full max-w-2xl rounded-lg border-2 border-gray-300 shadow-md" />
            </div>
          )}
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá từ bên thứ ba</h3>
          <div className="space-y-5">
            {result.third_party_eval?.virusTotal && (
              <div className={`p-4 rounded-lg ${getColorClass(result.third_party_eval.virusTotal.status)}`}>
                <p className="text-md font-semibold">VirusTotal: <span className="font-bold">{result.third_party_eval.virusTotal.status}</span></p>
                <p className="text-sm">{result.third_party_eval.virusTotal.details}</p>
              </div>
            )}
            {result.third_party_eval?.googleSafeBrowsing && (
              <div className={`p-4 rounded-lg ${getColorClass(result.third_party_eval.googleSafeBrowsing.status)}`}>
                <p className="text-md font-semibold">Google Safe Browsing: <span className="font-bold">{result.third_party_eval.googleSafeBrowsing.status}</span></p>
                <p className="text-sm">{result.third_party_eval.googleSafeBrowsing.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;