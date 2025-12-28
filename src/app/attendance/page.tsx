"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddAttendanceDialog } from "@/components/attendance/add-attendance-dialog";
import { TableAttendance } from "@/components/attendance/table-attendance";
import { ColumnDef } from "@tanstack/react-table"
import { Attendance } from "../../../generated/prisma";
import * as React from "react";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
import {  useEffect } from "react";


// =================konversi iso date ke indonesia  =================
export function formatTanggalID(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const attendanceData: ColumnDef<Attendance>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
            formatTanggalID(row.getValue("date")),
    },
    {
        accessorKey: "employeeId",
        header: "Employee ID",
    },
    {
        accessorKey: "checkIn",
        header: "check In",
        cell: ({ row }) =>
            formatTanggalID(row.getValue("checkIn")),
    },
    {
        accessorKey: "checkOut",
        header: "check Out",
        cell: ({ row }) =>
            formatTanggalID(row.getValue("checkOut")),
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
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {  }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

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

export default function AttendancePage() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchAttendance = async () => {
         setLoading(true) 
        try {
            const res = await fetch("/api/attendance");
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
        fetchAttendance();
    }, []);

    if (loading) return <p>Loading Attendance Data...</p>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"> 
                <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <AddAttendanceDialog onSuccess={fetchAttendance}/>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">112 / 128</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">On Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">95</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">17</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">16</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Attendance Records</h2>
                </div>
                <div className="space-y-1">
                    <TableAttendance columns={attendanceData} data={data} />
                </div>
            </div>
        </div>
    );
}
