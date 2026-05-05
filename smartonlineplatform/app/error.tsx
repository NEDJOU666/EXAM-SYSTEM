"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl font-bold text-gray-200">Oops!</p>
      <h1 className="text-xl font-bold text-gray-800 mt-4">Something went wrong</h1>
      <p className="text-gray-500 mt-2 text-sm">An unexpected error occurred.</p>
      <Button className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
