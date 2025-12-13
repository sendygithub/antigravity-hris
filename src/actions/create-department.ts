'use server'

import { revalidatePath } from "next/cache"
import { z } from "zod"

const departmentSchema = z.object({
    name: z.string().min(2),
    head: z.string().min(2),
    budget: z.string().min(1),
})

export async function createDepartment(data: z.infer<typeof departmentSchema>) {
    // Mock server action since Department model doesn't exist yet
    console.log("Creating department:", data)

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath("/departments")
    return { success: true }
}
