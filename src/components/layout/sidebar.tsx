"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  ReceiptText,
  Boxes,
  History,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Store,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

const ROUTES = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },

  {
    label: "Products",
    icon: Package,
    href: "/dashboard/products",
  },

  {
    label: "Categories",
    icon: Tags,
    href: "/dashboard/categories",
  },

  {
    label: "Suppliers",
    icon: Truck,
    href: "/dashboard/suppliers",
  },

  {
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
  },

  {
    label: "POS",
    icon: ShoppingCart,
    href: "/dashboard/pos",
  },

  {
    label: "Sales",
    icon: ReceiptText,
    href: "/dashboard/sales",
  },

  {
    label: "Stock",
    icon: Boxes,
    href: "/dashboard/stock",
  },

  {
    label: "Stock History",
    icon: History,
    href: "/dashboard/stock-history",
  },

  {
    label: "Reports",
    icon: BarChart3,
    href: "/dashboard/reports",
  },

  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
] as const;

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        {/* Active indicator — left border accent */}
        {active && (
          <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
        )}
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            active ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span>{label}</span>
      </div>
    </Link>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn("flex h-screen flex-col border-r bg-card pb-0", className)}
    >
      {/* ── Brand / Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
          <Store className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight">POSPro</h2>

          <p className="text-[11px] text-muted-foreground">
            Inventory Management
          </p>
        </div>
        <ModeToggle />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {ROUTES.map((route) => (
            <NavItem
              key={route.href}
              href={route.href}
              icon={route.icon}
              label={route.label}
              active={isActive(route.href)}
            />
          ))}
        </div>
      </nav>

      {/* ── User section ─────────────────────────────────────────────── */}
      <div className="border-t bg-gradient-to-t from-muted/30 to-transparent px-3 pb-3 pt-3">
        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-border">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-xs font-medium">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Admin User</p>
              <p className="truncate text-xs text-muted-foreground">
                admin@company.com
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              toast.success("Logged out successfully");
              window.location.href = "/login";
            }}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
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
        <Sidebar className="w-full border-none" />
      </SheetContent>
    </Sheet>
  );
}
