"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Input } from "../ui/input"

const formSchema = z.object({
    employeeId: z.string().min(1, "Please select a month"),
    status: z.string().min(4, "Please select a year"),
    paymentDate: z.string().min(1, "Please select a payment date"),
    salary: z.string().min(1, "Please enter a salary amount"),
})

export function RunPayrollDialog() {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeId: "",
            status: "",
            paymentDate: "",
            salary: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const payload = {
                employeeId: parseInt(values.employeeId), // String to Int
                salary: parseFloat(values.salary),       // String to Decimal/Float
                status: values.status,                   // String
                paymentDate: new Date(values.paymentDate).toISOString(), // String to DateTime
            }
            const res = await fetch("/api/payroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Gagal menambahkan salary")
                return
            }

            toast.success("salary berhasil ditambahkan")
            form.reset()
            setOpen(false)
        } catch (error) {

             toast.error("Terjadi kesalahan sistem")
            console.error(error)
            
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Input Payroll
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Run Payroll</DialogTitle>
                    <DialogDescription>
                        Process payroll for all employees for the selected period.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4"> 
                            
                              <FormField
                                control={form.control}
                                name="employeeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID Employee</FormLabel>
                                        <FormControl><Input type="number" placeholder="John Doe" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            
                             
                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date</FormLabel>
                                        <FormControl><Input type="date"{...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="dibayar">Dibayar</SelectItem>
                                                <SelectItem value="menunggu">Menunggu</SelectItem>
                                                <SelectItem value="belum_dibayar">Belum Dibayar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salary</FormLabel>
                                        <FormControl><Input placeholder="0" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />



                        </div>
                          


                        <DialogFooter>
                            <Button type="submit" className="hover bg-yellow-400">Save changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
