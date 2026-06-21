"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Clock, BarChart2, ThumbsUp, ThumbsDown, HelpCircle, Star } from "lucide-react";

// Safely extract an array from any API response shape
function safeArray(raw: any, ...keys: string[]): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  for (const k of keys) {
    if (Array.isArray(raw[k])) return raw[k];
  }
  return [];
}

export default function AnalyticsPage() {
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ["creator-overview"],
    queryFn: () => analyticsApi.getCreatorOverview(),
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["usage-over-time"],
    queryFn: () => analyticsApi.getUsageOverTime(7),
  });

  const { data: topUsersData, isLoading: topUsersLoading } = useQuery({
    queryKey: ["top-users"],
    queryFn: () => analyticsApi.getTopUsers(10),
  });

  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: ["engagement-metrics"],
    queryFn: () => analyticsApi.getEngagementMetrics(),
  });

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["feedback-summary"],
    queryFn: () => analyticsApi.getFeedbackSummary(),
  });

  const { data: qualityData, isLoading: qualityLoading } = useQuery({
    queryKey: ["quality-metrics"],
    queryFn: () => analyticsApi.getQuality(),
  });

  const { data: missedData, isLoading: missedLoading } = useQuery({
    queryKey: ["missed-questions"],
    queryFn: () => analyticsApi.getMissedQuestions({ limit: 20 }),
  });

  // overview may be the object directly or nested under a key
  const rawOverview = overviewData?.data;
  const overview = Array.isArray(rawOverview) ? null : rawOverview;

  // usage can be array directly or nested under data/usage/items
  const usage = safeArray(usageData?.data, "data", "usage", "items", "results");

  // top_users can be array directly or nested
  const topUsers = safeArray(topUsersData?.data, "top_users", "users", "data", "items", "results");

  // engagement may be the object directly or nested
  const rawEngagement = engagementData?.data;
  const engagement = Array.isArray(rawEngagement) ? null : rawEngagement;

  const rawFeedback = feedbackData?.data;
  const feedback = Array.isArray(rawFeedback) ? null : rawFeedback;

  const rawQuality = qualityData?.data;
  const quality = Array.isArray(rawQuality) ? null : rawQuality;

  const missedQuestions = safeArray(missedData?.data, "questions", "missed_questions", "data", "items", "results");

  const maxConversations = usage.length > 0
    ? Math.max(...usage.map((d: any) => d.conversations || 0), 1)
    : 1;

  const statCards = [
    { title: "Total Conversations", value: overview?.total_conversations ?? 0, icon: MessageSquare },
    { title: "Total Messages", value: overview?.total_messages ?? 0, icon: MessageSquare },
    { title: "Unique Users", value: overview?.unique_users ?? 0, icon: Users },
    {
      title: "Avg Response Time",
      value: overview ? `${(overview.avg_response_time_ms / 1000).toFixed(1)}s` : "—",
      icon: Clock,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into your chatbot&apos;s performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  {overviewLoading ? (
                    <Skeleton className="h-9 w-16 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                  )}
                </div>
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Usage chart (last 7 days) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Chat Sessions (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="flex gap-2 items-end h-32">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="flex-1 h-full" />)}
                </div>
              ) : usage.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
              ) : (
                <div className="flex gap-2 items-end h-32">
                  {usage.map((day: any, i: number) => (
                    <div key={day.date ?? i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t-sm min-h-[4px] transition-all"
                        style={{ height: `${((day.conversations || 0) / maxConversations) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {day.date ? new Date(day.date).toLocaleDateString("en", { weekday: "short" }) : ""}
                      </span>
                      <span className="text-xs font-medium">{day.conversations ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topUsersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : topUsers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No users yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left pb-2">User</th>
                        <th className="text-right pb-2">Messages</th>
                        <th className="text-right pb-2">Conversations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsers.map((user: any, i: number) => (
                        <tr key={user.end_user_identifier ?? i} className="border-t">
                          <td className="py-2 truncate max-w-[150px]">{user.end_user_identifier ?? user.identifier ?? user.id ?? "—"}</td>
                          <td className="py-2 text-right">{user.message_count ?? 0}</td>
                          <td className="py-2 text-right">{user.conversation_count ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Engagement metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagementLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : engagement ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Returning User Rate</span>
                        <span className="font-medium">{((engagement.returning_user_rate || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(engagement.returning_user_rate || 0) * 100} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Messages / Session</span>
                        <span className="font-medium">{engagement.avg_messages_per_conversation?.toFixed(1) ?? "—"}</span>
                      </div>
                      <Progress value={Math.min(((engagement.avg_messages_per_conversation || 0) / 20) * 100, 100)} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Session Duration</span>
                        <span className="font-medium">{engagement.avg_session_duration_minutes?.toFixed(1) ?? "—"} min</span>
                      </div>
                      <Progress value={Math.min(((engagement.avg_session_duration_minutes || 0) / 30) * 100, 100)} />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No engagement data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Avg Response Time */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    {qualityLoading ? (
                      <Skeleton className="h-9 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold mt-1">
                        {quality?.avg_response_time_ms != null
                          ? `${(quality.avg_response_time_ms / 1000).toFixed(1)}s`
                          : "—"}
                      </p>
                    )}
                  </div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Feedback Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Positive Feedback</p>
                    {feedbackLoading ? (
                      <Skeleton className="h-9 w-20 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold mt-1">
                        {feedback?.positive_rate != null
                          ? `${(feedback.positive_rate * 100).toFixed(0)}%`
                          : quality?.feedback_score != null
                          ? `${(quality.feedback_score * 100).toFixed(0)}%`
                          : "—"}
                      </p>
                    )}
                  </div>
                  <Star className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Missed Questions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unanswered Questions</p>
                    {qualityLoading ? (
                      <Skeleton className="h-9 w-16 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold mt-1">
                        {quality?.missed_questions_count ?? missedQuestions.length}
                      </p>
                    )}
                  </div>
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbackLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : feedback ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="h-4 w-4" /> Thumbs Up
                      </span>
                      <span className="font-medium">{feedback.thumbs_up ?? 0}</span>
                    </div>
                    <Progress
                      value={feedback.total > 0 ? ((feedback.thumbs_up || 0) / feedback.total) * 100 : 0}
                      className="[&>div]:bg-green-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="h-4 w-4" /> Thumbs Down
                      </span>
                      <span className="font-medium">{feedback.thumbs_down ?? 0}</span>
                    </div>
                    <Progress
                      value={feedback.total > 0 ? ((feedback.thumbs_down || 0) / feedback.total) * 100 : 0}
                      className="[&>div]:bg-red-500"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Total: {feedback.total ?? 0} ratings</p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No feedback data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Missed questions list */}
          {missedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Recent Unanswered Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {missedLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {missedQuestions.slice(0, 10).map((q: any, i: number) => (
                      <li key={q.id ?? i} className="text-sm py-2 border-b last:border-0">
                        {q.question || q.content || q.text}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
