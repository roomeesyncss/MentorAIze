"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { orgApi } from "@/lib/organizations";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function JoinInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [orgName, setOrgName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    if (!user) {
      sessionStorage.setItem("pending_invite", token);
      router.push(`/login?redirect=/join?token=${token}`);
      return;
    }
    setStatus("loading");
    orgApi.acceptInvite(token)
      .then((res) => {
        setOrgName(res.data.org_name);
        setStatus("success");
        toast.success(`Welcome to ${res.data.org_name}!`);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.detail || "Failed to join organization");
        setStatus("error");
      });
  }, [token, user, router]);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Invalid invite link</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
          <Building2 className="h-7 w-7 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold">Organization Invite</h1>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {(status === "idle" || status === "loading") && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-muted-foreground">Joining organization...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-medium text-lg">You've joined <strong>{orgName}</strong>!</p>
            <Link href="/organizations">
              <Button className="w-full">Go to Organizations</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-destructive font-medium">{errorMsg}</p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          </CardContent>
        </Card>
      }>
        <JoinInner />
      </Suspense>
    </div>
  );
}
