"use client";
import { useAuthStore } from "@/stores/authStore";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BarChart3, LogOut } from "lucide-react";

const adminNavItems = [
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuthStore();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-red-600">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted w-full rounded-lg transition"
          >
            Back to User Dashboard
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive w-full rounded-lg hover:bg-muted transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
