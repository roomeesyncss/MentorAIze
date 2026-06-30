"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgApi } from "@/lib/organizations";
import { toast } from "sonner";
import { Loader2, Plus, Users, Mail, Trash2, Building2, Crown, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="h-3 w-3 text-yellow-500" />,
  admin: <Shield className="h-3 w-3 text-blue-500" />,
  member: <Users className="h-3 w-3 text-gray-400" />,
};

export default function OrganizationsPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", slug: "" });
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { data: orgsData, isLoading } = useQuery({
    queryKey: ["my-orgs"],
    queryFn: () => orgApi.getMyOrgs(),
  });

  const { data: orgDetail } = useQuery({
    queryKey: ["org-detail", selectedOrg],
    queryFn: () => orgApi.getOrg(selectedOrg!),
    enabled: !!selectedOrg,
  });

  const createMutation = useMutation({
    mutationFn: orgApi.create,
    onSuccess: () => {
      toast.success("Organization created!");
      setShowCreate(false);
      setCreateForm({ name: "", slug: "" });
      qc.invalidateQueries({ queryKey: ["my-orgs"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to create"),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ orgId, email, role }: { orgId: number; email: string; role: string }) =>
      orgApi.inviteMember(orgId, { email, role }),
    onSuccess: () => {
      toast.success("Invite sent!");
      setInviteEmail("");
      qc.invalidateQueries({ queryKey: ["org-detail", selectedOrg] });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to invite"),
  });

  const removeMutation = useMutation({
    mutationFn: ({ orgId, userId }: { orgId: number; userId: number }) =>
      orgApi.removeMember(orgId, userId),
    onSuccess: () => {
      toast.success("Member removed");
      qc.invalidateQueries({ queryKey: ["org-detail", selectedOrg] });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to remove"),
  });

  const orgs = orgsData?.data?.organizations || [];
  const detail = orgDetail?.data;

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-muted-foreground mt-1">Manage your teams and internal access</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Organization</CardTitle>
            <CardDescription>Set up a team workspace with shared chatbot access</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(createForm);
              }}
              className="space-y-4 max-w-md"
            >
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={createForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCreateForm({ name, slug: autoSlug(name) });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  placeholder="acme-corp"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, hyphens</p>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : orgs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium">No organizations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create one to give your team shared access to your chatbot
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgs.map((org: any) => (
            <Card
              key={org.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedOrg === org.id ? "border-indigo-400 ring-1 ring-indigo-400" : ""}`}
              onClick={() => setSelectedOrg(org.id === selectedOrg ? null : org.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{org.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{org.my_role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">/{org.slug}</p>
              </CardHeader>
              <CardContent className="text-sm flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {org.member_count} / {org.max_members} members
                </span>
                <span className="capitalize text-xs">{org.plan_slug} plan</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Org detail panel */}
      {selectedOrg && detail && (
        <Card>
          <CardHeader>
            <CardTitle>{detail.name} — Members</CardTitle>
            <CardDescription>
              {detail.member_count || detail.members?.length} / {detail.max_members} members used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Members list */}
            <div className="space-y-2">
              {(detail.members || []).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                      {m.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {ROLE_ICONS[m.role]}
                      {m.role}
                    </span>
                    {m.id !== user?.id && detail.owner_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeMutation.mutate({ orgId: selectedOrg, userId: m.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pending invites */}
            {detail.pending_invites?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Pending Invites</p>
                <div className="space-y-1">
                  {detail.pending_invites.map((inv: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {inv.invited_email}
                      <Badge variant="secondary" className="text-xs">{inv.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite form - only for owner/admin */}
            {(detail.my_role === "owner" || detail.my_role === "admin") && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Invite Member</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    inviteMutation.mutate({ orgId: selectedOrg, email: inviteEmail, role: inviteRole });
                  }}
                  className="flex gap-2"
                >
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="border rounded-md px-3 text-sm bg-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit" disabled={inviteMutation.isPending} className="gap-2">
                    {inviteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Mail className="h-4 w-4" /> Invite</>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
