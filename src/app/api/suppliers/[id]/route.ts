import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import * as supplierService from "@/services/supplier.service";
import { updateSupplierSchema } from "@/schemas";

async function checkAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json({ success: false, error: "Invalid supplier ID" }, { status: 400 });
    }

    const supplier = await supplierService.getById(supplierId);

    if (!supplier) {
      return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error("Error in GET /api/suppliers/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json({ success: false, error: "Invalid supplier ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateSupplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const supplier = await supplierService.update(supplierId, parsed.data);

    if (!supplier) {
      return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error("Error in PATCH /api/suppliers/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json({ success: false, error: "Invalid supplier ID" }, { status: 400 });
    }

    const supplier = await supplierService.remove(supplierId);

    if (!supplier) {
      return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    console.error("Error in DELETE /api/suppliers/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
