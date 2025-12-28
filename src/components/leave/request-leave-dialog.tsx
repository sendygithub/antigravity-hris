"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {  Plus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { useEffect } from "react"
import { employees } from "@/lib/mock-data"

type employee = {
    id: number
    Name:  string
}

// 1. deklarasi schema validasi dengan zod

const formSchema = z.object({
    employeeId: z.number().min(1, "Please select employee"),
    type: z.string().min(1, "Please select leave type"),
    startDate: z.string().min(1, "Tanggal rekrut wajib diisi"),
    endDate: z.string().min(1, "Tanggal rekrut wajib diisi"),
    reason: z.string().min(5, "Reason is required"),
    status: z.string().optional(),

})

export function RequestLeaveDialog({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [employees, setEmployees] = useState<employee[]>([])
    const [loadingemployees, setLoadingemployees] = useState(true)

    // FETCH EMPLOYEES
    useEffect(() => {
        async function fetchEmployees() {
            try {
                const res = await fetch("/api/employees?select=id,name")
                if (!res.ok) throw new Error("Failed to fetch")
                const result = await res.json()
                setEmployees(result)
            } catch (error) {
               toast.error("Gagal memuat daftar employees")
               console.error(error)
            } finally {
                setLoadingemployees(false)
            }
            
        }
        fetchEmployees()
    }, [])
  
    // 2. deklarasi form dan onSubmit function
          
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "",
            reason: "",
            startDate:new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            employeeId: 0,
            status: "Pending",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {

        try {



            const payload = {
                ...values,
                 
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
            }
        const res = await fetch("/api/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Gagal menambahkan request cuti")
                return
            }

            toast.success("Request berhasil ditambahkan")
            form.reset()
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            toast.error("Terjadi kesalahan sistem")
            console.error(error)
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Request Leave
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                        Submit a new leave request for approval.
                    </DialogDescription>
                </DialogHeader>


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


                            <FormField
                                control={form.control}
                                name="employeeId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    {!loadingemployees ? (
                                        <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}
                                        >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih employee..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                                {employee.Name}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="h-10 border rounded-md px-3 py-2 text-sm opacity-50">
                                        Memuat Employees...
                                        </div>
                                    )}
                                    
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leave Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                            <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                                            <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                   
                                            <FormControl>
                                                
                                            </FormControl>
                                                <Input type="date" {...field} />
                                        
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                   
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                       
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Reason for leave request..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Submit Request</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
