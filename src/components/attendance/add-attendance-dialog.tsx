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
    
    DialogFooter,
   
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
import { Input } from "@/components/ui/input"


import { toast } from "sonner"


const formSchema = z.object({
    employeeId: z.string().min(1, "Please select a month"),
    checkIn: z.string().min(1, "Please enter check in time"),
    checkOut: z.string().min(1, "Please enter check out time"),
    status: z.string().min(4, "Please enter status"),
    date: z.string().min(1, "Please enter date"),


})

export function AddAttendanceDialog() {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeId: "",
            date: "",
            checkIn: "",
            checkOut: "",
            status: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
       try {

        const payload = {
                employeeId: parseInt(values.employeeId),
                date: new Date(values.date).toISOString(), // String to Int1
                checkIn: new Date(values.checkIn).toISOString(),
                checkOut: new Date(values.checkIn).toISOString(),
                status: values.status,
            }

            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.message || "Failed to create department")
            }
            toast.success("Department created successfully")
            
            form.reset()
            setOpen(false)
        } catch (error) {
            toast.error("An unexpected error occurred.")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mb-5">
                    <Plus className="mr-2 h-4 w-4" /> Add Attendance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               
                
                
                
                
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">    


                               <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID employee</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1,2,3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal</FormLabel>
                                     <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                   
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="checkIn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Check In</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="checkOut"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Check Out</FormLabel>
                                     <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                   
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                        
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                     
                        <DialogFooter>
                            <Button type="submit">Save Attendance</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
