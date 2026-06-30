"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { billingApi } from "@/lib/billing";
import { toast } from "sonner";
import { Loader2, Check, CreditCard, Smartphone, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const METHOD_ICONS: Record<string, React.ReactNode> = {
  jazzcash: <Smartphone className="h-4 w-4" />,
  easypaisa: <Smartphone className="h-4 w-4" />,
  bank: <Building className="h-4 w-4" />,
};

const METHOD_LABELS: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  bank: "Bank Transfer",
};

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("jazzcash");
  const [txnId, setTxnId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => billingApi.getMySubscription(),
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => billingApi.getPlans(),
  });

  const { data: methodsData } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => billingApi.getPaymentDetails(),
  });

  const { data: requestsData } = useQuery({
    queryKey: ["my-payment-requests"],
    queryFn: () => billingApi.getMyPaymentRequests(),
  });

  const submitMutation = useMutation({
    mutationFn: billingApi.submitPaymentRequest,
    onSuccess: () => {
      toast.success("Payment request submitted! We'll verify within 24 hours.");
      setShowForm(false);
      setTxnId("");
      setScreenshot(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Submission failed");
    },
  });

  const subscription = subData?.data;
  const currentPlan = subscription?.plan;
  const plans = plansData?.data?.plans || [];
  const methods = methodsData?.data?.payment_methods || {};
  const paymentRequests = requestsData?.data?.requests || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !txnId.trim()) {
      toast.error("Please select a plan and enter transaction ID");
      return;
    }
    submitMutation.mutate({
      plan_slug: selectedPlan,
      payment_method: selectedMethod,
      transaction_id: txnId,
      screenshot: screenshot || undefined,
    });
  };

  const activeMethod = methods[selectedMethod] || {};

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription</p>
      </div>

      {/* Current Plan */}
      {!subLoading && currentPlan && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Current Plan</p>
              <p className="text-xl font-bold text-indigo-900 capitalize">{currentPlan.name}</p>
              {subscription?.subscription?.expires_at && (
                <p className="text-xs text-indigo-600 mt-1">
                  Expires: {new Date(subscription.subscription.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <Badge className="bg-indigo-600">{currentPlan.slug === "free" ? "Active" : "Paid"}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Available Plans</h2>
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.filter((p: any) => p.slug !== "free").map((plan: any) => {
              const isCurrent = currentPlan?.slug === plan.slug;
              const isSelected = selectedPlan === plan.slug;
              return (
                <Card
                  key={plan.slug}
                  onClick={() => {
                    if (!isCurrent) {
                      setSelectedPlan(plan.slug);
                      setShowForm(true);
                    }
                  }}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "border-indigo-500 ring-2 ring-indigo-500" :
                    isCurrent ? "border-green-400 opacity-70 cursor-default" :
                    "hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">{plan.name}</CardTitle>
                      {isCurrent && <Badge variant="outline" className="text-green-600 border-green-400">Active</Badge>}
                      {isSelected && !isCurrent && <Check className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold">Rs {plan.price_pkr.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                      <span className="text-xs text-muted-foreground ml-2">(~${plan.price_usd})</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1 pt-0">
                    <p>✓ {plan.max_documents} Documents</p>
                    <p>✓ {plan.max_transcripts} Transcripts</p>
                    <p>✓ {plan.max_website_sources} Website sources</p>
                    {plan.allow_widget ? <p>✓ Widget embed</p> : null}
                    {plan.allow_email_notifications ? <p>✓ Email notifications</p> : null}
                    {plan.allow_remove_branding ? <p>✓ Remove branding</p> : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Form */}
      {showForm && selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Submit Payment
            </CardTitle>
            <CardDescription>
              Send payment via your preferred method, then submit the transaction ID below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Method selection */}
            <div className="flex gap-2 mb-6">
              {Object.keys(METHOD_LABELS).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedMethod === m
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {METHOD_ICONS[m]}
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>

            {/* Payment details to show */}
            {activeMethod && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm space-y-2">
                <p className="font-medium text-gray-700">Send payment to:</p>
                {selectedMethod === "bank" ? (
                  <>
                    <p><span className="text-muted-foreground">Bank:</span> <strong>{activeMethod.bank_name}</strong></p>
                    <p><span className="text-muted-foreground">Account:</span> <strong>{activeMethod.account_title}</strong></p>
                    <p><span className="text-muted-foreground">Number:</span> <strong>{activeMethod.account_number}</strong></p>
                    {activeMethod.iban && <p><span className="text-muted-foreground">IBAN:</span> <strong>{activeMethod.iban}</strong></p>}
                  </>
                ) : (
                  <>
                    <p><span className="text-muted-foreground">Number:</span> <strong>{activeMethod.number}</strong></p>
                    <p><span className="text-muted-foreground">Name:</span> <strong>{activeMethod.name}</strong></p>
                  </>
                )}
                <p className="text-indigo-600 font-medium mt-2">
                  Amount: Rs {plans.find((p: any) => p.slug === selectedPlan)?.price_pkr?.toLocaleString()}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Transaction ID / Reference Number</Label>
                <Input
                  placeholder="e.g. TXN123456789"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">You get this after sending payment</p>
              </div>

              <div className="space-y-2">
                <Label>Screenshot (optional but recommended)</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Payment Request"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      {paymentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium capitalize">{req.plan_slug} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {METHOD_LABELS[req.payment_method]} • {req.transaction_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    {req.admin_note && (
                      <p className="text-xs text-orange-600 mt-1">{req.admin_note}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      req.status === "approved" ? "default" :
                      req.status === "rejected" ? "destructive" : "secondary"
                    }
                    className={req.status === "approved" ? "bg-green-600" : ""}
                  >
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
