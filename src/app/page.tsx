import Link from "next/link";

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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 text-center py-16">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          Early Access — full platform launching soon
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          MentorAIze
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Build Your AI Mentor in Minutes
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Create, train, and share AI-powered chatbots. Upload documents, add notes, transcribe videos, and let your AI mentor engage with your audience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Account access opens soon — stay tuned.
        </p>
      </div>
    </div>
  );
}
