'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const employeeSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.string().min(2, "Role is required"),
    department: z.string().min(2, "Department is required"),
})

export async function createEmployee(data: z.infer<typeof employeeSchema>) {
    try {
        const validatedData = employeeSchema.parse(data)

        await prisma.employee.create({
            data: {
                ...validatedData,
                status: "Active",
            },
        })

        revalidatePath("/employees")
        return { success: true }
    } catch (error) {
        console.error("Failed to create employee:", error)
        return { success: false, error: "Failed to create employee" }
    }
}
