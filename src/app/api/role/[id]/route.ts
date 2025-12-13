import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const intId = Number(id);
    if (!id || isNaN(intId))
        return NextResponse.json({ error: !id ? "ID param is missing" : "ID must be a number" }, { status: 400 });

    try {
        return NextResponse.json({ message: "Role deleted successfully", role: await prisma.role.delete({ where: { id: intId } }) });
    } catch (e: any) {
        return NextResponse.json({ error: e.code === "P2025" ? "Role not found" : "Something went wrong" }, { status: e.code === "P2025" ? 404 : 500 });
    }
}





export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const intId = Number(id);

    if (!id || isNaN(intId))
        return NextResponse.json(
            { error: !id ? "ID param is missing" : "ID must be a number" },
            { status: 400 }
        );

    let body;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    try {
        return NextResponse.json({
            message: "Role updated successfully",
            role: await prisma.role.update({ where: { id: intId }, data: body }),
        });
    } catch (e: any) {
        return NextResponse.json(
            { error: e.code === "P2025" ? "Role not found" : "Something went wrong" },
            { status: e.code === "P2025" ? 404 : 500 }
        );
    }
}
