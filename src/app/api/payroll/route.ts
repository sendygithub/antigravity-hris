import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const role = await prisma.payroll.create({
        data: {
            id: body.id,
            employeeId: body.employeeId,
            salary: body.salary,
            status: body.status,
            paymentDate: body.paymentDate,
        }
    });
    return NextResponse.json(role);
}


export async function GET() {
    try {
        const roles = await prisma.payroll.findMany();
        return NextResponse.json(roles);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
