import api from "./api";

export const billingApi = {
  getPlans: () => api.get("/api/billing/plans"),
  getPaymentDetails: () => api.get("/api/billing/payment-details"),
  getMySubscription: () => api.get("/api/billing/my-subscription"),
  getMyPaymentRequests: () => api.get("/api/billing/payment-requests/my"),

  submitPaymentRequest: (data: {
    plan_slug: string;
    payment_method: string;
    transaction_id: string;
    screenshot?: File;
  }) => {
    const form = new FormData();
    form.append("plan_slug", data.plan_slug);
    form.append("payment_method", data.payment_method);
    form.append("transaction_id", data.transaction_id);
    if (data.screenshot) form.append("screenshot", data.screenshot);
    return api.post("/api/billing/payment-request", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
