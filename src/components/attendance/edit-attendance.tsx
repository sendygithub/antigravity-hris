"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

                                        // 1. deklarasi schema validasi dengan zod
const editAttendanceSchema = z.object({
    checkIn: z.date().min(2, "Name must be at least 2 characters"),
    checkOut: z.string().min(10, "Description must be at least 10 characters"),
    date: z.string().min(5, "Date must be at least 5 characters"),
    status: z.string().min(2, "Status must be at least 2 characters"),
    employeeId: z.number().min(1, "Please select employee"),

})
                                        // 2. deklarasi props untuk komponen EditRoleDialog
type EditAttendanceDialogProps = {                                                                                           attendance: {
        id: number 
        checkIn: string 
        checkOut: string 
        status: string
        date: string
        employeeId: number
    }
    onSuccess: () => void
    }

    type Employee = {
        id: number
        name: string
    }

                                       // 3. form utama EditdepartmentDialog
export default function EditAttendanceDialog({attendance, onSuccess}: EditAttendanceDialogProps) {

const [open, setOpen] = useState(false)
const [employees, setEmployees] = useState<Employee[]>([])
const [loadingEmployees, setLoadingEmployees] = useState(true)

const form = useForm<z.infer<typeof editAttendanceSchema>>({
    resolver: zodResolver(editAttendanceSchema),
    defaultValues: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        date: attendance.date,
        status: attendance.status,
        employeeId: attendance.employeeId,


}})
useEffect(() => {
  if (open) {
    form.reset({
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      date: attendance.date,
      status: attendance.status,
      employeeId: attendance.employeeId,
    })
  }
}, [open, attendance, form])


  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch('/api/employees?select=id,Name')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setEmployees(data)
      } catch (err) {
        toast.error("Gagal memuat daftar employees")
      } finally {
        setLoadingEmployees(false)
      }
    }
    fetchEmployees()
  }, [])


                                      // 4. coding simpan data hasil edit
const onSubmit = async (values: z.infer<typeof editAttendanceSchema>) => {
    try {
        const res = await fetch(`/api/attendance/${attendance.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
        })

        const data = await res.json()
        if (!res.ok) {
            toast.error(data.message || "Failed to update attendance")
            return
        }

        toast.success("attendance updated successfully")
        form.reset(values)
        setOpen(false)
        // panggil callback untuk refresh tabel
        onSuccess()
    } catch (error) {
        toast.error("An unexpected error occurred.")
        console.error(error)
    }
}




    return (
        <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit attendance</DialogTitle>
          <DialogDescription>Edit the attendance and its details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  {!loadingEmployees ? (
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih role..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 border rounded-md px-3 py-2 text-sm opacity-50">
                      Memuat role...
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="checkIn"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Check In</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkOut"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Check Out</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            

            <DialogFooter>
              <Button type="submit">Update Attendance</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    )
}