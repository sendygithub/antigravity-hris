import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const attendance = await prisma.attendance.create({
        data: {
            employeeId: body.employeeId,
            date: body.date,
            checkIn: body.checkIn,
            checkOut: body.checkOut,
            status: body.status,
        }
    });
    return NextResponse.json(attendance);
}


export async function GET() {
    try {
        const roles = await prisma.attendance.findMany();
        return NextResponse.json(roles);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
