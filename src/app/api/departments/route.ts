import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("BODY:", body)

    const name = body.name?.trim()
    const description = body.description?.trim()

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name dan description wajib diisi" },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error("CREATE DEPARTMENT ERROR:", error)
    return NextResponse.json(
      { message: "Gagal membuat department" },
      { status: 500 }
    )
  }
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
