import { employees } from "@/lib/mock-data"
import { columns } from "@/components/employees/columns"
import { DataTable } from "@/components/employees/data-table"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                <AddEmployeeDialog />
            </div>
            <DataTable columns={columns} data={employees} />
        </div>
    )
}
