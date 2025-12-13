import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MoreHorizontal } from "lucide-react";

const tasks = [
    { id: 1, title: "Onboard new designers", assignee: "Sarah Miller", priority: "High", status: "To Do", due: "Dec 10" },
    { id: 2, title: "Update payroll for Nov", assignee: "Jessica Davis", priority: "Medium", status: "In Progress", due: "Dec 15" },
    { id: 3, title: "Fix login bug", assignee: "David Wilson", priority: "Critical", status: "Done", due: "Nov 28" },
    { id: 4, title: "Designing New Logo", assignee: "Sarah Miller", priority: "Low", status: "To Do", due: "Dec 20" },
    { id: 5, title: "Server Maintenance", assignee: "Michael Chen", priority: "High", status: "In Progress", due: "Dec 12" },
];

import { AddTaskDialog } from "@/components/tasks/add-task-dialog";

export default function TasksPage() {
    const todo = tasks.filter(t => t.status === "To Do");
    const inProgress = tasks.filter(t => t.status === "In Progress");
    const done = tasks.filter(t => t.status === "Done");

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
                <AddTaskDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-3 h-full overflow-hidden">
                {/* To Do Column */}
                <div className="flex flex-col h-full bg-secondary/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-4 flex items-center justify-between">
                        To Do <Badge variant="secondary">{todo.length}</Badge>
                    </h3>
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {todo.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="flex flex-col h-full bg-secondary/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-4 flex items-center justify-between">
                        In Progress <Badge variant="default" className="bg-blue-600">{inProgress.length}</Badge>
                    </h3>
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {inProgress.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>

                {/* Done Column */}
                <div className="flex flex-col h-full bg-secondary/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-4 flex items-center justify-between">
                        Done <Badge variant="default" className="bg-green-600">{done.length}</Badge>
                    </h3>
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {done.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskCard({ task }: { task: any }) {
    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <Badge variant="outline" className={
                    task.priority === 'Critical' ? 'text-red-500 border-red-200 bg-red-50' :
                        task.priority === 'High' ? 'text-orange-500 border-orange-200 bg-orange-50' :
                            'text-gray-500 border-gray-200 bg-gray-50'
                }>{task.priority}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <h4 className="font-semibold text-sm mb-2">{task.title}</h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                            <AvatarFallback>{task.assignee.split(' ').map((n: any) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span>{task.assignee}</span>
                    </div>
                    <span>{task.due}</span>
                </div>
            </CardContent>
        </Card>
    )
}
