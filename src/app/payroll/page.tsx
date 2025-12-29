"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RunPayrollDialog } from "@/components/payroll/run-payroll-dialog";
import { ExportPayrollDialog } from "@/components/payroll/export-payroll-dialog";
import { TablePayroll } from "@/components/payroll/table-payroll";
import { ColumnDef } from "@tanstack/react-table"
import { Payroll } from "../../../generated/prisma";
import * as React from "react";
import {  useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
import { EditPayrollDialog } from "@/components/payroll/edit-form";

// =================konversi iso date ke indonesia  =================
// =================konversi iso date ke indonesia  =================
export function formatTanggalID(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}



export default function PayrollPage() {
  // ================= STATE =================
const [data, setData] = React.useState([]);
const [loading, setLoading] = React.useState(true);
const [deletingId, setdeletingId] = React.useState(false);
// ================= FETCH DATA =================
const fetchPayroll = async () => {
     setLoading(true) 
    try {
        const res = await fetch("/api/payroll");
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
        fetchPayroll()
      }, [])
    

      //DELETE LEAVE REQUEST
const handleDelete = async (id: number) => {
  if (!confirm("Yakin ingin menghapus data ini?")) return

  try {
    const res = await fetch(`/api/payroll/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete payroll")
       setData(prev => prev.filter(item => Number(item.id) !== id))

  } catch (error) {
    console.error(error)
  } finally {
    setdeletingId(false)
  }
}

      if (loading) return <p>Loading Data Payroll...</p>


      

const datapayrol: ColumnDef<Payroll>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "salary",
        header: "Salary",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "paymentDate",
        header: "Pay Date",
        cell: ({ row }) => {
            const date = row.getValue("paymentDate") as string;
            return <span>{formatTanggalID(date)}</span>;
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const payroll = row.original;

            return (
                <div className="flex gap-2">
                    <EditPayrollDialog payroll={payroll} onSuccess={fetchPayroll} />

                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === true}
                        onClick={() => { handleDelete(payroll.id) }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
                <div className="flex gap-2">
                    <ExportPayrollDialog />
                    <RunPayrollDialog onSuccess={fetchPayroll} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$21,400</div>
                        <p className="text-xs text-muted-foreground">Current month estimation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Salary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$5,350</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-8">
                <TablePayroll columns={datapayrol} data={data} />
                </div>
        </div>
    );
}