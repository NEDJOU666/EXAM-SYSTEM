"use client";

import { useEffect, useState } from "react";

interface ExamTimerProps {
  durationMinutes: number;
  onExpire: () => void;
}

export default function ExamTimer({ durationMinutes, onExpire }: ExamTimerProps) {
  const [seconds, setSeconds] = useState(durationMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds, onExpire]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isLow = seconds < 300; // last 5 minutes

  return (
    <div
      className={`font-mono text-lg font-bold px-4 py-1 rounded-lg ${
        isLow ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-700"
      }`}
    >
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
