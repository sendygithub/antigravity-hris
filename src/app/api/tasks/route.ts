import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// model Task {
//   id         String   @id @default(uuid())
//   title      String
//   assigneeId String
//   assignee   Employee @relation(fields: [assigneeId], references: [id])
//   priority   String
//   status     String
//   dueDate    DateTime
// }

export async function POST(request: NextRequest) {
    const body = await request.json();
    const task = await prisma.task.create({
        data: {
            title: body.title,
            assigneeId: body.assigneeId,
            priority: body.priority,
            status: body.status,
            dueDate: body.dueDate,

        }
    });
    return NextResponse.json(task);
}


export async function GET() {
    try {
        const tasks = await prisma.task.findMany();
        return NextResponse.json(tasks);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
