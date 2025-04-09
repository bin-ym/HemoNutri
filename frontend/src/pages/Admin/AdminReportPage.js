import { useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

const AdminReportPage = () => {
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const url =
        filter === "all" ? "/admin/report" : `/admin/report?filter=${filter}`;
      console.log("Generating report with URL:", url);
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Report response:", res.data);
      setReport(res.data);
    } catch (err) {
      console.error("Report fetch error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) {
      alert("Please generate a report first!");
      return;
    }

    const wb = XLSX.utils.book_new();
    const timestamp = new Date(report.timestamp).toLocaleString();
    const filterName = filter === "all" ? "All Users" : filter === "patient" ? "Patients" : "Providers";

    // Header data
    const headerData = [
      ["HemoNutri System Usage Report"],
      [`Filter: ${filterName}`],
      [`Generated: ${timestamp}`],
      [],
    ];

    // Users sheet data
    const usersData = [
      ["Users", "", ""],
      ["Username", "Role", ""],
      ...report.users.map(user => [user.username, user.role, ""]),
    ];

    // Food Logs sheet data
    const foodLogsData = [
      ["Food Logs", "", ""],
      ["Total", "", ""],
      [report.foodLogs, "", ""],
    ];

    // Resources sheet data
    const resourcesData = [
      ["Educational Resources", "", "", ""],
      ["Title", "Description", "URL", "Provider"],
      ...report.resources.map(res => [res.title, res.description || "", res.url || "", res.provider]),
    ];

    // Combine all data into one sheet
    const wsData = [
      ...headerData,
      ...usersData,
      [""], // Spacer
      ...foodLogsData,
      [""], // Spacer
      ...resourcesData,
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Styling
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        // Default style
        ws[cellAddress].s = {
          font: { name: "Calibri", sz: 12 },
          alignment: { vertical: "center", horizontal: "left" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };

        // Header styling
        if (R === 0) {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            font: { name: "Calibri", sz: 16, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "008080" } }, // Teal background
          };
        } else if (R === 1 || R === 2) {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            font: { italic: true, color: { rgb: "666666" } },
          };
        } else if (ws[cellAddress].v === "Users" || ws[cellAddress].v === "Food Logs" || ws[cellAddress].v === "Educational Resources") {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "008080" } }, // Teal background
          };
        } else if (ws[cellAddress].v === "Username" || ws[cellAddress].v === "Role" || ws[cellAddress].v === "Total" || 
                   ws[cellAddress].v === "Title" || ws[cellAddress].v === "Description" || ws[cellAddress].v === "URL" || ws[cellAddress].v === "Provider") {
          ws[cellAddress].s = {
            ...ws[cellAddress].s,
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4A636E" } }, // Darker teal for subheaders
          };
        }
      }
    }

    // Set column widths
    ws["!cols"] = [
      { wch: 20 }, // Username / Title
      { wch: 50 }, // Role / Description
      { wch: 30 }, // URL
      { wch: 15 }, // Provider
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Usage Report");

    // Write file
    XLSX.writeFile(wb, `HemoNutri_Report_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" />
      <div className="max-w-4xl p-6 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            System Usage Report
          </h1>
          <p className="mt-2 text-lg text-teal-600">Analyze platform activity</p>
        </div>

        <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
          <div className="flex flex-col mb-6 sm:flex-row sm:items-end sm:space-x-4">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium text-teal-700">
                Generate Report For:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Users</option>
                <option value="patient">Patients</option>
                <option value="provider">Providers</option>
              </select>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`mt-4 sm:mt-0 flex items-center justify-center px-6 py-3 text-white bg-teal-700 rounded-lg shadow-md hover:bg-teal-800 hover:scale-105 transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {report && (
            <div className="p-4 mt-6 rounded-lg shadow-md bg-teal-50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-teal-700">
                  Report Details
                </h2>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 text-white transition-all duration-300 bg-teal-700 rounded-lg hover:bg-teal-800 hover:scale-105"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export as Excel
                </button>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-teal-700">Users ({report.users.length})</h3>
                <ul className="pl-5 text-teal-600 list-disc">
                  {report.users.map((user, index) => (
                    <li key={index}>{user.username} ({user.role})</li>
                  ))}
                </ul>
              </div>
              <p className="text-teal-600">Food Logs: {report.foodLogs}</p>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-teal-700">Educational Resources ({report.resources.length})</h3>
                <ul className="pl-5 text-teal-600 list-disc">
                  {report.resources.map((res, index) => (
                    <li key={index}>
                      {res.title} - Provided by {res.provider}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 text-sm text-teal-500">
                Generated: {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportPage;