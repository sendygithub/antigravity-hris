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
            where: { id }, // karena schema id = String, tidak perlu konversi
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

interface Params {
    params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
    const payrollId = params.id;

    if (!payrollId) {
        return NextResponse.json({ error: "ID payroll tidak ditemukan di URL" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { employeeId, salary, status, paymentDate } = body;

        if (!employeeId || !salary || !status || !paymentDate) {
            return NextResponse.json(
                { error: "Semua field wajib diisi: employeeId, salary, status, paymentDate" },
                { status: 400 }
            );
        }

        const updatedPayroll = await prisma.payroll.update({
            where: { id: payrollId }, // <- ID pasti ada
            data: {
                employeeId,
                salary: new Decimal(salary),
                status,
                paymentDate: new Date(paymentDate),
            },
        });

        return NextResponse.json(updatedPayroll);
    } catch (error: any) {
        console.error("Error updating payroll:", error);
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Payroll tidak ditemukan" }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
