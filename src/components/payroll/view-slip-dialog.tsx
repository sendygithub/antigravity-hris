"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download } from "lucide-react"

interface PayrollRecord {
    id: number
    name: string
    salary: string
    status: string
    date: string
}

export function ViewSlipDialog({ record }: { record: PayrollRecord }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">View Slip</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Payslip Detail</DialogTitle>
                    <DialogDescription>
                        Payslip for {record.name} - {record.date}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">Acme Corp Inc.</h3>
                            <p className="text-sm text-muted-foreground">123 Business Rd, Tech City</p>
                        </div>
                        <div className="text-right">
                            <h4 className="font-semibold">Payslip #INV-{record.id}2023</h4>
                            <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Employee Name</p>
                            <p className="font-semibold">{record.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                            <p className="font-semibold">{record.status}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Department</p>
                            <p>Engineering</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <p>Software Engineer</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-semibold">Earnings</h4>
                        <div className="flex justify-between text-sm">
                            <span>Basic Salary</span>
                            <span>{record.salary}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Housing Allowance</span>
                            <span>$500.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Transport Allowance</span>
                            <span>$200.00</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                        <span className="font-bold">Net Pay</span>
                        <span className="font-bold text-lg">{record.salary}</span>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
