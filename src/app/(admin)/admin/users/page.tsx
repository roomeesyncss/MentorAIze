"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2, Trash2, LogIn, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [search, setSearch] = useState("");
  const [loginAsLoading, setLoginAsLoading] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(0, 100),
  });

  const users: any[] = data?.data || [];

  const filtered = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId: number, email: string) => {
    try {
      await adminApi.deleteUser(userId);
      toast.success(`User ${email} deleted`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleLoginAs = async (userId: number, email: string) => {
    setLoginAsLoading(userId);
    try {
      const response = await adminApi.loginAsUser(userId);
      const { access_token, user } = response.data;
      setAuth(user, access_token);
      toast.success(`Now logged in as ${email}`);
      router.push("/dashboard");
    } catch {
      toast.error("Failed to login as user");
    } finally {
      setLoginAsLoading(null);
    }
  };

  const roleVariant = (role: string): "default" | "secondary" | "destructive" => {
    if (role === "super_admin") return "destructive";
    if (role === "end_user") return "secondary";
    return "default";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-2 w-64">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={roleVariant(user.role)} className="text-xs">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {user.created_at ? formatDate(user.created_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {user.role !== "super_admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLoginAs(user.id, user.email)}
                          disabled={loginAsLoading === user.id}
                          title="Login as this user"
                        >
                          {loginAsLoading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogIn className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                      )}
                      {user.role !== "super_admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{user.email}</strong> and all their data. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id, user.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-t">
            {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
