  import { useState } from "react";
  import { useTranslation } from "react-i18next";
  import Navbar from "../../components/Navbar";
  import api from "../../services/api";
  import { Download, RefreshCw, AlertCircle } from "lucide-react";
  import XLSX from "sheetjs-style";

  const AdminReportPage = () => {
    const { t } = useTranslation();
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
        setError(t(err.response?.data?.error || "failed_generate_report"));
      } finally {
        setLoading(false);
      }
    };

    const handleExport = () => {
      if (!report) {
        alert(t("please_generate_report_first"));
        return;
      }

      const wb = XLSX.utils.book_new();
      const timestamp = new Date(report.timestamp).toLocaleString();
      const filterName =
        filter === "all"
          ? t("all_users")
          : filter === "patient"
          ? t("patients")
          : t("providers");

      const wsData = [
        [t("hemonutri_system_usage_report")],
        [t("filter_label", { filterName })],
        [t("generated", { timestamp })],
        [],
        [t("users")],
        [t("username"), t("role")],
        ...report.users.map((user) => [user.username, user.role]),
        [],
        [t("food_logs")],
        [t("total"), report.foodLogs],
        [],
        [t("educational_resources")],
        [t("title"), t("description"), t("resource_url"), t("provider")],
        ...report.resources.map((res) => [
          res.title,
          res.description || "",
          res.url || "",
          res.provider,
        ]),
        [],
        [],
        [
          t("footer_report"),
          t("report_generated_on", { date: new Date().toLocaleDateString() }),
        ],
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
        { s: { r: report.users.length + 6, c: 0 }, e: { r: report.users.length + 6, c: 1 } },
        {
          s: { r: report.users.length + 9, c: 0 },
          e: { r: report.users.length + 9, c: 3 },
        },
        {
          s: { r: report.users.length + report.resources.length + 12, c: 0 },
          e: { r: report.users.length + report.resources.length + 12, c: 3 },
        },
      ];

      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = { c: C, r: R };
          const cellRef = XLSX.utils.encode_cell(cellAddress);
          if (!ws[cellRef]) continue;

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

          if (R === 0) {
            ws[cellRef].s = {
              font: { name: "Calibri", sz: 20, bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "2A6F97" }, patternType: "solid" },
              alignment: { horizontal: "center" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
                left: { style: "medium", color: { rgb: "000000" } },
                right: { style: "medium", color: { rgb: "000000" } },
              },
            };
          } else if (R === 1 || R === 2) {
            ws[cellRef].s = {
              font: { sz: 12, italic: true, bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "468FAF" }, patternType: "solid" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
              },
            };
          } else if (
            ws[cellRef].v === t("users") ||
            ws[cellRef].v === t("food_logs") ||
            ws[cellRef].v === t("educational_resources")
          ) {
            ws[cellRef].s = {
              font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "2A6F97" }, patternType: "solid" },
              alignment: { horizontal: "center" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
              },
            };
          } else if (
            ws[cellRef].v === t("username") ||
            ws[cellRef].v === t("role") ||
            ws[cellRef].v === t("total") ||
            ws[cellRef].v === t("title") ||
            ws[cellRef].v === t("description") ||
            ws[cellRef].v === t("resource_url") ||
            ws[cellRef].v === t("provider")
          ) {
            ws[cellRef].s = {
              font: { sz: 13, bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "5B9BD5" }, patternType: "solid" },
              alignment: { horizontal: "center" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
              },
            };
          } else if (R >= 6 && R < report.users.length + 6) {
            ws[cellRef].s = {
              font: { sz: 12, color: { rgb: "333333" } },
              fill: {
                fgColor: { rgb: R % 2 === 0 ? "DDEBF7" : "F5F6F5" },
                patternType: "solid",
              },
            };
          } else if (R === report.users.length + 7) {
            ws[cellRef].s = {
              font: { sz: 12, bold: true, color: { rgb: "333333" } },
              fill: {
                fgColor: { rgb: report.foodLogs > 10 ? "FFD700" : "DDEBF7" },
                patternType: "solid",
              },
              alignment: { horizontal: C === 1 ? "center" : "left" },
            };
          } else if (
            R >= report.users.length + 11 &&
            R < report.users.length + report.resources.length + 11
          ) {
            ws[cellRef].s = {
              font: { sz: 12, color: { rgb: "333333" } },
              fill: {
                fgColor: {
                  rgb: (R - (report.users.length + 11)) % 2 === 0 ? "DDEBF7" : "F5F6F5",
                },
                patternType: "solid",
              },
            };
          } else if (R === report.users.length + report.resources.length + 12) {
            ws[cellRef].s = {
              font: { sz: 10, italic: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "2A6F97" }, patternType: "solid" },
              alignment: { horizontal: C === 0 ? "left" : "right" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
              },
            };
          }
        }
      }

      ws["!cols"] = [
        { wch: 25 },
        { wch: 60 },
        { wch: 40 },
        { wch: 20 },
      ];

      ws["!rows"] = [];
      ws["!rows"][0] = { hpt: 40 };
      ws["!rows"][1] = { hpt: 20 };
      ws["!rows"][2] = { hpt: 20 };
      ws["!rows"][4] = { hpt: 30 };
      ws["!rows"][report.users.length + 6] = { hpt: 30 };
      ws["!rows"][report.users.length + 9] = { hpt: 30 };
      for (let i = report.users.length + 11; i < report.users.length + 11 + report.resources.length; i++) {
        ws["!rows"][i] = { hpt: 25 };
      }
      ws["!rows"][report.users.length + report.resources.length + 12] = { hpt: 20 };

      XLSX.utils.book_append_sheet(wb, ws, "Usage Report");
      XLSX.writeFile(wb, `HemoNutri_Report_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar role="admin" />
        <div className="max-w-4xl p-6 mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-teal-700 animate-fade-in">
              {t("system_usage_report")}
            </h1>
            <p className="mt-2 text-lg text-teal-600">{t("analyze_platform_activity")}</p>
          </div>

          <div className="p-6 bg-white border border-teal-200 shadow-lg rounded-xl">
            <div className="flex flex-col mb-6 sm:flex-row sm:items-end sm:space-x-4">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-teal-700">
                  {t("generate_report_for")}
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-3 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">{t("all_users")}</option>
                  <option value="patient">{t("patients")}</option>
                  <option value="provider">{t("providers")}</option>
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
                {loading ? t("generating") : t("generate_report")}
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
                    {t("report_details")}
                  </h2>
                  <button
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 text-white transition-all duration-300 bg-teal-700 rounded-lg hover:bg-teal-800 hover:scale-105"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t("export_as_excel")}
                  </button>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-teal-700">
                    {t("users_count", { count: report.users.length })}
                  </h3>
                  <ul className="pl-5 text-teal-600 list-disc">
                    {report.users.map((user, index) => (
                      <li key={index}>
                        {user.username} ({user.role})
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-teal-600">
                  {t("food_logs")}: {report.foodLogs}
                </p>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-teal-700">
                    {t("educational_resources_count", {
                      count: report.resources.length,
                    })}
                  </h3>
                  <ul className="pl-5 text-teal-600 list-disc">
                    {report.resources.map((res, index) => (
                      <li key={index}>
                        {res.title} - {t("provider")}: {res.provider}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-sm text-teal-500">
                  {t("generated", { timestamp: new Date(report.timestamp).toLocaleString() })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default AdminReportPage;