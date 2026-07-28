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
            <div className="hidden md:flex md:w-64 md:flex-col md:shrink-0">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Mobile header */}
                <header className="flex h-14 items-center gap-4 border-b bg-card px-6 md:hidden">
                    <MobileSidebar />
                    <span className="font-semibold">POSPro</span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
