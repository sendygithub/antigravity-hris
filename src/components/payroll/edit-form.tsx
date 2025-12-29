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
const editPayrollSchema = z.object({
     employeeId: z.number().min(1, "Please select employee"),
     salary: z.coerce.number().min(1, "Salary wajib diisi"),
     payDate: z.string().min(1, "Tanggal rekrut wajib diisi"),
     status: z.string().optional(),
  
})
                                // 2. deklarasi props untuk komponen EditPayrollDialog
type EditPayrollDialogProps = {
  payroll: {
    id: number
    employeeId: number
    salary: number
    payDate: string
    status: string
    
    
  }
  onSuccess: () => void 
}
type Employee = {
  id: number
  Name: string
 
  // ... field lain jika perlu
}


                                       // 3. form utama EditPayrollDialog
export function EditPayrollDialog({ payroll, onSuccess }: EditPayrollDialogProps) {
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


  const form = useForm<z.infer<typeof editPayrollSchema>>({
    resolver: zodResolver(editPayrollSchema),
    defaultValues: {
      
      employeeId: payroll.employeeId,
      salary: payroll.salary,
      payDate: payroll.payDate,
      status: payroll.status,

    }
  })
                                       // 4. coding simpan data hasil edit
  const onSubmit = async (values: z.infer<typeof editPayrollSchema>) => {
    try {
      const res = await fetch(`/api/payroll/${payroll.id}`, {
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
          <DialogTitle>Edit Payroll</DialogTitle>
          <DialogDescription>Edit the payroll and its details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      Memuat employee...
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

          
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Pay Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />
                  

           


            <FormField
  control={form.control}
  name="salary"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Salary</FormLabel>
      <FormControl>
        <Input
          type="number"
          value={field.value ?? ""}
          onChange={(e) =>
            field.onChange(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        />
      </FormControl>
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


export default EditPayrollDialog