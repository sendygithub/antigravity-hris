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
const editEmployeeSchema = z.object({
  Name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(5, "Email must be at least 5 characters").email("Invalid email address"),
  status: z.string().min(2, "Status must be at least 2 characters"),
  roleId: z.number().int().min(1),
  departmentId: z.number().int().min(1),
  hiredDate: z.string().min(10, "Hire Date must be at least 10 characters"),
  joinedDate: z.string().min(10, "Joined Date must be at least 10 characters"),
  
})
                                // 2. deklarasi props untuk komponen EditEmployeeDialog
type EditEmployeeDialogProps = {
  employee: {
    id: number
    Name: string
    email: string
    status: string
    roleId: number
    departmentId: number
    hiredDate: string
    joinedDate: string
    
  }
  onSuccess: () => void 
}
type Role = {
  id: number
  title: string
  description?: string
  // ... field lain jika perlu
}

type Department = {
  id: number
  name: string
  description?: string
  // ... field lain jika perlu
}

                                       // 3. form utama EditTaskDialog
export function EditTaskDialog({ employee, onSuccess }: EditEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/role?select=id,title')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setRoles(data)
      } catch (err) {
        toast.error("Gagal memuat daftar role")
      } finally {
        setLoadingRoles(false)
      }
    }
    fetchRoles()
  }, [])

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments?select=id,name')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setDepartments(data)
      } catch (err) {
        toast.error("Gagal memuat daftar departemen")
      } finally {
        setLoadingDepartments(false)
      }
    }
    fetchDepartments()
  }, [])


  const form = useForm<z.infer<typeof editEmployeeSchema>>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      
      Name: employee.Name,
      email: employee.email,
      status: employee.status,
      roleId: employee.roleId,
      departmentId: employee.departmentId,
      hiredDate: employee.hiredDate,
      joinedDate: employee.joinedDate,
      
      
    }
  })
                                       // 4. coding simpan data hasil edit
  const onSubmit = async (values: z.infer<typeof editEmployeeSchema>) => {
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
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
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Edit the task and its details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="Name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>email</FormLabel>
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
              name="hiredDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>hiredDate</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="joinedDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>joinedDate</FormLabel>
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
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  {!loadingRoles ? (
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
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.title}
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

          <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  {!loadingDepartments ? (
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih department..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 border rounded-md px-3 py-2 text-sm opacity-50">
                      Memuat department...
                    </div>
                  )}
                  <FormDescription>
                    Department yang akan diberikan kepada karyawan ini
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
