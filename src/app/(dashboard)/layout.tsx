"use client";
import { useAuthStore } from "@/stores/authStore";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bot, BookOpen, Share2, BarChart3,
  MessageSquare, Settings, LogOut, Play, Users, GraduationCap,
  Puzzle
} from "lucide-react";

const navItems = [
  { label: "Dashboard",       href: "/dashboard",        icon: LayoutDashboard },
  { label: "Chatbot",         href: "/chatbot",           icon: Bot },
  { label: "Test Bot",        href: "/chatbot/preview",   icon: Play },
  { label: "Knowledge Base",  href: "/knowledge",         icon: BookOpen },
  { label: "Training",        href: "/training",          icon: GraduationCap },
  { label: "Widget & Features", href: "/chatbot/features", icon: Puzzle },
  { label: "Leads",           href: "/leads",             icon: Users },
  { label: "Share",           href: "/share",             icon: Share2 },
  { label: "Analytics",       href: "/analytics",         icon: BarChart3 },
  { label: "Conversations",   href: "/conversations",     icon: MessageSquare },
  { label: "Settings",        href: "/settings",          icon: Settings },
];

const comingSoonItems = [
  { label: "Organizations",   icon: "🏢" },
  { label: "Billing",         icon: "💳" },
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
      <aside className="w-64 border-r bg-background flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">MentorAize</h1>
          <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
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
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {/* Coming Soon items */}
          <div className="pt-3 pb-1">
            <p className="px-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-2">
              Coming Soon
            </p>
            {comingSoonItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base opacity-40">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">
                  Soon
                </span>
              </div>
            ))}
          </div>
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

      <main className="flex-1 bg-muted/30 overflow-auto">
        {children}
      </main>
    </div>
  );
}
