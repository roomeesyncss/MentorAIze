"use client";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Bot, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats-overview"],
    queryFn: () => adminApi.getStatsOverview(),
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: () => adminApi.getRecentActivity(undefined, 10),
  });

  const stats = statsData?.data;
  const activity: any[] = activityData?.data || [];

  const statCards = [
    { title: "Total Users", value: stats?.total_users ?? "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Chatbots", value: stats?.total_chatbots ?? "—", icon: Bot, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Total Conversations", value: stats?.total_conversations ?? "—", icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
    { title: "Total Messages", value: stats?.total_messages ?? "—", icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide statistics and activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  {statsLoading ? (
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {activity.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {(item.user_email || item.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.user_email || item.email || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{item.action || item.details || "Activity"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.role && <Badge variant="outline" className="text-xs mb-1">{item.role}</Badge>}
                    <p className="text-xs text-muted-foreground">{item.created_at ? formatDateTime(item.created_at) : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
