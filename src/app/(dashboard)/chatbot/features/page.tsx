"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { widgetApi } from "@/lib/widget";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Clock, Bell, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function FeaturesPage() {
  const qc = useQueryClient();

  // Quick replies
  const { data: qrData } = useQuery({ queryKey: ["quick-replies"], queryFn: widgetApi.getQuickReplies });
  const [newReply, setNewReply] = useState("");

  const addQR = useMutation({
    mutationFn: (text: string) => widgetApi.addQuickReply({ text }),
    onSuccess: () => { toast.success("Added!"); setNewReply(""); qc.invalidateQueries({ queryKey: ["quick-replies"] }); },
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const deleteQR = useMutation({
    mutationFn: widgetApi.deleteQuickReply,
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["quick-replies"] }); },
  });

  // Business hours
  const { data: bhData } = useQuery({ queryKey: ["business-hours"], queryFn: widgetApi.getBusinessHours });
  const [bh, setBh] = useState<any>({});
  const [bhEnabled, setBhEnabled] = useState(false);
  const [offlineMsg, setOfflineMsg] = useState("");
  const [timezone, setTimezone] = useState("Asia/Karachi");

  useEffect(() => {
    if (bhData?.data) {
      const d = bhData.data;
      setBhEnabled(d.is_enabled ?? false);
      setOfflineMsg(d.offline_message ?? "We're currently offline. Leave a message!");
      setTimezone(d.timezone ?? "Asia/Karachi");
      const hours: any = {};
      DAYS.forEach((day) => { hours[day] = d[day] ?? "09:00-17:00"; });
      setBh(hours);
    }
  }, [bhData]);

  const saveBH = useMutation({
    mutationFn: () => widgetApi.updateBusinessHours({ is_enabled: bhEnabled, offline_message: offlineMsg, timezone, ...bh }),
    onSuccess: () => { toast.success("Business hours saved!"); qc.invalidateQueries({ queryKey: ["business-hours"] }); },
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed"),
  });

  // Notifications
  const { data: notifData } = useQuery({ queryKey: ["notifications"], queryFn: widgetApi.getNotifications });
  const [notif, setNotif] = useState({ notify_on_new_lead: false, notify_on_missed_question: false, notification_email: "" });

  useEffect(() => {
    if (notifData?.data) {
      setNotif({
        notify_on_new_lead: notifData.data.notify_on_new_lead ?? false,
        notify_on_missed_question: notifData.data.notify_on_missed_question ?? false,
        notification_email: notifData.data.notification_email ?? "",
      });
    }
  }, [notifData]);

  const saveNotif = useMutation({
    mutationFn: () => widgetApi.updateNotifications(notif),
    onSuccess: () => toast.success("Notifications saved!"),
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const quickReplies = qrData?.data?.quick_replies || [];

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Widget & Features</h1>
        <p className="text-muted-foreground mt-1">Configure your chatbot's advanced features</p>
      </div>

      <Tabs defaultValue="quickreplies">
        <TabsList>
          <TabsTrigger value="quickreplies" className="gap-2"><Zap className="h-3 w-3" />Quick Replies</TabsTrigger>
          <TabsTrigger value="hours" className="gap-2"><Clock className="h-3 w-3" />Business Hours</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-3 w-3" />Notifications</TabsTrigger>
        </TabsList>

        {/* Quick Replies */}
        <TabsContent value="quickreplies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Reply Buttons</CardTitle>
              <CardDescription>Show suggestion buttons below the chatbot (max 6)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {quickReplies.map((qr: any) => (
                  <div key={qr.id} className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm border">{qr.text}</div>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteQR.mutate(qr.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {quickReplies.length < 6 && (
                <form onSubmit={(e) => { e.preventDefault(); if (newReply.trim()) addQR.mutate(newReply.trim()); }} className="flex gap-2">
                  <Input
                    placeholder="e.g. What are your prices?"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={addQR.isPending} className="gap-2">
                    {addQR.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" />Add</>}
                  </Button>
                </form>
              )}
              {quickReplies.length >= 6 && (
                <p className="text-xs text-muted-foreground">Maximum 6 quick replies reached</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Show offline message when outside business hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={bhEnabled} onCheckedChange={setBhEnabled} />
                <Label>{bhEnabled ? "Business hours enabled" : "Always online"}</Label>
              </div>
              {bhEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Karachi" />
                  </div>
                  <div className="space-y-3">
                    <Label>Schedule</Label>
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm capitalize">{day}</span>
                        <Input
                          value={bh[day] || ""}
                          onChange={(e) => setBh({ ...bh, [day]: e.target.value })}
                          placeholder="09:00-17:00 or closed"
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Offline Message</Label>
                    <Input value={offlineMsg} onChange={(e) => setOfflineMsg(e.target.value)} placeholder="We're offline right now..." />
                  </div>
                </>
              )}
              <Button onClick={() => saveBH.mutate()} disabled={saveBH.isPending}>
                {saveBH.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Business Hours"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Get notified when important events happen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={notif.notification_email}
                  onChange={(e) => setNotif({ ...notif, notification_email: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={notif.notify_on_new_lead}
                    onCheckedChange={(v) => setNotif({ ...notif, notify_on_new_lead: v })}
                  />
                  <div>
                    <p className="text-sm font-medium">New lead captured</p>
                    <p className="text-xs text-muted-foreground">Email when someone submits their contact info</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={notif.notify_on_missed_question}
                    onCheckedChange={(v) => setNotif({ ...notif, notify_on_missed_question: v })}
                  />
                  <div>
                    <p className="text-sm font-medium">Missed question</p>
                    <p className="text-xs text-muted-foreground">Email when bot can't answer a question</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => saveNotif.mutate()} disabled={saveNotif.isPending}>
                {saveNotif.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Notifications"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
