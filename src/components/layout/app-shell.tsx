"use client"

import { usePathname } from "next/navigation"
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === "/login"

    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 md:hidden">
                    <MobileSidebar />
                    <span className="font-semibold">HR PRO</span>
                </header>
                <main className="flex-1 overflow-y-auto p-6 bg-muted/10 relative">

                    {children}
                </main>
            </div>
        </div>
    )
}
