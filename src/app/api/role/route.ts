import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";



export async function POST(request: NextRequest) {
    const body = await request.json();
    const role = await prisma.role.create({
        data: {
            title: body.title,
            description: body.description,
            permissions: body.permissions,
        }
    });
    return NextResponse.json(role);
}


export async function GET() {
    try {
        const roles = await prisma.role.findMany();
        return NextResponse.json(roles);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
