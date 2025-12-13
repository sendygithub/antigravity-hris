import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { RunPayrollDialog } from "@/components/payroll/run-payroll-dialog";
import { ExportPayrollDialog } from "@/components/payroll/export-payroll-dialog";
import { ViewSlipDialog } from "@/components/payroll/view-slip-dialog";

const payrollData = [
    { id: 1, name: "Sarah Miller", salary: "$5,800", status: "Paid", date: "Oct 30, 2023" },
    { id: 2, name: "Michael Chen", salary: "$5,200", status: "Paid", date: "Oct 30, 2023" },
    { id: 3, name: "David Wilson", salary: "$5,500", status: "Processing", date: "Nov 30, 2023" },
    { id: 4, name: "Jessica Davis", salary: "$4,900", status: "Pending", date: "Nov 30, 2023" },
];

export default function PayrollPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
                <div className="flex gap-2">
                    <ExportPayrollDialog />
                    <RunPayrollDialog />
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

            <Card>
                <CardHeader>
                    <CardTitle>Salary History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrollData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.name}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.salary}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            record.status === "Paid" ? "default" :
                                                record.status === "Processing" ? "secondary" :
                                                    "outline"
                                        }>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ViewSlipDialog record={record} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
