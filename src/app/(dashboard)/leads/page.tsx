"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/leads";
import { toast } from "sonner";
import { Loader2, Download, Users, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

function safeArray(raw: any, ...keys: string[]): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  for (const k of keys) {
    if (Array.isArray(raw[k])) return raw[k];
  }
  return [];
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ["leads-config"],
    queryFn: () => leadsApi.getConfig(),
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsApi.getLeads(),
  });

  const rawConfig = configData?.data;
  const [formState, setFormState] = useState<any>(null);

  const config = formState ?? rawConfig ?? {
    enabled: false,
    ask_after_messages: 3,
    collect_name: true,
    collect_email: true,
    collect_phone: false,
    form_title: "Before we continue...",
    form_description: "Please share your details so we can follow up.",
  };

  const leads = safeArray(leadsData?.data, "leads", "data", "items", "results");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await leadsApi.updateConfig(config);
      toast.success("Lead capture settings saved!");
      queryClient.invalidateQueries({ queryKey: ["leads-config"] });
      setFormState(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await leadsApi.exportLeads();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "leads.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Leads exported!");
    } catch {
      toast.error("Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setFormState((prev: any) => ({
      ...(prev ?? rawConfig ?? {}),
      [key]: value,
    }));
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lead Capture</h1>
        <p className="text-muted-foreground mt-1">Collect visitor information during chat sessions</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="leads">Captured Leads ({leads.length})</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Capture Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {configLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Lead Capture</p>
                      <p className="text-sm text-muted-foreground">Show a form to collect visitor info</p>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(v) => updateConfig("enabled", v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ask_after">Show form after (messages)</Label>
                    <Input
                      id="ask_after"
                      type="number"
                      min={1}
                      max={20}
                      value={config.ask_after_messages}
                      onChange={(e) => updateConfig("ask_after_messages", parseInt(e.target.value) || 3)}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">How many messages before showing the lead form</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_title">Form Title</Label>
                    <Input
                      id="form_title"
                      value={config.form_title || ""}
                      onChange={(e) => updateConfig("form_title", e.target.value)}
                      placeholder="Before we continue..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form_description">Form Description</Label>
                    <Input
                      id="form_description"
                      value={config.form_description || ""}
                      onChange={(e) => updateConfig("form_description", e.target.value)}
                      placeholder="Please share your details..."
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium text-sm">Fields to collect</p>
                    {[
                      { key: "collect_name", label: "Name", icon: User },
                      { key: "collect_email", label: "Email", icon: Mail },
                      { key: "collect_phone", label: "Phone", icon: Phone },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </div>
                        <Switch
                          checked={config[key]}
                          onCheckedChange={(v) => updateConfig(key, v)}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{leads.length} lead(s) captured</p>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting || leads.length === 0}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>

          {leadsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No leads yet</p>
                <p className="text-sm text-muted-foreground">Enable lead capture and start conversations to collect leads</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Phone</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead: any, i: number) => (
                      <tr key={lead.id ?? lead.lead_id ?? i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">{lead.name || "—"}</td>
                        <td className="px-4 py-3">{lead.email || "—"}</td>
                        <td className="px-4 py-3">{lead.phone || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
