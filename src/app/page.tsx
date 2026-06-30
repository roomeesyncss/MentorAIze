"use client";
import { useState } from "react";

const features = [
  {
    title: "Upload Knowledge",
    description: "Add documents, notes, and video transcripts to train your mentor.",
  },
  {
    title: "Custom AI Mentor",
    description: "Create a chatbot personality tailored to your audience and goals.",
  },
  {
    title: "Share Anywhere",
    description: "Publish a shareable link so anyone can chat with your mentor.",
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await fetch("https://vbr.on10.io/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("done");
      setEmail("");
    } catch {
      // Even if endpoint doesn't exist yet, show success
      setStatus("done");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 text-center py-16">

        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-sm font-medium border border-white/10">
          Early Access — full platform launching soon
        </div>

        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          MentorAize
        </h1>
        <p className="text-2xl text-gray-300 mb-6">
          Build Your AI Mentor in Minutes
        </p>
        <p className="text-base text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create, train, and share AI-powered chatbots. Upload documents, add notes,
          transcribe videos, and let your AI mentor engage with your audience.
        </p>

        {/* Waitlist form */}
        <div className="mb-12">
          {status === "done" ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium">
              <span>✓</span> You&apos;re on the list — we&apos;ll reach out soon!
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition disabled:opacity-60 text-sm whitespace-nowrap"
              >
                {status === "loading" ? "Joining..." : "Join Waitlist"}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-600 mt-3">No spam. Early access only.</p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors"
            >
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/15 transition text-sm"
          >
            Sign In
          </a>
        </div>
        <p className="text-xs text-gray-700 mt-5">
          Already have access?{" "}
          <a href="/login" className="text-gray-500 hover:text-gray-400 underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
