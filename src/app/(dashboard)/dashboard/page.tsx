"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/analytics";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Bot, Clock, ArrowRight, BarChart2, BookOpen, Zap, HelpCircle, GraduationCap } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["creator-overview"],
    queryFn: () => analyticsApi.getCreatorOverview(),
    retry: 1,
  });

  const { data: missedData } = useQuery({
    queryKey: ["missed-questions"],
    queryFn: () => analyticsApi.getMissedQuestions({ limit: 5 }),
    retry: false,
  });

  const overview = data?.data;
  const hasError = !!error;
  const rawMissed = missedData?.data;
  const missedCount = (() => {
    if (!rawMissed) return 0;
    const arr = Array.isArray(rawMissed) ? rawMissed :
      (rawMissed.questions || rawMissed.missed_questions || rawMissed.data || rawMissed.items || []);
    return Array.isArray(arr) ? arr.length : 0;
  })();

  const statCards = [
    {
      title: "Total Conversations",
      value: overview?.total_conversations ?? 0,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Messages",
      value: overview?.total_messages ?? 0,
      icon: MessageSquare,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Unique Users",
      value: overview?.unique_users ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Avg Response Time",
      value: overview ? `${(overview.avg_response_time_ms / 1000).toFixed(1)}s` : "—",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const quickActions = [
    { label: "Configure Chatbot", href: "/chatbot", icon: Bot },
    { label: "Manage Knowledge", href: "/knowledge", icon: BookOpen },
    { label: "View Analytics", href: "/analytics", icon: BarChart2 },
    { label: "Test Your Bot", href: "/chatbot/preview", icon: Zap },
    { label: "Training", href: "/training", icon: GraduationCap },
    { label: "Leads", href: "/leads", icon: Users },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || "there"}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your chatbot performance</p>
      </div>

      {hasError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Get started by creating your chatbot</h2>
            <p className="text-muted-foreground mb-4">Set up your AI chatbot to start collecting insights</p>
            <Link href="/chatbot">
              <Button>Create Your Chatbot</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Training Gaps banner */}
      {missedCount > 0 && (
        <Link href="/training">
          <Card className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">Training Gaps Detected</p>
                  <p className="text-sm text-orange-700">
                    Your bot couldn&apos;t answer {missedCount} question{missedCount !== 1 ? "s" : ""} — review and improve
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{missedCount}</Badge>
                <ArrowRight className="h-4 w-4 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-4 px-4">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
