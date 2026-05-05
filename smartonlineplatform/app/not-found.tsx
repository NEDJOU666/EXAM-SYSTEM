import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-gray-200">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h1>
      <p className="text-gray-500 mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 px-5 py-2.5 bg-sky-500 text-white rounded-lg font-medium text-sm hover:bg-sky-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
