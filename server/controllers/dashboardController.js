const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');

const getSummary = asyncHandler(async (req, res) => {
  const paidOrders = await Order.find({ status: 'paid' }).lean();

  const totalOrders = paidOrders.length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const upsellRevenue = paidOrders.reduce((sum, o) => sum + (o.upsellRevenue || 0), 0);
  const crossSellRevenue = paidOrders.reduce((sum, o) => sum + (o.crossSellRevenue || 0), 0);
  const aiRecommendedRevenue = paidOrders.reduce((sum, o) => sum + (o.aiRecommendedRevenue || 0), 0);

  const productsSold = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  // Recommendation acceptance / conversion rate
  const totalRecommendations = await Recommendation.countDocuments({});
  const acceptedRecommendations = await Recommendation.countDocuments({ accepted: true });
  const conversionRate = totalRecommendations
    ? Math.round((acceptedRecommendations / totalRecommendations) * 100)
    : 0;

  // Revenue by day for the last 14 days (chart data)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentOrders = paidOrders.filter((o) => new Date(o.createdAt) >= fourteenDaysAgo);
  const revenueByDayMap = {};
  recentOrders.forEach((o) => {
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    revenueByDayMap[day] = (revenueByDayMap[day] || 0) + o.total;
  });
  const revenueByDay = Object.entries(revenueByDayMap)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, revenue]) => ({ date, revenue }));

  // Top selling products
  const productTotals = {};
  paidOrders.forEach((o) => {
    o.items.forEach((i) => {
      const key = i.name;
      productTotals[key] = (productTotals[key] || 0) + i.quantity;
    });
  });
  const topProducts = Object.entries(productTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, unitsSold]) => ({ name, unitsSold }));

  const recentOrdersList = [...paidOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((o) => ({
      id: o._id,
      total: o.total,
      itemCount: o.items.length,
      createdAt: o.createdAt,
      aiRecommendedRevenue: o.aiRecommendedRevenue,
    }));

  res.json({
    success: true,
    summary: {
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue),
      productsSold,
      aiRecommendedRevenue,
      upsellRevenue,
      crossSellRevenue,
      conversionRate,
    },
    charts: { revenueByDay, topProducts },
    recentOrders: recentOrdersList,
  });
});

const getInsights = asyncHandler(async (req, res) => {
  const paidOrders = await Order.find({ status: 'paid' }).lean();

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const aiRevenue = paidOrders.reduce((sum, o) => sum + (o.aiRecommendedRevenue || 0), 0);
  const manualRevenue = totalRevenue - aiRevenue;

  const insights = [];

  if (aiRevenue > 0) {
    insights.push(
      `AI recommendations generated ₹${aiRevenue.toLocaleString('en-IN')} in additional revenue across ${paidOrders.length} orders.`
    );
  }

  // Co-purchase pattern: laptops -> accessories
  const laptopOrders = paidOrders.filter((o) => o.items.some((i) => /laptop/i.test(i.name)));
  if (laptopOrders.length > 0) {
    const accessoryAttach = laptopOrders.filter((o) =>
      o.items.some((i) => /mouse|bag|stand|keyboard/i.test(i.name))
    );
    const attachRate = Math.round((accessoryAttach.length / laptopOrders.length) * 100);
    if (attachRate > 0) {
      insights.push(
        `${attachRate}% of customers who bought a laptop also purchased a mouse, bag, or stand in the same order.`
      );
    }
  }

  // Average cart value trend (first half vs second half of paid orders, chronologically)
  if (paidOrders.length >= 4) {
    const sorted = [...paidOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);
    const avg = (arr) => arr.reduce((s, o) => s + o.total, 0) / (arr.length || 1);
    const firstAvg = avg(firstHalf);
    const secondAvg = avg(secondHalf);
    if (firstAvg > 0) {
      const pctChange = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
      insights.push(
        `Average cart value has ${pctChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(
          pctChange
        )}% since the AI assistant was introduced.`
      );
    }
  }

  if (insights.length === 0) {
    insights.push('Not enough completed orders yet to generate revenue insights. Complete a few test checkouts to populate this section.');
  }

  res.json({ success: true, insights, aiRevenue, manualRevenue, totalRevenue });
});

module.exports = { getSummary, getInsights };
