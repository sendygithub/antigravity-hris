import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import * as customerService from "@/services/customer.service";
import { createCustomerSchema } from "@/schemas";

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
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await customerService.getAll({ search, page, limit });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in GET /api/customers:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const customer = await customerService.create(parsed.data);

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/customers:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
