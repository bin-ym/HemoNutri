import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, ExternalLink, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const PatientEducation = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || localStorage.getItem("role") !== "patient") {
          navigate("/login");
          return;
        }
        const res = await api.get("/patient/resources");
        setResources(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [navigate]);

  const handleReadMore = (resource) => {
    setSelectedResource(resource);
  };

  const handleCloseDetail = () => {
    setSelectedResource(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-teal-700 animate-pulse">
              Loading your resources...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
        <Navbar role="patient" />
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md p-6 border border-red-200 rounded-lg shadow-md bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-lg text-red-600">{error}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard#contact")}
              className="px-4 py-2 mt-4 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              Contact Provider
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      <Navbar role="patient" />
      <div className="flex-grow max-w-6xl p-6 mx-auto">
        {/* Header */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 h-32 bg-teal-600 rounded-b-full -top-8 opacity-10 blur-2xl"></div>
          <h1 className="relative text-4xl font-extrabold text-teal-700 md:text-5xl animate-fade-in">
            Patient Education
          </h1>
          <p className="relative max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Explore personalized resources to empower your health journey.
          </p>
          <BookOpen className="relative w-12 h-12 mx-auto mt-4 text-teal-500 animate-bounce-slow" />
        </div>

        {/* Resources Section */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-teal-100">
            <h2 className="text-2xl font-semibold text-teal-600">
              Educational Resources
            </h2>
            <BookOpen className="w-6 h-6 text-teal-500" />
          </div>

          {resources.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500">
                No resources available yet.
              </p>
              <p className="mt-2 text-gray-600">
                Ask your provider for more content!
              </p>
              <button
                onClick={() => navigate("/dashboard#contact")}
                className="px-4 py-2 mt-4 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
              >
                Contact Provider
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((res) => (
                <div
                  key={res._id}
                  className="p-5 transition-all duration-300 border border-teal-100 rounded-lg shadow-md bg-teal-50 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-teal-700 truncate">
                      {res.title}
                    </h3>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="mb-4 text-gray-600 line-clamp-3">
                    {res.content}
                  </p>
                  <button
                    onClick={() => handleReadMore(res)}
                    className="flex items-center text-teal-600 transition-colors duration-200 hover:text-teal-800"
                  >
                    <span className="mr-2 font-medium">Read More</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resource Detail Modal */}
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl p-6 mx-4 bg-white shadow-2xl rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-teal-700">
                  {selectedResource.title}
                </h3>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedResource.content}
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 text-white transition duration-300 bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  Close
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
