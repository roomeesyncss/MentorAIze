"use client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <p className="text-muted-foreground mb-4">Password reset - coming soon</p>
      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
