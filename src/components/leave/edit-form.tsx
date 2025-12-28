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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Employee } from "@prisma/client"
import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"




                                        // 1. deklarasi schema validasi dengan zod
const editTaskSchema = z.object({
 employeeId: z.number().min(1, "Please select employee"),
     type: z.string().min(1, "Please select leave type"),
     startDate: z.string().min(1, "Tanggal rekrut wajib diisi"),
     endDate: z.string().min(1, "Tanggal rekrut wajib diisi"),
     reason: z.string().min(5, "Reason is required"),
     status: z.string().optional(),
  
})
                                // 2. deklarasi props untuk komponen EditTaskDialog
type EditTaskDialogProps = {
  employee: {
    id: number
    Name: string
    startDate: string
    endDate: string
    status: string
    reason: string
    type: string
    
  }
  onSuccess: () => void 
}
type Employee = {
  id: number
  Name: string
 
  // ... field lain jika perlu
}


                                       // 3. form utama EditTaskDialog
export function EditTaskDialog({ employee, onSuccess }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch('/api/employees?select=id,Name')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setEmployees(data)
      } catch (err) {
        toast.error("Gagal memuat daftar nama karyawan")
      } finally {
        setLoadingEmployees(false)
      }
    }
    fetchEmployees()
  }, [])


  const form = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      
      type: "",
            reason: "",
            startDate:new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            employeeId: 0,
            status: "Pending",
      
      
    }
  })
                                       // 4. coding simpan data hasil edit
  const onSubmit = async (values: z.infer<typeof editTaskSchema>) => {
    try {
      const res = await fetch(`/api/tasks/${tasks.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to update role")
        return
      }

      toast.success("Role updated successfully")
      form.reset(values)
      setOpen(false)

      // panggil callback untuk refresh tabel
      onSuccess()
    } catch (error) {
      toast.error("An unexpected error occurred.")
      console.error(error)
    }
  }
                                       // 5. render komponen dialog dan form
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Edit the task and its details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />


            <div className="grid grid-cols-2 gap-4">
              <FormField
              control={form.control}
              name="reason"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input type="email"{...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>status</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />


            </div>

           
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
              control={form.control}
              name="startDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>startDate</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>endDate</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            </div>



            <div className="grid grid-cols-2 gap-4">
              
            
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
                            {employee.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 border rounded-md px-3 py-2 text-sm opacity-50">
                      Memuat role...
                    </div>
                  )}
                  <FormDescription>
                    Role yang akan diberikan kepada karyawan ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          
            </div>
            

            

            <DialogFooter>
              <Button type="submit">Update Role</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


export default EditTaskDialog