import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { Loader } from '../components/Loader.jsx';
import { formatINR } from '../utils/session';
import { useTheme } from '../context/ThemeContext.jsx';
import * as api from '../services/api';

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl2 border border-black/5 bg-white p-5 shadow-card dark:border-white/5 dark:bg-panel">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${accent || 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({ revenueByDay: [], topProducts: [] });
  const [recentOrders, setRecentOrders] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.fetchDashboardSummary(), api.fetchDashboardInsights()])
      .then(([summaryRes, insightsRes]) => {
        setSummary(summaryRes.summary);
        setCharts(summaryRes.charts);
        setRecentOrders(summaryRes.recentOrders);
        setInsights(insightsRes.insights);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!summary) return null;

  const gridColor = isDark ? '#2A3550' : '#E2E8F0';
  const axisColor = isDark ? '#64748B' : '#64748B';
  const tooltipStyle = {
    background: isDark ? '#131C31' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2A3550' : '#E2E8F0'}`,
    borderRadius: 8,
  };
  const tooltipLabelStyle = { color: isDark ? '#F1F5F9' : '#0F172A' };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Merchant Growth Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live performance of your store and the AI agent.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Orders" value={summary.totalOrders} />
        <StatCard label="Total Revenue" value={formatINR(summary.totalRevenue)} accent="text-mint" />
        <StatCard label="Avg. Order Value" value={formatINR(summary.averageOrderValue)} />
        <StatCard label="Products Sold" value={summary.productsSold} />
        <StatCard
          label="AI Recommendation Conversion"
          value={`${summary.conversionRate}%`}
          accent="text-accent-dark dark:text-accent-light"
        />
        <StatCard label="AI-Driven Revenue" value={formatINR(summary.aiRecommendedRevenue)} accent="text-accent-dark dark:text-accent-light" />
        <StatCard label="Upsell Revenue" value={formatINR(summary.upsellRevenue)} accent="text-mint" />
        <StatCard label="Cross-sell Revenue" value={formatINR(summary.crossSellRevenue)} accent="text-mint" />
      </div>

      <div className="mt-10 rounded-xl2 border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">✨ AI Revenue Insights</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {insights.map((line, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-accent-dark dark:text-accent-light">•</span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Revenue (last 14 days)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" stroke={axisColor} fontSize={11} />
                <YAxis stroke={axisColor} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#6D5EF7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Top Selling Products</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke={axisColor} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Bar dataKey="unitsSold" fill="#22D3A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No paid orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-slate-500 dark:border-white/5">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">AI Revenue</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-black/5 text-slate-700 dark:border-white/5 dark:text-slate-300">
                    <td className="py-2 font-mono text-xs">{String(o.id).slice(-8)}</td>
                    <td className="py-2">{o.itemCount}</td>
                    <td className="py-2 text-accent-dark dark:text-accent-light">{formatINR(o.aiRecommendedRevenue)}</td>
                    <td className="py-2 font-semibold text-slate-900 dark:text-white">{formatINR(o.total)}</td>
                    <td className="py-2 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
