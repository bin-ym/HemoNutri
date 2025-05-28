// frontend/src/pages/Admin/AdminReportPage.js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

const AdminReportPage = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const url = filter === 'all' ? '/admin/report' : `/admin/report?filter=${filter}`;
      const res = await api.get(url);
      setReport(res.data);
      toast.success(t('report_generated'));
    } catch (err) {
      const errorMessage = t(err.response?.data?.error || 'failed_generate_report');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) {
      toast.error(t('please_generate_report_first'));
      return;
    }

    const wb = utils.book_new();
    const timestamp = new Date(report.timestamp).toLocaleString();
    const filterName = filter === 'all' ? t('all_users') : filter === 'patient' ? t('patients') : t('providers');

    const wsData = [
      [t('hemonutri_system_usage_report')],
      [t('filter_label', { filterName })],
      [t('generated', { timestamp })],
      [],
      [t('users')],
      [t('username'), t('role')],
      ...report.users.map((user) => [user.username, t(user.role)]),
      [],
      [t('food_logs')],
      [t('total'), report.foodLogs],
      [],
      [t('educational_resources')],
      [t('title'), t('description'), t('resource_url'), t('provider')],
      ...report.resources.map((res) => [res.title, res.description || '', res.url || '', res.provider]),
      [],
      [t('footer_report'), t('report_generated_on', { date: new Date().toLocaleDateString() })],
    ];

    const ws = utils.aoa_to_sheet(wsData);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
      { s: { r: report.users.length + 6, c: 0 }, e: { r: report.users.length + 6, c: 1 } },
      { s: { r: report.users.length + 9, c: 0 }, e: { r: report.users.length + 9, c: 3 } },
      { s: { r: report.users.length + report.resources.length + 12, c: 0 }, e: { r: report.users.length + report.resources.length + 12, c: 3 } },
    ];

    ws['!cols'] = [{ wch: 25 }, { wch: 60 }, { wch: 40 }, { wch: 20 }];
    ws['!rows'] = Array(report.users.length + report.resources.length + 13).fill({ hpt: 20 });
    ws['!rows'][0] = { hpt: 40 };
    ws['!rows'][4] = { hpt: 30 };
    ws['!rows'][report.users.length + 6] = { hpt: 30 };
    ws['!rows'][report.users.length + 9] = { hpt: 30 };

    // Simplified styling for brevity; retain your original if preferred
    const range = utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = utils.encode_cell({ c: C, r: R });
        if (!ws[cellRef]) continue;
        ws[cellRef].s = {
          font: { name: 'Calibri', sz: 12 },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
        };
        if (R === 0) {
          ws[cellRef].s = { font: { sz: 20, bold: true }, fill: { fgColor: { rgb: '1E40AF' } } };
        }
      }
    }

    utils.book_append_sheet(wb, ws, 'Usage Report');
    writeFile(wb, `HemoNutri_Report_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center text-blue-600">{t('system_usage_report')}</h1>
      <p className="mb-8 text-lg text-center text-gray-600">{t('analyze_platform_activity')}</p>

      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex flex-col mb-6 sm:flex-row sm:items-end sm:space-x-4">
          <div className="flex-1 mb-4 sm:mb-0">
            <label className="block mb-1 text-sm font-medium text-gray-700">{t('generate_report_for')}</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('all_users')}</option>
              <option value="patient">{t('patients')}</option>
              <option value="provider">{t('providers')}</option>
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className={`flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
            {loading ? t('generating') : t('generate_report')}
          </button>
        </div>

        {error && (
          <div className="flex items-center p-3 mb-6 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            <p className="text-sm text-gray-800">{error}</p>
          </div>
        )}

        {report && (
          <div className="p-6 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{t('report_details')}</h2>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('export_as_excel')}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">{t('users')}: {report.users.length}</h3>
                <p className="text-gray-600">
                  {t('patients')}: {report.users.filter((user) => user.role === 'patient').length},{' '}
                  {t('providers')}: {report.users.filter((user) => user.role === 'provider').length},{' '}
                  {t('admins')}: {report.users.filter((user) => user.role === 'admin').length}
                </p>
                <ul className="pl-5 mt-2 text-gray-600 list-disc">
                  {report.users.map((user, index) => (
                    <li key={index}>
                      {user.username} ({t(user.role)})
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-gray-600">{t('food_logs')}: {report.foodLogs}</p>
              <div>
                <h3 className="text-lg font-medium text-gray-800">{t('educational_resources')}: {report.resources.length}</h3>
                <ul className="pl-5 mt-2 text-gray-600 list-disc">
                  {report.resources.map((res, index) => (
                    <li key={index}>
                      {res.title} - {t('description')}: {res.description || 'N/A'} - {t('provider')}: {res.provider}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                {t('generated', { timestamp: new Date(report.timestamp).toLocaleString('en-US', { timeZoneName: 'short' }) })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;