import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const department = await prisma.department.create({
        data: {
            id: body.id,
            name: body.name,
            description: body.description,

        }
    });
    return NextResponse.json(department);
}


export async function GET() {
    try {
        const departments = await prisma.department.findMany();
        return NextResponse.json(departments);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
