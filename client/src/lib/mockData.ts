// Mock data for dashboard builder components
// This provides realistic sample data for all chart types

export const salesData = [
  { month: "Jan", revenue: 45000, target: 50000 },
  { month: "Feb", revenue: 52000, target: 50000 },
  { month: "Mar", revenue: 48000, target: 50000 },
  { month: "Apr", revenue: 61000, target: 50000 },
  { month: "May", revenue: 55000, target: 50000 },
  { month: "Jun", revenue: 67000, target: 50000 },
];

export const regionSalesData = [
  { region: "North", sales: 125000, growth: 12 },
  { region: "South", sales: 98000, growth: 8 },
  { region: "East", sales: 156000, growth: 18 },
  { region: "West", sales: 112000, growth: 5 },
  { region: "Central", sales: 89000, growth: -2 },
];

export const marketShareData = [
  { name: "Product A", value: 35 },
  { name: "Product B", value: 28 },
  { name: "Product C", value: 22 },
  { name: "Product D", value: 15 },
];

export const userGrowthData = [
  { date: "2026-01-01", users: 5000, activeUsers: 3200 },
  { date: "2026-01-08", users: 5800, activeUsers: 3800 },
  { date: "2026-01-15", users: 6500, activeUsers: 4200 },
  { date: "2026-01-22", users: 7200, activeUsers: 4800 },
  { date: "2026-01-29", users: 8100, activeUsers: 5500 },
  { date: "2026-02-03", users: 9200, activeUsers: 6200 },
];

export const revenueVsCustomersData = [
  { customers: 50, revenue: 25000 },
  { customers: 120, revenue: 65000 },
  { customers: 85, revenue: 48000 },
  { customers: 200, revenue: 125000 },
  { customers: 150, revenue: 92000 },
  { customers: 180, revenue: 110000 },
  { customers: 220, revenue: 145000 },
];

export const topCustomersData = [
  { name: "Acme Corp", revenue: 125000, status: "Active", growth: 15 },
  { name: "TechStart Inc", revenue: 98000, status: "Active", growth: 8 },
  { name: "Global Solutions", revenue: 156000, status: "Active", growth: 22 },
  { name: "Innovation Labs", revenue: 87000, status: "Active", growth: -5 },
  { name: "Future Systems", revenue: 112000, status: "Inactive", growth: 0 },
];

export const kpiMetrics = {
  totalRevenue: { value: "$487,000", trend: "+12.5%", icon: "DollarSign" },
  activeUsers: { value: "9,200", trend: "+18.3%", icon: "Users" },
  conversionRate: { value: "3.8%", trend: "+0.5%", icon: "TrendingUp" },
  customerSatisfaction: { value: "4.7/5", trend: "+0.2", icon: "Star" },
};

export const performanceMetrics = {
  goalProgress: 75,
  conversionRate: 3.8,
  customerRetention: 92,
  marketShare: 28,
};

export const insights = {
  title: "Key Insights",
  content: `
    Revenue increased by 12.5% this month, driven primarily by strong performance in the East region (+18% growth).
    Active users reached 9,200, up 18.3% from last month. The conversion rate improved to 3.8%, indicating better product-market fit.
    Top customer (Global Solutions) contributed $156,000 in revenue. Consider expanding services for this segment.
    Market share grew to 28%, positioning us as the second-largest player in our category.
  `,
};

export const productPerformanceData = [
  { product: "Product A", q1: 45000, q2: 52000, q3: 58000, q4: 65000 },
  { product: "Product B", q1: 32000, q2: 38000, q3: 42000, q4: 48000 },
  { product: "Product C", q1: 28000, q2: 31000, q3: 35000, q4: 39000 },
  { product: "Product D", q1: 15000, q2: 18000, q3: 22000, q4: 26000 },
];

export const customerSegmentData = [
  { segment: "Enterprise", count: 45, revenue: 250000, churn: 2 },
  { segment: "Mid-Market", count: 120, revenue: 180000, churn: 5 },
  { segment: "SMB", count: 450, revenue: 57000, churn: 12 },
];

export const monthlyMetricsData = [
  { month: "Jan", revenue: 45000, expenses: 28000, profit: 17000 },
  { month: "Feb", revenue: 52000, expenses: 31000, profit: 21000 },
  { month: "Mar", revenue: 48000, expenses: 29000, profit: 19000 },
  { month: "Apr", revenue: 61000, expenses: 35000, profit: 26000 },
  { month: "May", revenue: 55000, expenses: 32000, profit: 23000 },
  { month: "Jun", revenue: 67000, expenses: 38000, profit: 29000 },
];

// Helper function to get random data for dynamic updates
export const getRandomValue = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to simulate real-time data updates
export const updateSalesData = (data: typeof salesData) => {
  return data.map((item) => ({
    ...item,
    revenue: item.revenue + getRandomValue(-5000, 5000),
  }));
};

// Helper function to get a random dataset
export const getRandomDataset = () => {
  const datasets = [
    { name: "Sales Data", data: salesData },
    { name: "User Growth", data: userGrowthData },
    { name: "Region Sales", data: regionSalesData },
  ];
  return datasets[Math.floor(Math.random() * datasets.length)];
};
