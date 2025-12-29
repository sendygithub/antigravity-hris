"use client"

import * as React from "react"
import { useEffect, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"

/* ================= SCHEMA ================= */
const editTaskSchema = z.object({
  title: z.string().min(2, "Title minimal 2 karakter"),
  assigneeId: z.number().min(1, "Pilih assignee"),
  priority: z.string().min(1, "Priority wajib diisi"),
  status: z.string().min(1, "Status wajib diisi"),
  dueDate: z.string().min(1, "Tanggal wajib diisi"),
})

/* ================= TYPES ================= */
type EditTaskDialogProps = {
  task: {
    id: number
    title: string
    priority: string
    status: string
    dueDate: string
    assigneeId: number
  }
  onSuccess: () => void
}

type Employee = {
  id: number
  Name: string
}

/* ================= COMPONENT ================= */
export function EditTaskDialog({ task, onSuccess }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  /* ================= FETCH EMPLOYEES ================= */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees")
        if (!res.ok) throw new Error()
        const data = await res.json()
        setEmployees(data)
      } catch {
        toast.error("Gagal memuat data employee")
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [])

  /* ================= FORM ================= */
  const form = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId,
    },
  })

  /* ================= SUBMIT ================= */
  const onSubmit = async (values: z.infer<typeof editTaskSchema>) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error()

      toast.success("Task berhasil diperbarui")
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error("Gagal memperbarui task")
      console.error(error)
    }
  }

  /* ================= RENDER ================= */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Perbarui data task</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value?.toString()}
                    disabled={loadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Textarea {...field} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Update Task</Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
