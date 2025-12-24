import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {


    try { 
        
        const body = await request.json();
        const task = await prisma.task.create({
        data: {
            title: body.title,
            assigneeId: body.assigneeId,
            priority: body.priority,
            status: body.status,
            dueDate: new Date(body.dueDate),
        }
    });
    return NextResponse.json(task);
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        
    }
   
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
