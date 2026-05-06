import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "SmartExam — Online Exam Platform for Universities" };

export default async function LandingPage() {
  const session = await auth();
  if (session?.user.role === "SUPER_ADMIN") redirect("/superadmin/dashboard");
  if (session) redirect("/login");

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold text-sky-600">SmartExam</span>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors"
        >
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="inline-block text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full mb-6">
          Multi-university exam platform
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Run secure online exams<br />for your entire university
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
          SmartExam gives every university its own dedicated portal — with AI-powered proctoring,
          role-based access, and real-time results. Set up in minutes.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
          >
            Register your university
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Sign in to your portal
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: "🎓",
            title: "Per-university subdomains",
            desc: "Each university gets its own ict.smartexam.app portal with isolated data.",
          },
          {
            icon: "👁️",
            title: "AI-powered proctoring",
            desc: "Real-time face detection flags suspicious behaviour during exams.",
          },
          {
            icon: "📊",
            title: "Instant results",
            desc: "Auto-graded MCQ exams with detailed per-student analytics.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
            <p className="text-3xl mb-3">{f.icon}</p>
            <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-sky-50 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to bring your university on board?
        </h2>
        <Link
          href="/register"
          className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
        >
          Apply now — it&apos;s free
        </Link>
      </section>

      <footer className="text-center py-8 text-xs text-gray-400">
        © {new Date().getFullYear()} SmartExam. All rights reserved.
      </footer>
    </div>
  );
}
