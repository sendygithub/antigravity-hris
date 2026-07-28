import { prisma } from "@/lib/db";

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  todaySales: number;
  todayTransactions: number;
  lowStockProducts: number;
  monthlyRevenue: number;
}

export interface SalesChartPoint {
  date: string;
  total: number;
  count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export async function getStats(): Promise<DashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    totalCustomers,
    todayTransactions,
    monthlyTransactions,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.supplier.count(),
    prisma.customer.count(),
    // Today's paid transactions
    prisma.transaction.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: todayStart },
      },
      select: { total: true },
    }),
    // Monthly paid transactions
    prisma.transaction.findMany({
      where: {
        status: { in: ["PAID", "PENDING"] },
        createdAt: { gte: monthStart },
      },
      select: { total: true },
    }),
    // Low stock products (stock <= 5)
    prisma.product.count({
      where: { stock: { lte: 5 } },
    }),
  ]);

  const todaySales = todayTransactions.reduce(
    (sum: number, tx: { total: any }) => sum + Number(tx.total),
    0
  );
  const monthlyRevenue = monthlyTransactions.reduce(
    (sum: number, tx: { total: any }) => sum + Number(tx.total),
    0
  );

  return {
    totalProducts,
    totalCategories,
    totalSuppliers,
    totalCustomers,
    todaySales,
    todayTransactions: todayTransactions.length,
    lowStockProducts,
    monthlyRevenue,
  };
}

export async function getSalesChart(
  days: number = 30
): Promise<SalesChartPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      status: "PAID",
      createdAt: { gte: startDate },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyMap = new Map<string, { total: number; count: number }>();

  for (const tx of transactions) {
    const dateKey = tx.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey) || { total: 0, count: 0 };
    existing.total += Number(tx.total);
    existing.count += 1;
    dailyMap.set(dateKey, existing);
  }

  // Fill in missing dates with zeroes
  const result: SalesChartPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const data = dailyMap.get(dateKey) || { total: 0, count: 0 };
    result.push({
      date: dateKey,
      total: data.total,
      count: data.count,
    });
  }

  return result;
}

export async function getTopProducts(
  limit: number = 5
): Promise<TopProduct[]> {
  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: { status: "PAID" },
    },
    include: {
      product: { select: { id: true, name: true } },
    },
  });

  const productMap = new Map<
    number,
    { id: number; name: string; totalSold: number; revenue: number }
  >();

  for (const item of items) {
    const existing = productMap.get(item.productId) || {
      id: item.product.id,
      name: item.product.name,
      totalSold: 0,
      revenue: 0,
    };
    existing.totalSold += item.quantity;
    existing.revenue += Number(item.subtotal);
    productMap.set(item.productId, existing);
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}
