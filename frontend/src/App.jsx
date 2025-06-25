import React, { useState, useEffect } from "react";
import Tabs from "./components/Tabs";
import URLChecker from "./components/URLChecker";
import ImageChecker from "./components/ImageChecker";
import FileChecker from "./components/FileChecker";
import EmailChecker from "./components/EmailChecker";
import FeaturesDisplay from "./components/FeaturesDisplay";
import "boxicons/css/boxicons.min.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("url");
  const [tabResults, setTabResults] = useState({
    url: { result: null, features: null },
    image: { result: null, features: null },
    file: { result: null, features: null },
    email: { result: null, features: null },
  });
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("headers");
  const [urlToCheck, setUrlToCheck] = useState("");
  const [triggerCheck, setTriggerCheck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (activeTab !== "url") {
      setUrlToCheck("");
      setTriggerCheck(false);
    }
  }, [activeTab]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const tabs = [
    { id: "url", label: "Kiểm Tra URL" },
    { id: "image", label: "Kiểm Tra Hình Ảnh" },
    { id: "file", label: "Kiểm Tra Tập File" },
    { id: "email", label: "Kiểm Tra Email" },
  ];

  const analysisTabs = [
    { id: "headers", label: "Headers" },
    { id: "received", label: "Received Lines" },
    { id: "x_headers", label: "X-Headers" },
    { id: "security", label: "Security" },
  ];

  const handleResult = (data, featuresData) => {
    console.log('handleResult called with data:', data);
    setTabResults((prev) => ({
      ...prev,
      [activeTab]: { result: data, features: featuresData },
    }));
    setTriggerCheck(false);

    if (activeTab === "image" && data.qr_results && data.qr_results.length > 0) {
      const qrUrl = data.qr_results[0].qr_url;
      console.log('QR URL detected:', qrUrl, 'Result:', data.qr_results[0]);
      if (qrUrl) {
        // Use QR code result directly in URL tab
        setTabResults((prev) => ({
          ...prev,
          url: { result: { ...data.qr_results[0], url: qrUrl }, features: featuresData },
        }));
        setUrlToCheck(qrUrl);
        setActiveTab("url");
        // No need to trigger check since we're reusing the result
      }
    }
  };

  const handleSwitchToURLCheck = (urlDomain) => {
    const fullUrl = `https://${urlDomain}`;
    setTabResults((prev) => ({
      ...prev,
      url: { result: null, features: null },
    }));
    setUrlToCheck(fullUrl);
    setActiveTab("url");
    setTriggerCheck(true);
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
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 z-50 text-2xl text-gray-700 dark:text-gray-200 p-2 hover:scale-110 transition duration-300"
        >
          <i className={`bx ${darkMode ? "bx-sun" : "bx-moon"} text-2xl`}></i>
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
              <URLChecker
                setLoading={setLoading}
                onResult={handleResult}
                urlToCheck={urlToCheck}
                triggerCheck={triggerCheck}
              />
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
          <div className="max-w-7xl mx-auto rounded-lg p-6">
            <div className="flex flex-row space-x-4">
              <div className="w-1/2 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow">
                <div
                  className="loading"
                  style={{ height: "200px", width: "100%", borderRadius: "5px" }}
                ></div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 mt-4">
                  Phân tích chi tiết
                </h3>
                <div className="space-y-4">
                  <div
                    className="loading"
                    style={{ height: "80px", width: "100%", borderRadius: "5px" }}
                  ></div>
                  <div
                    className="loading"
                    style={{ height: "80px", width: "100%", borderRadius: "5px" }}
                  ></div>
                  <div
                    className="loading"
                    style={{ height: "80px", width: "100%", borderRadius: "5px" }}
                  ></div>
                </div>
              </div>
              <div className="w-1/2 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow">
                <div
                  className="loading"
                  style={{ height: "600px", width: "100%", borderRadius: "5px" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {!loading && tabResults[activeTab].result && (
          <div
            className="max-w-7xl mx-auto rounded-lg p-6 transition-opacity duration-500 opacity-100"
            style={{ animation: "fadeIn 0.5s ease-in-out" }}
          >
            <div className="flex flex-row space-x-4">
              <div className="w-2/5 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow">
                {(activeTab === "url" || activeTab === "file" || activeTab === "email") && (
                  <>
                    {activeTab === "url" && tabResults[activeTab].result.screenshot_url && (
                      <div className="mb-4">
                        <p className="text-md font-semibold mb-2 text-gray-700 dark:text-white">
                          Ảnh chụp màn hình:
                        </p>
                        <img
                          src={tabResults[activeTab].result.screenshot_url}
                          alt="Screenshot"
                          className="w-full max-w-md rounded-lg border-2 border-gray-300 shadow-md"
                        />
                      </div>
                    )}

                    {activeTab === "email" && tabResults[activeTab].result.email_details && (
                      <>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                          Phân tích chi tiết
                        </h3>
                        <div className="mb-4">
                          <Tabs
                            tabs={analysisTabs}
                            activeTab={activeAnalysisTab}
                            setActiveTab={setActiveAnalysisTab}
                          />
                        </div>
                        {activeAnalysisTab === "headers" && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                              Headers
                            </h4>
                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                              <li>
                                <strong>From:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.From || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Display Name:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.DisplayName || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Sender:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.Sender || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>To:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.To || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>CC:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.CC || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>In-Reply-To:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers["In-Reply-To"] || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Timestamp:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.Timestamp || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Reply-To:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers["Reply-To"] || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Message-ID:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers["Message-ID"] || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Return-Path:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers["Return-Path"] || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>Originating IP:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.OriginatingIP || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                              <li>
                                <strong>rDNS:</strong>{" "}
                                {tabResults[activeTab].result.email_details.headers.rDNS || (
                                  <span className="italic text-gray-400">None</span>
                                )}
                              </li>
                            </ul>
                          </div>
                        )}
                        {activeAnalysisTab === "received" && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                              Received Lines
                            </h4>
                            <div className="space-y-4">
                              {tabResults[activeTab].result.email_details.received_lines.map(
                                (hop, index) => (
                                  <div key={index} className="p-2 border rounded">
                                    <p>
                                      <strong>{hop.Hop}:</strong>
                                    </p>
                                    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                                      <li>
                                        <strong>Timestamp:</strong>{" "}
                                        {hop.Timestamp || (
                                          <span className="italic text-gray-400">None</span>
                                        )}
                                      </li>
                                      <li>
                                        <strong>Received From:</strong>{" "}
                                        {hop.ReceivedFrom || (
                                          <span className="italic text-gray-400">None</span>
                                        )}
                                      </li>
                                      <li>
                                        <strong>Received By:</strong>{" "}
                                        {hop.ReceivedBy || (
                                          <span className="italic text-gray-400">None</span>
                                        )}
                                      </li>
                                    </ul>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {activeAnalysisTab === "x_headers" && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                              X-Headers
                            </h4>
                            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                              <li>
                                <strong>X-Priority:</strong>{" "}
                                {tabResults[activeTab].result.email_details.x_headers[
                                  "x-priority"
                                ] || <span className="italic text-gray-400">None</span>}
                              </li>
                              <li>
                                <strong>X-MSMail-Priority:</strong>{" "}
                                {tabResults[activeTab].result.email_details.x_headers[
                                  "x-msmail-priority"
                                ] || <span className="italic text-gray-400">None</span>}
                              </li>
                              <li>
                                <strong>X-OriginalArrivalTime:</strong>{" "}
                                {tabResults[activeTab].result.email_details.x_headers[
                                  "x-originalarrivaltime"
                                ] || <span className="italic text-gray-400">None</span>}
                              </li>
                            </ul>
                          </div>
                        )}
                        {activeAnalysisTab === "security" && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                              Security
                            </h4>
                            <div className="ml-4">
                              <h5 className="font-semibold text-gray-800 dark:text-white">SPF</h5>
                              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                                <li>
                                  <strong>Result:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.SPF
                                    .Result || <span className="italic text-gray-400">None</span>}
                                </li>
                                <li>
                                  <strong>Originating IP:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.SPF
                                    .OriginatingIP || (
                                    <span className="italic text-gray-400">None</span>
                                  )}
                                </li>
                                <li>
                                  <strong>rDNS:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.SPF.rDNS || (
                                    <span className="italic text-gray-400">None</span>
                                  )}
                                </li>
                                <li>
                                  <strong>Return-Path Domain:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.SPF
                                    .ReturnPathDomain || (
                                    <span className="italic text-gray-400">None</span>
                                  )}
                                </li>
                                <li>
                                  <strong>SPF Record:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.SPF
                                    .SPFRecord || <span className="italic text-gray-400">None</span>}
                                </li>
                              </ul>
                              <h5 className="font-semibold mt-2 text-gray-800 dark:text-white">
                                DKIM
                              </h5>
                              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                                <li>
                                  <strong>Result:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.DKIM
                                    .Result || <span className="italic text-gray-400">None</span>}
                                </li>
                                <li>
                                  <strong>Verifications:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.DKIM
                                    .Verifications || (
                                    <span className="italic text-gray-400">None</span>
                                  )}
                                </li>
                              </ul>
                              <h5 className="font-semibold mt-2 text-gray-800 dark:text-white">
                                DMARC
                              </h5>
                              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                                <li>
                                  <strong>Result:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.DMARC
                                    .Result || <span className="italic text-gray-400">None</span>}
                                </li>
                                <li>
                                  <strong>From Domain:</strong>{" "}
                                  {tabResults[activeTab].result.email_details.security.DMARC
                                    .FromDomain || (
                                    <span className="italic text-gray-400">None</span>
                                  )}
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                          {tabResults[activeTab].result.email_details.urls === null ||
                          tabResults[activeTab].result.email_details.urls.length === 0 ? (
                            <p className="text-md font-semibold text-gray-700 dark:text-white">
                              Không phát hiện URL trong email
                            </p>
                          ) : (
                            <div>
                              <p className="text-md font-semibold mb-2 text-gray-700 dark:text-white">
                                Phát hiện URL trong email:
                              </p>
                              <ul className="space-y-2">
                                {tabResults[activeTab].result.email_details.urls.map(
                                  (url, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <a
                                        href={`https://${url.Domain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                      >
                                        https://{url.Domain}
                                      </a>
                                      <button
                                        onClick={() => handleSwitchToURLCheck(url.Domain)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm relative group"
                                        title="Chuyển sang kiểm tra URL"
                                      >
                                        Kiểm tra
                                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                          Chuyển sang kiểm tra URL
                                        </span>
                                      </button>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 mt-4">
                      Đánh giá từ bên thứ ba
                    </h3>
                    <div className="space-y-4">
                      {tabResults[activeTab].result.third_party_eval?.virusTotal && (
                        <div
                          className={`p-4 rounded-lg ${getColorClass(
                            tabResults[activeTab].result.third_party_eval.virusTotal.status
                          )} border`}
                        >
                          <p className="text-md font-semibold text-gray-700 dark:text-white">
                            VirusTotal:{" "}
                            <span className="font-bold">
                              {tabResults[activeTab].result.third_party_eval.virusTotal.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {tabResults[activeTab].result.third_party_eval.virusTotal.details || (
                              <span className="italic text-gray-400">None</span>
                            )}
                          </p>
                        </div>
                      )}
                      {tabResults[activeTab].result.third_party_eval?.googleSafeBrowsing && (
                        <div
                          className={`p-4 rounded-lg ${getColorClass(
                            tabResults[activeTab].result.third_party_eval.googleSafeBrowsing.status
                          )} border`}
                        >
                          <p className="text-md font-semibold text-gray-700 dark:text-white">
                            Google Safe Browsing:{" "}
                            <span className="font-bold">
                              {tabResults[activeTab].result.third_party_eval.googleSafeBrowsing
                                .status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {tabResults[activeTab].result.third_party_eval.googleSafeBrowsing
                              .details || <span className="italic text-gray-400">None</span>}
                          </p>
                        </div>
                      )}
                      {tabResults[activeTab].result.third_party_eval?.scanii && (
                        <div
                          className={`p-4 rounded-lg ${getColorClass(
                            tabResults[activeTab].result.third_party_eval.scanii.status
                          )} border`}
                        >
                          <p className="text-md font-semibold text-gray-700 dark:text-white">
                            Scanii:{" "}
                            <span className="font-bold">
                              {tabResults[activeTab].result.third_party_eval.scanii.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {tabResults[activeTab].result.third_party_eval.scanii.details || (
                              <span className="italic text-gray-400">None</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div
                className={`${
                  activeTab !== "image" ? "w-3/5" : "w-full"
                } p-4 bg-white dark:bg-gray-800 border rounded-lg shadow`}
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Kết quả phân tích
                </h2>
                {tabResults[activeTab].result.qr_results ? (
                  <div>
                    {tabResults[activeTab].result.qr_results.map((qr, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg mb-6 ${getColorClass(qr.prediction)} border`}
                      >
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          URL từ mã QR: <span className="font-bold">{qr.qr_url}</span>
                        </p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          Phân loại: <span className="font-bold">{qr.prediction}</span>
                        </p>
                        <div className="mt-3">
                          <p className="text-md text-gray-700 dark:text-gray-200">
                            Xác suất Phishing:{" "}
                            <span className="font-bold text-lg">{qr.rf_confidence || 0}%</span>
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className="bg-red-600 h-3 rounded-full"
                              style={{ width: `${qr.rf_confidence || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-md text-gray-700 dark:text-gray-200">
                            Xác suất Hợp pháp:{" "}
                            <span className="font-bold text-lg">{qr.legitimate_prob || 0}%</span>
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full"
                              style={{ width: `${qr.legitimate_prob || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeTab === "email" && tabResults[activeTab].result.email_details ? (
                  <div>
                    <div
                      className={`p-4 rounded-lg mb-6 ${getColorClass(
                        tabResults[activeTab].result.result
                      )} border`}
                    >
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        Phân loại: <span className="font-bold">{tabResults[activeTab].result.result}</span>
                      </p>
                      <div className="mt-3">
                        <p className="text-md text-gray-700 dark:text-gray-200">
                          Xác suất Phishing:{" "}
                          <span className="font-bold text-lg">
                            {tabResults[activeTab].result.rf_confidence || 0}%
                          </span>
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-red-600 h-3 rounded-full"
                            style={{ width: `${tabResults[activeTab].result.rf_confidence || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-md text-gray-700 dark:text-gray-200">
                          Xác suất Hợp pháp:{" "}
                          <span className="font-bold text-lg">
                            {tabResults[activeTab].result.legitimate_prob || 0}%
                          </span>
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-green-600 h-3 rounded-full"
                            style={{ width: `${tabResults[activeTab].result.legitimate_prob || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-lg mb-6 ${getColorClass(
                      activeTab === "file"
                        ? tabResults[activeTab].result.result
                        : tabResults[activeTab].result.prediction ||
                          tabResults[activeTab].result.result
                    )} border`}
                  >
                    {activeTab === "url" && tabResults[activeTab].result.url && (
                      <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        URL: <span className="font-bold">{tabResults[activeTab].result.url}</span>
                      </p>
                    )}
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      Phân loại:{" "}
                      <span className="font-bold">
                        {activeTab === "file"
                          ? tabResults[activeTab].result.result
                          : tabResults[activeTab].result.prediction ||
                            tabResults[activeTab].result.result}
                      </span>
                    </p>
                    <div className="mt-3">
                      <p className="text-md text-gray-400 dark:text-gray-500">
                        Xác suất Phishing:{" "}
                        <span className="font-bold text-lg">
                          {tabResults[activeTab].result.rf_confidence || 0}%
                        </span>
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div
                          className="bg-red-600 h-3 rounded-full"
                          style={{ width: `${tabResults[activeTab].result.rf_confidence || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-md text-gray-400 dark:text-gray-500">
                        Xác suất Hợp pháp:{" "}
                        <span className="font-bold text-lg">
                          {tabResults[activeTab].result.legitimate_prob || 0}%
                        </span>
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${tabResults[activeTab].result.legitimate_prob || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {tabResults[activeTab].features && !tabResults[activeTab].result.qr_results && (
                  <FeaturesDisplay features={tabResults[activeTab].features} />
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

const styles = `
  .loading {
    background: #d3d3d3 !important;
    position: relative;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
  }
  .loading::before {
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(to right, rgba(240, 240, 240, 0.7), transparent) !important;
    animation: loading_wave linear 1s infinite;
    transform: translateX(-100%);
  }
  @keyframes loading_wave {
    100% {
      transform: translateX(100%);
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .transition-opacity {
    transition: opacity 0.5s ease-in-out;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default App;