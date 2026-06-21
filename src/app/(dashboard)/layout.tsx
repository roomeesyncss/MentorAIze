"use client";
import { useAuthStore } from "@/stores/authStore";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bot, BookOpen, Share2, BarChart3,
  MessageSquare, Settings, LogOut, Play, Users, GraduationCap
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chatbot Settings", href: "/chatbot", icon: Bot },
  { label: "Test Your Bot", href: "/chatbot/preview", icon: Play },
  { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { label: "Training", href: "/training", icon: GraduationCap },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Share", href: "/share", icon: Share2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuthStore();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">MentorAIze</h1>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/chatbot" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
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
