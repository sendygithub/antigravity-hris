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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// --- Zod schema disesuaikan dengan Prisma ---
const formSchema = z.object({
    Name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    status: z.string().min(1, "Status wajib diisi"),
    // Mengubah string dari input date menjadi Date Object
    hiredDate: z.string().min(1, "Tanggal rekrut wajib diisi"),
    joinedDate: z.string().min(1, "Tanggal bergabung wajib diisi"),
    // Kirim ID sebagai angka sesuai schema Prisma
    roleId: z.string().min(1, "Role wajib dipilih"),
    departmentId: z.string().min(1, "Department wajib dipilih"),
})

export function AddEmployeeDialog() {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Name: "",
            email: "",
            status: "",
            hiredDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
            joinedDate: new Date().toISOString().split('T')[0],
            roleId: "",
            departmentId: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Transformasi data sebelum dikirim ke API
            const payload = {
                ...values,
                roleId: parseInt(values.roleId),
                departmentId: parseInt(values.departmentId),
                hiredDate: new Date(values.hiredDate).toISOString(),
                joinedDate: new Date(values.joinedDate).toISOString(),
            }

            const res = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Gagal menambahkan karyawan")
                return
            }

            toast.success("Karyawan berhasil ditambahkan")
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
                    <Plus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Employee</DialogTitle>
                    <DialogDescription>Masukkan data karyawan baru sesuai form di bawah.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="Name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input placeholder="name@gmail.com" {...field} /></FormControl>
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
                                                <SelectItem value="magang">Magang</SelectItem>
                                                <SelectItem value="harian">Harian</SelectItem>
                                                <SelectItem value="bulanan">Bulanan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="hiredDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hire Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="joinedDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Joined Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Engineering</SelectItem>
                                                <SelectItem value="2">Design</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Dept" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">IT</SelectItem>
                                                <SelectItem value="2">HR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full">Save Employee</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}