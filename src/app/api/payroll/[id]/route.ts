import { NextRequest, NextResponse } from "next/server"; // import NextResponse untuk membuat HTTP response
import { prisma } from "@/lib/db"; // import instance Prisma Client untuk akses database
import { Decimal } from "@prisma/client/runtime/client";

// ================= DELETE API =================
// DELETE API untuk hapus Payroll berdasarkan id
export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> } // params adalah Promise di App Router
) {
    try {
        // ambil id dari URL
        const { id } = await context.params;

        if (!id) {
            // jika id tidak ada → kembalikan 400
            return NextResponse.json(
                { error: "ID param is missing" },
                { status: 400 }
            );
        }

        // hapus record Payroll berdasarkan id
        const payroll = await prisma.payroll.delete({
            where: { id: Number(id) },// karena schema id = String, tidak perlu konversi
        });

        // jika berhasil → kembalikan data yang dihapus
        return NextResponse.json(
            {
                message: "Payroll deleted successfully",
                payroll,
            },
            { status: 200 }
        );
    } catch (e: any) {
        // jika record tidak ditemukan → Prisma lempar error P2025
        if (e.code === "P2025") {
            return NextResponse.json(
                { error: "Payroll not found" },
                { status: 404 }
            );
        }

        // error lainnya → internal server error
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
// ================= PUT API =================
// PUT API untuk update Payroll berdasarkan id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: payrollId } = await context.params;

  if (!payrollId) {
    return NextResponse.json(
      { error: "ID payroll tidak ditemukan di URL" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    console.log("PUT payroll body:", body);

    const { employeeId, salary, status, payDate } = body;

    // VALIDASI YANG BENAR
    if (
      employeeId === undefined ||
      salary === undefined ||
      status === undefined ||
      payDate === undefined
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // UPDATE DATABASE
    const updatedPayroll = await prisma.payroll.update({
      where: { id: Number(payrollId) },
      data: {
        employeeId,
        salary: new Decimal(salary),
        status,
        paymentDate: new Date(payDate),
      },
    });

    // RESPONSE SUKSES
    return NextResponse.json(updatedPayroll, { status: 200 });
  } catch (error: any) {
    console.error("Error updating payroll:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Payroll tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
