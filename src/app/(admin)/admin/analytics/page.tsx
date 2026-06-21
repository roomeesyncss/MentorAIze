"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, MessageSquare, Users, Bot } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const { data: usersListData } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => adminApi.getUsersList(),
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-analytics", selectedUserId],
    queryFn: () =>
      adminApi.getPlatformAnalytics(selectedUserId === "all" ? undefined : Number(selectedUserId)),
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["admin-dashboard", selectedUserId],
    queryFn: () =>
      adminApi.getDashboardStats(selectedUserId === "all" ? undefined : Number(selectedUserId)),
  });

  const usersList: any[] = usersListData?.data || [];
  const analytics = analyticsData?.data;
  const dashboard = dashboardData?.data;

  const statCards = [
    { title: "Total Users", value: dashboard?.total_users ?? analytics?.total_users ?? "—", icon: Users },
    { title: "Total Chatbots", value: dashboard?.total_chatbots ?? analytics?.total_chatbots ?? "—", icon: Bot },
    { title: "Total Conversations", value: dashboard?.total_conversations ?? analytics?.total_conversations ?? "—", icon: MessageSquare },
    { title: "Total Messages", value: dashboard?.total_messages ?? analytics?.total_messages ?? "—", icon: BarChart2 },
  ];

  const loading = isLoading || dashboardLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide insights and user analytics</p>
        </div>

        {/* User filter */}
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {usersList.map((u: any) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.full_name || u.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  )}
                </div>
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Raw analytics data */}
      {analytics && Object.keys(analytics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Detailed Analytics
              {selectedUserId !== "all" && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  — {usersList.find((u: any) => String(u.id) === selectedUserId)?.email || `User #${selectedUserId}`}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(analytics)
                  .filter(([, v]) => typeof v === "number" || typeof v === "string")
                  .map(([key, value]) => (
                    <div key={key} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-semibold mt-1">{String(value)}</p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
