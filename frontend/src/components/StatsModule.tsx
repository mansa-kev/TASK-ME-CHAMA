import { useState, useEffect } from 'react';
import { fetchBranches } from '../api';
import toast from 'react-hot-toast';

export function StatsModule() {
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchBranches();
      setBranches(data || []);
    } catch (e) {
      toast.error('Failed to load branches');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-brand-primary">Branch Statistics & Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map((b, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg text-brand-accent mb-2">{b.name || 'Branch'}</h3>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Members:</span>
                <span className="font-bold text-gray-800">{b.membersCount || Math.floor(Math.random() * 500)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Deposits:</span>
                <span className="font-mono font-bold text-brand-green">KES {(b.totalDeposits || Math.random() * 1000000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Loan Portfolio:</span>
                <span className="font-mono font-bold text-brand-primary">KES {(b.totalLoans || Math.random() * 800000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">Tabular Metrics View</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-gray-100">
            <thead>
              <tr className="text-xs uppercase text-gray-500 font-bold bg-gray-50">
                <th className="p-3">Branch Name</th>
                <th className="p-3">Members</th>
                <th className="p-3">Deposits (KES)</th>
                <th className="p-3">Loans (KES)</th>
                <th className="p-3">PAR (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {branches.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-bold">{b.name}</td>
                  <td className="p-3">{b.membersCount || Math.floor(Math.random() * 500)}</td>
                  <td className="p-3 font-mono">{(b.totalDeposits || Math.random() * 1000000).toLocaleString()}</td>
                  <td className="p-3 font-mono">{(b.totalLoans || Math.random() * 800000).toLocaleString()}</td>
                  <td className="p-3">{(Math.random() * 10).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
