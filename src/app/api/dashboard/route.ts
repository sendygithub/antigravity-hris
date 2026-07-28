import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import * as dashboardService from "@/services/dashboard.service";

async function checkAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const topProductsLimit = parseInt(searchParams.get("topProducts") || "5");

    const [stats, salesChart, topProducts] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getSalesChart(days),
      dashboardService.getTopProducts(topProductsLimit),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        salesChart,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
