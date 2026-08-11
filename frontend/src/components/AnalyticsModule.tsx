import { useState, useEffect } from 'react';
import { fetchAnalytics } from '../api';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0f3d3e', '#ff5000', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

export function AnalyticsModule() {
  const [parData, setParData] = useState<any[]>([]);
  const [yieldData, setYieldData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [ratios, setRatios] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchAnalytics();
      setParData(data.parData || []);
      setYieldData(data.yieldData || []);
      setRatios(data.ratios || {});
      setRadarData(data.radarData || []);
    } catch (e) {
      toast.error('Failed to load analytics');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-brand-primary">Analytics & Stats</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Ratio', value: ratios.currentRatio?.toFixed(2) || '0.00' },
          { label: 'Debt-to-Equity', value: ratios.debtToEquity?.toFixed(2) || '0.00' },
          { label: 'ROA (%)', value: ratios.roa?.toFixed(2) || '0.00' },
          { label: 'Loan-to-Deposit (%)', value: ratios.loanToDeposit?.toFixed(2) || '0.00' },
        ].map((k, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase">{k.label}</p>
            <p className="text-2xl font-extrabold text-brand-primary mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="font-bold text-gray-700 mb-4">Portfolio at Risk (PAR)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="0-30" stackId="a" fill={COLORS[2]} name="0-30 Days" />
              <Bar dataKey="31-60" stackId="a" fill={COLORS[3]} name="31-60 Days" />
              <Bar dataKey="61-90" stackId="a" fill={COLORS[1]} name="61-90 Days" />
              <Bar dataKey="90+" stackId="a" fill={COLORS[4]} name="90+ Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="font-bold text-gray-700 mb-4">Yield on Advances (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke={COLORS[1]} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96 col-span-1 lg:col-span-2 flex justify-center">
          <div className="w-full lg:w-1/2">
            <h3 className="font-bold text-gray-700 mb-4 text-center">Liquidity & Health Ratios</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar name="Metrics" dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
