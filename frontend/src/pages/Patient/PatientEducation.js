// frontend/src/pages/PatientEducation.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, AlertCircle, ExternalLink } from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const PatientEducation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "patient") {
          navigate("/login", { state: { message: t("please_login_access_page") } });
          return;
        }
        const res = await api.get("/patient/resources", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched resources:", res.data);
        setResources(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error("Fetch resources error:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || t("failed_load_resources");
        setError(errorMsg);
        if (errorMsg.includes("Token expired") || errorMsg.includes("Token verification error")) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login", { state: { message: t("session_expired") } });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [navigate, t]);

  const handleReadMore = (resource) => {
    console.log("Selected resource:", resource); // Debug URL
    setSelectedResource(resource);
  };

  const handleCloseDetail = () => {
    setSelectedResource(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-blue-700 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-black animate-pulse">{t("education_loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-blue-700 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-3xl font-extrabold text-blue-700 sm:text-4xl md:text-5xl animate-fade-in">
            {t("patient_education_title")}
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-base text-gray-600 sm:text-lg">
            {t("patient_education_subtitle")}
          </p>
          <BookOpen className="relative w-12 h-12 mx-auto mt-4 text-blue-500 animate-bounce-slow" />
        </div>

        {error && (
          <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard#contact")}
              className="px-4 py-2 mt-4 text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900"
            >
              {t("contact_provider")}
            </button>
          </div>
        )}

        <section className="mb-12">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-blue-100">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-blue-700 sm:text-2xl">
                  {t("educational_resources")}
                </h2>
                <BookOpen className="w-6 h-6 ml-2 text-blue-500" />
              </div>
            </div>
            {resources.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500">{t("no_resources_available")}</p>
                <p className="mt-2 text-gray-600">{t("ask_provider_for_content")}</p>
                <button
                  onClick={() => navigate("/dashboard#contact")}
                  className="px-4 py-2 mt-4 text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900"
                >
                  {t("contact_provider")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {resources.map((res) => (
                  <div
                    key={res._id}
                    className={`p-4 transition-all duration-300 border rounded-lg shadow-md hover:shadow-xl hover:scale-105 ${
                      res.source === "Admin" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-blue-700">{res.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          res.source === "Admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {res.source}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">By: {res.createdByName}</p>
                    <p className="mt-1 text-gray-600 line-clamp-3">{res.content}</p>
                    {res.url && (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-700 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t("view_resource")}
                      </a>
                    )}
                    <button
                      onClick={() => handleReadMore(res)}
                      className="inline-block mt-2 font-semibold text-blue-700 hover:underline"
                    >
                      {t("read_more")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-2xl animate-fade-in">
              <button
                onClick={handleCloseDetail}
                className="absolute text-gray-500 top-4 right-4 hover:text-gray-700"
              >
                ✕
              </button>
              <h3 className="mb-2 text-xl font-bold text-blue-700">{selectedResource.title}</h3>
              <p className="mb-2 text-sm text-gray-500">
                {t("source")}: {selectedResource.source} ({selectedResource.createdByName})
              </p>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedResource.content}</p>
                {selectedResource.url ? (
                  <a
                    href={selectedResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 font-semibold text-blue-700 hover:underline"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {t("view_external_resource")}
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">{t("no_URL")}</p>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 text-white transition duration-300 bg-blue-700 rounded-lg hover:bg-blue-900"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientEducation;