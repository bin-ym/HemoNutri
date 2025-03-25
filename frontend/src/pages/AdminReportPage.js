import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminReportPage = () => {
  const [report, setReport] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' ? '/admin/report' : `/admin/report?filter=${filter}`;
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar role="admin" />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">System Usage Report</h1>
        <div className="mb-4">
          <label className="mr-2">Generate Report For:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Users</option>
            <option value="patient">Patients</option>
            <option value="provider">Providers</option>
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Generate Report
        </button>
        {report && (
          <div className="mt-4 p-4 bg-gray-100 rounded shadow-sm">
            <p>Users: {report.users}</p>
            <p>Food Logs: {report.foodLogs}</p>
            <p>Educational Resources: {report.resources}</p>
            <p>Generated: {new Date(report.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;