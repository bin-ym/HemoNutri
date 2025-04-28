import { useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import XLSX from "sheetjs-style";

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

    // Prepare data for the worksheet
    const wsData = [
      ["HemoNutri System Usage Report"], // Title
      [`Filter: ${filterName}`],
      [`Generated: ${timestamp}`],
      [], // Spacer
      ["Users"], // Section header
      ["Username", "Role"],
      ...report.users.map(user => [user.username, user.role]),
      [], // Spacer
      ["Food Logs"],
      ["Total", report.foodLogs],
      [], // Spacer
      ["Educational Resources"],
      ["Title", "Description", "URL", "Provider"],
      ...report.resources.map(res => [res.title, res.description || "", res.url || "", res.provider]),
      [], // Spacer
      [], // Spacer
      ["© HemoNutri - All Rights Reserved", `Report Generated on ${new Date().toLocaleDateString()}`], // Footer
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Define merges for headers
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Merge title across 4 columns
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Merge "Users" header
      { s: { r: report.users.length + 6, c: 0 }, e: { r: report.users.length + 6, c: 1 } }, // Merge "Food Logs" header
      { s: { r: report.users.length + 9, c: 0 }, e: { r: report.users.length + 9, c: 3 } }, // Merge "Educational Resources" header
      { s: { r: report.users.length + report.resources.length + 12, c: 0 }, e: { r: report.users.length + report.resources.length + 12, c: 3 } }, // Merge footer
    ];

    // Styling
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (!ws[cellRef]) continue;

        // Default style
        ws[cellRef].s = {
          font: { name: "Calibri", sz: 12 },
          alignment: { vertical: "center", horizontal: "left", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "333333" } },
            bottom: { style: "thin", color: { rgb: "333333" } },
            left: { style: "thin", color: { rgb: "333333" } },
            right: { style: "thin", color: { rgb: "333333" } },
          },
        };

        // Title (Row 0)
        if (R === 0) {
          ws[cellRef].s = {
            font: { name: "Calibri", sz: 20, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2A6F97" }, patternType: "solid" }, // Deep teal-blue
            alignment: { horizontal: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
              left: { style: "medium", color: { rgb: "000000" } },
              right: { style: "medium", color: { rgb: "000000" } },
            },
          };
        }
        // Filter and Generated (Rows 1-2)
        else if (R === 1 || R === 2) {
          ws[cellRef].s = {
            font: { sz: 12, italic: true, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "468FAF" }, patternType: "solid" }, // Lighter teal-blue
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
        // Section headers (Users, Food Logs, Educational Resources)
        else if (
          ws[cellRef].v === "Users" ||
          ws[cellRef].v === "Food Logs" ||
          ws[cellRef].v === "Educational Resources"
        ) {
          ws[cellRef].s = {
            font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2A6F97" }, patternType: "solid" }, // Deep teal-blue
            alignment: { horizontal: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
            },
          };
        }
        // Table headers (Username, Role, Total, Title, Description, URL, Provider)
        else if (
          ws[cellRef].v === "Username" ||
          ws[cellRef].v === "Role" ||
          ws[cellRef].v === "Total" ||
          ws[cellRef].v === "Title" ||
          ws[cellRef].v === "Description" ||
          ws[cellRef].v === "URL" ||
          ws[cellRef].v === "Provider"
        ) {
          ws[cellRef].s = {
            font: { sz: 13, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "5B9BD5" }, patternType: "solid" }, // Medium blue
            alignment: { horizontal: "center" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
            },
          };
        }
        // Data rows - Alternating colors with more contrast
        else if (R >= 6 && R < report.users.length + 6) { // Users data
          ws[cellRef].s = {
            font: { sz: 12, color: { rgb: "333333" } },
            fill: { fgColor: { rgb: R % 2 === 0 ? "DDEBF7" : "F5F6F5" }, patternType: "solid" }, // Light blue and light gray
          };
        } else if (R === report.users.length + 7) { // Food Logs data
          ws[cellRef].s = {
            font: { sz: 12, bold: true, color: { rgb: "333333" } },
            fill: { fgColor: { rgb: report.foodLogs > 10 ? "FFD700" : "DDEBF7" }, patternType: "solid" }, // Gold if > 10, else light blue
            alignment: { horizontal: C === 1 ? "center" : "left" },
          };
        } else if (R >= report.users.length + 11 && R < report.users.length + report.resources.length + 11) { // Resources data
          ws[cellRef].s = {
            font: { sz: 12, color: { rgb: "333333" } },
            fill: { fgColor: { rgb: (R - (report.users.length + 11)) % 2 === 0 ? "DDEBF7" : "F5F6F5" }, patternType: "solid" }, // Light blue and light gray
          };
        }
        // Footer
        else if (R === report.users.length + report.resources.length + 12) {
          ws[cellRef].s = {
            font: { sz: 10, italic: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2A6F97" }, patternType: "solid" }, // Deep teal-blue
            alignment: { horizontal: C === 0 ? "left" : "right" },
            border: {
              top: { style: "medium", color: { rgb: "000000" } },
              bottom: { style: "medium", color: { rgb: "000000" } },
            },
          };
        }
      }
    }

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, // Username / Title
      { wch: 60 }, // Role / Description
      { wch: 40 }, // URL
      { wch: 20 }, // Provider
    ];

    // Set row heights
    ws["!rows"] = [];
    ws["!rows"][0] = { hpt: 40 }; // Title row height
    ws["!rows"][1] = { hpt: 20 }; // Filter row
    ws["!rows"][2] = { hpt: 20 }; // Generated row
    ws["!rows"][4] = { hpt: 30 }; // Users header
    ws["!rows"][report.users.length + 6] = { hpt: 30 }; // Food Logs header
    ws["!rows"][report.users.length + 9] = { hpt: 30 }; // Educational Resources header
    for (let i = report.users.length + 11; i < report.users.length + 11 + report.resources.length; i++) {
      ws["!rows"][i] = { hpt: 25 }; // Resource rows
    }
    ws["!rows"][report.users.length + report.resources.length + 12] = { hpt: 20 }; // Footer row

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Usage Report");

    // Write file
    XLSX.writeFile(wb, `HemoNutri_Report_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar role="admin" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
            System Usage Report
          </h1>
          <p className="mt-2 text-lg text-teal-600">Analyze platform activity</p>
        </div>

        <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-teal-700 mb-1">
                Generate Report For:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 border border-teal-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {report && (
            <div className="mt-6 p-4 bg-teal-50 rounded-lg shadow-md animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-teal-700">
                  Report Details
                </h2>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 text-white bg-teal-700 rounded-lg hover:bg-teal-800 hover:scale-105 transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export as Excel
                </button>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-teal-700">Users ({report.users.length})</h3>
                <ul className="list-disc pl-5 text-teal-600">
                  {report.users.map((user, index) => (
                    <li key={index}>{user.username} ({user.role})</li>
                  ))}
                </ul>
              </div>
              <p className="text-teal-600">Food Logs: {report.foodLogs}</p>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-teal-700">Educational Resources ({report.resources.length})</h3>
                <ul className="list-disc pl-5 text-teal-600">
                  {report.resources.map((res, index) => (
                    <li key={index}>
                      {res.title} - Provided by {res.provider}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-teal-500 text-sm mt-2">
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