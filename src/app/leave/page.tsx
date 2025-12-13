import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus } from "lucide-react";

const leaveRequests = [
    { id: 1, name: "Jessica Davis", type: "Sick Leave", dates: "Nov 30 - Dec 2", status: "Pending", reason: "Fever and flu" },
    { id: 2, name: "Michael Chen", type: "Annual Leave", dates: "Dec 15 - Dec 20", status: "Approved", reason: "Family vacation" },
    { id: 3, name: "Sarah Miller", type: "Personal Leave", dates: "Dec 1", status: "Rejected", reason: "Important meeting scheduled" },
];

import { RequestLeaveDialog } from "@/components/leave/request-leave-dialog";

export default function LeavePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                <RequestLeaveDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {leaveRequests.map((req) => (
                    <Card key={req.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Badge variant={req.status === "Approved" ? "default" : req.status === "Pending" ? "secondary" : "destructive"}>
                                    {req.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{req.type}</span>
                            </div>
                            <CardTitle className="mt-2 text-lg">{req.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" /> {req.dates}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">"{req.reason}"</p>
                            <div className="flex gap-2">
                                {req.status === "Pending" && (
                                    <>
                                        <Button variant="default" size="sm" className="w-full">Approve</Button>
                                        <Button variant="outline" size="sm" className="w-full">Reject</Button>
                                    </>
                                )}
                                {req.status !== "Pending" && (
                                    <Button variant="outline" size="sm" className="w-full" disabled>Processed</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
