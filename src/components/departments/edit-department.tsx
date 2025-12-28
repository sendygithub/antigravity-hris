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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useEffect } from "react"

                                        // 1. deklarasi schema validasi dengan zod
const editDepartmentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
})
                                        // 2. deklarasi props untuk komponen EditRoleDialog
type EditDepartmentDialogProps = {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    department: {
        id: number 
        description: string 
        name: string 
    }
    onSuccess: () => void
    }


                                       // 3. form utama EditdepartmentDialog
export default function EditDepartmentDialog({department, onSuccess}: EditDepartmentDialogProps) {

const [open, setOpen] = useState(false)
const form = useForm<z.infer<typeof editDepartmentSchema>>({
    resolver: zodResolver(editDepartmentSchema),
    defaultValues: {
        name: department.name,
        description: department.description,
}})

useEffect(() => {
  if (open) {
    form.reset({
      name: department.name,
      description: department.description,
    })
  }
}, [open, department, form])




                                      // 4. coding simpan data hasil edit
const onSubmit = async (values: z.infer<typeof editDepartmentSchema>) => {
    try {
        const res = await fetch(`/api/departments/${department.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
        })

        const data = await res.json()
        if (!res.ok) {
            toast.error(data.message || "Failed to update department")
            return
        }

        toast.success("Department updated successfully")
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
          <DialogTitle>Edit department</DialogTitle>
          <DialogDescription>Edit the department and its details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            />


            <DialogFooter>
              <Button type="submit">Update Department</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    )
}