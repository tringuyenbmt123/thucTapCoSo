import React, { useState, useEffect } from "react";
import Tabs from "./components/Tabs";
import URLChecker from "./components/URLChecker";
import ImageChecker from "./components/ImageChecker";
import FileChecker from "./components/FileChecker";
import EmailChecker from "./components/EmailChecker";
import ResultDisplay from "./components/ResultDisplay";
import FeaturesDisplay from "./components/FeaturesDisplay";

const App = () => {
  const [activeTab, setActiveTab] = useState("url");
  const [result, setResult] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1200); // Hiệu ứng 1.2 giây
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const tabs = [
    { id: "url", label: "Kiểm Tra URL" },
    { id: "image", label: "Kiểm Tra Hình Ảnh" },
    { id: "file", label: "Kiểm Tra Tập Tin" },
    { id: "email", label: "Kiểm Tra Email" },
  ];

  const handleResult = (data, featuresData) => {
    setResult(data);
    setFeatures(featuresData);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-2xl font-semibold text-blue-600 animate-pulse dark:text-white">
          🔍 Đang tải ứng dụng...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-1000 ease-out transform ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4`}
    >
      <div className="mx-auto">
        {/* Nút chuyển giao diện */}
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 z-50 text-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-full shadow-md hover:shadow-lg transition duration-300 border border-gray-300 dark:border-gray-600"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>

        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white text-shadow">
          Kiểm Tra Lừa Đảo - Bảo Vệ Bạn Trực Tuyến
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
          Nhập URL, tải hình ảnh, email hoặc tập tin để kiểm tra độ an toàn.
        </p>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {activeTab === "url" && (
              <URLChecker setLoading={setLoading} onResult={handleResult} />
            )}
            {activeTab === "image" && (
              <ImageChecker setLoading={setLoading} onResult={handleResult} />
            )}
            {activeTab === "file" && (
              <FileChecker setLoading={setLoading} onResult={handleResult} />
            )}
            {activeTab === "email" && (
              <EmailChecker setLoading={setLoading} onResult={handleResult} />
            )}
          </div>
        </div>

        {loading && (
          <div className="max-w-7xl mx-auto rounded-lg p-6 animate-pulse transition-opacity duration-500">
            <div className="flex flex-row space-x-4">
              {/* Bên trái Skeleton */}
              <div className="w-2/5 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow space-y-4">
                <div className="h-40 bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-6 w-3/4 bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-4 w-full bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-4 w-full bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
              </div>

              {/* Bên phải Skeleton */}
              <div className="w-3/5 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow space-y-4">
                <div className="h-8 w-1/2 bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-6 w-3/4 bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-3 w-full bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-6 w-3/4 bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
                <div className="h-3 w-full bg-gray-400 dark:bg-gray-600 rounded opacity-90"></div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="max-w-7xl mx-auto rounded-lg p-6">
            <div className="flex flex-row space-x-4">
              {/* Bên trái */}
              <div className="w-2/5 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow">
                {result.screenshot_url && (
                  <div className="mb-4">
                    <p className="text-md font-semibold mb-2 text-gray-700 dark:text-white">
                      Ảnh chụp màn hình:
                    </p>
                    <img
                      src={result.screenshot_url}
                      alt="Screenshot"
                      className="w-full max-w-md rounded-lg border-2 border-gray-300 shadow-md"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Đánh giá từ bên thứ ba
                </h3>
                <div className="space-y-4">
                  {result.third_party_eval?.virusTotal && (
                    <div
                      className={`p-4 rounded-lg ${getColorClass(
                        result.third_party_eval.virusTotal.status
                      )} border`}
                    >
                      <p className="text-md font-semibold">
                        VirusTotal:{" "}
                        <span className="font-bold">
                          {result.third_party_eval.virusTotal.status}
                        </span>
                      </p>
                      <p className="text-sm">
                        {result.third_party_eval.virusTotal.details}
                      </p>
                    </div>
                  )}
                  {result.third_party_eval?.googleSafeBrowsing && (
                    <div
                      className={`p-4 rounded-lg ${getColorClass(
                        result.third_party_eval.googleSafeBrowsing.status
                      )} border`}
                    >
                      <p className="text-md font-semibold">
                        Google Safe Browsing:{" "}
                        <span className="font-bold">
                          {result.third_party_eval.googleSafeBrowsing.status}
                        </span>
                      </p>
                      <p className="text-sm">
                        {result.third_party_eval.googleSafeBrowsing.details}
                      </p>
                    </div>
                  )}
                  {result.third_party_eval?.scanii && (
                    <div
                      className={`p-4 rounded-lg ${getColorClass(
                        result.third_party_eval.scanii.status
                      )} border`}
                    >
                      <p className="text-md font-semibold">
                        Scanii:{" "}
                        <span className="font-bold">
                          {result.third_party_eval.scanii.status}
                        </span>
                      </p>
                      <p className="text-sm">
                        {result.third_party_eval.scanii.details}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bên phải */}
              <div className="w-3/5 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Kết quả phân tích
                </h2>
                {result.qr_results ? (
                  <div>
                    {result.qr_results.map((qr, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg mb-6 ${getColorClass(
                          qr.prediction
                        )} border`}
                      >
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          URL từ mã QR:{" "}
                          <span className="font-bold">{qr.qr_url}</span>
                        </p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          Phân loại:{" "}
                          <span className="font-bold">{qr.prediction}</span>
                        </p>
                        <div className="mt-3">
                          <p className="text-md text-gray-700 dark:text-gray-200">
                            Xác suất Phishing:{" "}
                            <span className="font-bold text-lg">
                              {qr.rf_confidence || 0}%
                            </span>
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-red-600 h-3 rounded-full"
                              style={{ width: `${qr.rf_confidence || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-md text-gray-700 dark:text-gray-200">
                            Xác suất Hợp pháp:{" "}
                            <span className="font-bold text-lg">
                              {qr.legitimate_prob || 0}%
                            </span>
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full"
                              style={{ width: `${qr.legitimate_prob || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-lg mb-6 ${getColorClass(
                      activeTab === "file" ? result.result : result.prediction
                    )} border`}
                  >
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      Phân loại:{" "}
                      <span className="font-bold">
                        {activeTab === "file"
                          ? result.result
                          : result.prediction}
                      </span>
                    </p>
                    <div className="mt-3">
                      <p className="text-md text-gray-700 dark:text-gray-200">
                        Xác suất Phishing:{" "}
                        <span className="font-bold text-lg">
                          {result.rf_confidence || 0}%
                        </span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-600 h-3 rounded-full"
                          style={{ width: `${result.rf_confidence || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-md text-gray-700 dark:text-gray-200">
                        Xác suất Hợp pháp:{" "}
                        <span className="font-bold text-lg">
                          {result.legitimate_prob || 0}%
                        </span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${result.legitimate_prob || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {features && !result.qr_results && (
                  <FeaturesDisplay features={features} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getColorClass = (status) => {
  if (!status || typeof status !== "string")
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white";
  switch (status.toLowerCase()) {
    case "phishing":
    case "nguy hiểm":
      return "bg-red-100 text-red-600 dark:bg-red-700 dark:text-white";
    case "hợp pháp":
    case "an toàn":
      return "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white";
    case "đang xử lý":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white";
  }
};

export default App;
