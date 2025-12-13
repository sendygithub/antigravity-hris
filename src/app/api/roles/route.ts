import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Users } from "lucide-react";

const roles = [
    { title: "Administrator", users: 2, description: "Full access to all resources and settings." },
    { title: "HR Manager", users: 5, description: "Can manage employees, attendance, payroll, and leave." },
    { title: "Department Head", users: 8, description: "Can manage tasks and view department attendance." },
    { title: "Employee", users: 110, description: "Can view own data, request leave, and manage tasks." },
];

import { CreateRoleDialog } from "@/components/roles/create-role-dialog";

export default function RolesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                <CreateRoleDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-1 h-3 w-3" /> {role.users}
                                </div>
                            </div>
                            <CardTitle>{role.title}</CardTitle>
                            <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">Edit Permissions</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
