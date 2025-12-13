'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const roleSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
})

export async function createRole(data: z.infer<typeof roleSchema>) {
    try {
        const validatedData = roleSchema.parse(data)

        // Check if role already exists
        const existingRole = await prisma.role.findUnique({
            where: { title: validatedData.title },
        })

        if (existingRole) {
            return { success: false, error: "Role already exists" }
        }

        await prisma.role.create({
            data: {
                ...validatedData,
                permissions: "[]", // Default empty permissions
            },
        })

        revalidatePath("/roles")
        return { success: true }
    } catch (error) {
        console.error("Failed to create role:", error)
        return { success: false, error: "Failed to create role" }
    }
}
