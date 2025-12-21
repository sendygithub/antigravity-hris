import { NextResponse } from "next/server"; // import NextResponse untuk membuat HTTP response
import { prisma } from "@/lib/db"; // import instance Prisma Client untuk akses database

// ================= DELETE API =================
export async function DELETE(
    _req: Request, // object request (tidak dipakai, jadi diberi _)
    context: { params: Promise<{ id: string }> } // params dikirim Next.js sebagai Promise, harus di-await
) {
    const { id } = await context.params; // ambil id dari URL setelah await
    const intId = Number(id); // konversi string id menjadi number sesuai schema Prisma (Int)

    // validasi id: harus ada dan berupa number
    if (!id || Number.isNaN(intId)) {
        return NextResponse.json(
            { error: "ID must be a valid number" }, // response jika id invalid
            { status: 400 } // HTTP 400 Bad Request
        );
    }

    try {
        // hapus task dari database berdasarkan id
        const task = await prisma.task.delete({
            where: { id: intId }, // kriteria delete
        });

        // kembalikan response sukses
        return NextResponse.json(
            {
                message: "task deleted successfully",
                task, // data task yang dihapus
            },
            { status: 200 } // HTTP 200 OK
        );
    } catch (e: any) {
        // jika error P2025: record tidak ditemukan
        if (e.code === "P2025") {
            return NextResponse.json(
                { error: "task not found" },
                { status: 404 } // HTTP 404 Not Found
            );
        }

        // error lainnya
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 } // HTTP 500 Internal Server Error
        );
    }
}

// ================= PUT API =================
export async function PUT(
    req: Request, // object request untuk membaca body JSON
    context: { params: Promise<{ id: string }> } // params dikirim Next.js sebagai Promise
) {
    const { id } = await context.params; // ambil id dari URL
    const intId = Number(id); // konversi id ke number sesuai schema Prisma

    // validasi id: harus ada dan berupa number
    if (!id || isNaN(intId))
        return NextResponse.json(
            { error: !id ? "ID param is missing" : "ID must be a number" },
            { status: 400 } // HTTP 400 Bad Request
        );

    let body;
    try {
        body = await req.json(); // ambil data JSON dari request body
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    try {
        // update task di database berdasarkan id
        const task = await prisma.task.update({
            where: { id: intId }, // kriteria update
            data: body, // data yang dikirim untuk update
        });

        // kembalikan response sukses
        return NextResponse.json({
            message: "task updated successfully",
            task, // data task setelah diupdate
        });
    } catch (e: any) {
        // jika error P2025: record tidak ditemukan
        return NextResponse.json(
            { error: e.code === "P2025" ? "task not found" : "Something went wrong" },
            { status: e.code === "P2025" ? 404 : 500 } // 404 jika tidak ada, 500 untuk error lainnya
        );
    }
}
