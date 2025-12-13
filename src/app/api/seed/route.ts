import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Clear existing data
        await prisma.task.deleteMany();
        await prisma.leaveRequest.deleteMany();
        await prisma.payroll.deleteMany();
        await prisma.attendance.deleteMany();
        await prisma.employee.deleteMany();

        // Create Employees
        const emp1 = await prisma.employee.create({
            data: {
                firstName: "Sarah",
                lastName: "Miller",
                email: "sarah.miller@company.com",
                role: "Product Designer",
                department: "Design",
                status: "Active",
                joinedDate: new Date("2023-01-15"),
            },
        });

        const emp2 = await prisma.employee.create({
            data: {
                firstName: "Michael",
                lastName: "Chen",
                email: "michael.chen@company.com",
                role: "Frontend Developer",
                department: "Engineering",
                status: "Active",
                joinedDate: new Date("2023-02-01"),
            },
        });

        return NextResponse.json({ success: true, message: "Database seeded successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
