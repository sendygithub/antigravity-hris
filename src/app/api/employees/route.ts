import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const employee = await prisma.employee.create({
        data: {

            Name: body.Name,
            email: body.email,
            status: body.status,
            hiredDate: body.hiredDate,
            joinedDate: body.joinedDate,
            roleId: body.roleId,
            departmentId: body.departmentId,
            attendance: body.attendance,
            payroll: body.payroll,
            leaveRequests: body.leaveRequests,
            tasks: body.tasks,

        }
    });
    return NextResponse.json(employee);
}


export async function GET() {
    try {
        const employees = await prisma.employee.findMany();
        return NextResponse.json(employees);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
