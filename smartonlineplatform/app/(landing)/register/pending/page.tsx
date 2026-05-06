import Link from "next/link";

export const metadata = { title: "Application Submitted — SmartExam" };

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Application Submitted!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your university registration request has been received.
          Our team will review it and send your admin credentials to the email you provided —
          usually within 24 hours.
        </p>
        <Link href="/" className="text-sm text-sky-600 hover:underline">
          ← Back to SmartExam
        </Link>
      </div>
    </div>
  );
}
