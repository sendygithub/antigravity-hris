import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Building } from "lucide-react";
import { AddDepartmentDialog } from "@/components/departments/add-department-dialog";

const departments = [
    { name: "Engineering", head: "Michael Chen", employees: 12, budget: "$450,000" },
    { name: "Design", head: "Sarah Miller", employees: 6, budget: "$180,000" },
    { name: "Human Resources", head: "Jessica Davis", employees: 3, budget: "$90,000" },
    { name: "Marketing", head: "David Wilson", employees: 5, budget: "$150,000" },
];

export const dynamic = 'force-dynamic';

export default function DepartmentsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">{dept.name}</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    {dept.employees} Employees
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    Head: {dept.head}
                                </div>
                                <div className="pt-4 border-t mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Budget</span>
                                        <span className="text-sm font-bold">{dept.budget}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add New Department Card (Placeholder) */}
                <AddDepartmentDialog />
            </div>
        </div>
    );
}
