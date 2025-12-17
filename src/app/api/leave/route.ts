import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const leave = await prisma.leaveRequest.create({
        data: {
            employeeId: body.employeeId,
            type: body.type,
            startDate: body.startDate,
            endDate: body.endDate,
            reason: body.reason,
            status: body.status,
        }
    });
    return NextResponse.json(leave);
}


export async function GET() {
    try {
        const leaveRequests = await prisma.leaveRequest.findMany();
        return NextResponse.json(leaveRequests);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
