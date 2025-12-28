"use client"
import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Task } from "../../../generated/prisma";
import { TableTask } from "@/components/tasks/table-task";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
import * as React from "react";
import { EditTaskDialog } from "@/components/leave/edit-form";



// =================konversi iso date ke indonesia  =================
export function formatTanggalID(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
export const dynamic = 'force-dynamic';
const dataTask: ColumnDef<Task>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "assigneeId",
        header: "Assignee ID",
    },
    {
        accessorKey: "priority",
        header: "Priority",
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) =>
            formatTanggalID(row.getValue("dueDate")),
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const task = row.original

            return (
                <div className="flex gap-2">
                    <EditTaskDialog task={task} onSuccess={() => {}}/>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]

export default function TasksPage() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true); 

    const fetchTasks = async () => {
         setLoading(true) 
        try {
            const res = await fetch("/api/tasks");
            if (!res.ok) throw new Error("Failed to fetch")
            const result = await res.json()
            setData(result)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    if (loading) return <p>Loading Task Data...</p>

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                <AddTaskDialog onSuccess={fetchTasks}/>
            </div>
            <div className="p-8">
                     <TableTask columns={dataTask} data={data}/>
                       </div>
               </div>

           
        
    );
}
