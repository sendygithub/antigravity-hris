import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    await prisma.tasks.delete({ where: { id } });
    return NextResponse.json({ message: "Attendance deleted successfully" });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const body = await request.json();
    await prisma.tasks.update({ where: { id }, data: body });
    return NextResponse.json({ message: "Attendance updated successfully" });
}