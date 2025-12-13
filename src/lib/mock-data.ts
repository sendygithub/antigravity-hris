export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: "Active" | "On Leave" | "Terminated";
    department: string;
    avatar?: string;
    joinedDate: string;
};

export const employees: Employee[] = [
    {
        id: "EMP001",
        firstName: "Sarah",
        lastName: "Miller",
        email: "sarah.miller@company.com",
        role: "Product Designer",
        status: "Active",
        department: "Design",
        joinedDate: "2023-01-15",
    },
    {
        id: "EMP002",
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@company.com",
        role: "Frontend Developer",
        status: "Active",
        department: "Engineering",
        joinedDate: "2023-02-01",
    },
    {
        id: "EMP003",
        firstName: "Jessica",
        lastName: "Davis",
        email: "jessica.davis@company.com",
        role: "HR Manager",
        status: "On Leave",
        department: "Human Resources",
        joinedDate: "2022-11-20",
    },
    {
        id: "EMP004",
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@company.com",
        role: "Backend Developer",
        status: "Active",
        department: "Engineering",
        joinedDate: "2023-03-10",
    },
    {
        id: "EMP005",
        firstName: "Emily",
        lastName: "Taylor",
        email: "emily.taylor@company.com",
        role: "Marketing Specialist",
        status: "Terminated",
        department: "Marketing",
        joinedDate: "2023-01-05",
    },
];

export type Attendance = {
    id: string;
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: "Present" | "Late" | "Absent";
};
