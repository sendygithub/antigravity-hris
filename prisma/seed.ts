// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

async function main() {
    // Clear existing data
    await prisma.task.deleteMany()
    await prisma.leaveRequest.deleteMany()
    await prisma.payroll.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.employee.deleteMany()

    console.log('Cleared existing data')

    // Create Employees
    const emp1 = await prisma.employee.create({
        data: {
            firstName: "Sarah",
            lastName: "Miller",
            email: "sarah.miller@company.com",
            role: "Product Designer",
            department: "Design",
            status: "Active",
            joinedDate: new Date("2023-01-15"),
        },
    })

    const emp2 = await prisma.employee.create({
        data: {
            firstName: "Michael",
            lastName: "Chen",
            email: "michael.chen@company.com",
            role: "Frontend Developer",
            department: "Engineering",
            status: "Active",
            joinedDate: new Date("2023-02-01"),
        },
    })

    const emp3 = await prisma.employee.create({
        data: {
            firstName: "Jessica",
            lastName: "Davis",
            email: "jessica.davis@company.com",
            role: "HR Manager",
            department: "Human Resources",
            status: "On Leave",
            joinedDate: new Date("2022-11-20"),
        },
    })

    const emp4 = await prisma.employee.create({
        data: {
            firstName: "David",
            lastName: "Wilson",
            email: "david.wilson@company.com",
            role: "Backend Developer",
            department: "Engineering",
            status: "Active",
            joinedDate: new Date("2023-03-10"),
        },
    })

    console.log('Seeded employees')

    // Create Attendance
    await prisma.attendance.createMany({
        data: [
            { employeeId: emp1.id, date: new Date(), checkIn: "08:55 AM", status: "Present" },
            { employeeId: emp2.id, date: new Date(), checkIn: "09:02 AM", status: "Late" },
            { employeeId: emp4.id, date: new Date(), checkIn: "08:45 AM", status: "Present" },
            { employeeId: emp3.id, date: new Date(), status: "Absent" },
        ],
    })

    console.log('Seeded attendance')

    // Create Payroll
    await prisma.payroll.createMany({
        data: [
            { employeeId: emp1.id, salary: 5800, status: "Paid", paymentDate: new Date("2023-10-30") },
            { employeeId: emp2.id, salary: 5200, status: "Paid", paymentDate: new Date("2023-10-30") },
            { employeeId: emp4.id, salary: 5500, status: "Processing", paymentDate: new Date("2023-11-30") },
            { employeeId: emp3.id, salary: 4900, status: "Pending", paymentDate: new Date("2023-11-30") },
        ]
    })

    console.log('Seeded payroll')

    // Create Leave Requests
    await prisma.leaveRequest.create({
        data: {
            employeeId: emp3.id,
            type: "Sick Leave",
            startDate: new Date("2023-11-30"),
            endDate: new Date("2023-12-02"),
            reason: "Fever and flu",
            status: "Pending"
        }
    })

    console.log('Seeded leave requests')

    // Create Tasks
    await prisma.task.createMany({
        data: [
            { title: "Onboard new designers", assigneeId: emp1.id, priority: "High", status: "To Do", dueDate: new Date("2023-12-10") },
            { title: "Update payroll for Nov", assigneeId: emp3.id, priority: "Medium", status: "In Progress", dueDate: new Date("2023-12-15") },
            { title: "Fix login bug", assigneeId: emp4.id, priority: "Critical", status: "Done", dueDate: new Date("2023-11-28") },
        ]
    })

    console.log('Seeded tasks')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
