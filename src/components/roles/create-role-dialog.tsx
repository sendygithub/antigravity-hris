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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"


const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    permissions: z.string().min(10, "Description must be at least 10 characters")
})

export function CreateRoleDialog() {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            permissions:""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const res =await fetch("/api/role", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.message || "Failed to create role")
            }
            toast.success("Role created successfully")

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
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Role</DialogTitle>
                    <DialogDescription>
                        Define a new role and its permissions.
                    </DialogDescription>
                </DialogHeader> 
                
                
                <Form {...form}>
                   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Developer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the responsibilities..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="permissions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Permissions</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the permissions..."
                                            className="resize-none"
                                            {...field}
                                        />
                                            
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <DialogFooter>
                            <Button type="submit">Create Role</Button>
                        </DialogFooter>
                    
                </form>
                </Form>
                
            </DialogContent>
        </Dialog>

       
        
    )
}
