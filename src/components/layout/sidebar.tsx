"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    ShieldAlert,
    CreditCard,
    FileText,
    CheckSquare,
    Menu,
    LogOut,
    Building2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "Employees",
            icon: Users,
            href: "/employees",
            active: pathname === "/employees",
        },
        {
            label: "Attendance",
            icon: CalendarCheck,
            href: "/attendance",
            active: pathname === "/attendance",
        },
        {
            label: "Departments",
            icon: Building2,
            href: "/departments",
            active: pathname === "/departments",
        },
        {
            label: "Roles",
            icon: ShieldAlert,
            href: "/roles",
            active: pathname === "/roles",
        },
        {
            label: "Payroll",
            icon: CreditCard,
            href: "/payroll",
            active: pathname === "/payroll",
        },
        {
            label: "Leave Request",
            icon: FileText,
            href: "/leave",
            active: pathname === "/leave",
        },
        {
            label: "Tasks",
            icon: CheckSquare,
            href: "/tasks",
            active: pathname === "/tasks",
        },
    ]

    return (
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2 px-4 mb-6">
                        <div className="p-1 bg-primary rounded-lg">
                            <Building2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">HR PRO</h2>
                        <div className="ml-auto">
                            <ModeToggle />
                        </div>
                    </div>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link key={route.href} href={route.href}>
                                <Button
                                    variant={route.active ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <route.icon className="h-4 w-4" />
                                    {route.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full px-3">
                <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Admin User</span>
                            <span className="text-xs text-muted-foreground">admin@company.com</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            toast.success("Logged out successfully");
                            window.location.href = "/login";
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <Sidebar className="border-none w-full" />
            </SheetContent>
        </Sheet>
    )
}
