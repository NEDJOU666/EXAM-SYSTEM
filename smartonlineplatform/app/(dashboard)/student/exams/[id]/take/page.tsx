"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ExamTimer from "@/components/exam/ExamTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Option = { id: string; text: string };
type Question = { id: string; text: string; points: number; options: Option[] };
type Exam = { id: string; title: string; duration: number; questions: Question[] };

export default function TakeExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; percentage: number } | null>(null);

  useEffect(() => {
    fetch(`/api/exams/${id}`)
      .then((r) => r.json())
      .then((data: Exam) => {
        setExam(data);
        const init: Record<string, string | null> = {};
        data.questions.forEach((q) => (init[q.id] = null));
        setAnswers(init);
      });
  }, [id]);

  const submit = useCallback(async () => {
    if (!exam || submitting || submitted) return;
    setSubmitting(true);

    const payload = {
      answers: exam.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] ?? null,
      })),
    };

    try {
      const res = await fetch(`/api/exams/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Submission failed.");
        setSubmitting(false);
        return;
      }

      setResult(data);
      setSubmitted(true);
    } catch {
      toast.error("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [exam, submitting, submitted, answers, id]);

  if (!exam) {
    return <div className="text-center text-gray-400 mt-20">Loading exam…</div>;
  }

  if (submitted && result) {
    const pass = result.percentage >= 50;
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className={`text-6xl font-bold ${pass ? "text-green-500" : "text-red-500"}`}>
          {result.percentage}%
        </div>
        <p className="text-gray-600">
          {result.score} / {result.maxScore} points
        </p>
        <p className={`font-semibold text-lg ${pass ? "text-green-600" : "text-red-500"}`}>
          {pass ? "Passed!" : "Not passed"}
        </p>
        <Button onClick={() => router.push("/student/results")}>
          View All Results
        </Button>
      </div>
    );
  }

  const q = exam.questions[current];
  const total = exam.questions.length;
  const answered = Object.values(answers).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-gray-800 text-lg">{exam.title}</h1>
        <ExamTimer durationMinutes={exam.duration} onExpire={submit} />
      </div>

      <div className="text-sm text-gray-500">
        Question {current + 1} of {total} · {answered} answered
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-sky-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium leading-relaxed">
            {q.text}
          </CardTitle>
          <span className="text-xs text-gray-400">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
        </CardHeader>
        <CardContent className="space-y-2">
          {q.options.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                answers[q.id] === opt.id
                  ? "border-sky-400 bg-sky-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={opt.id}
                checked={answers[q.id] === opt.id}
                onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                className="accent-sky-500"
              />
              <span className="text-sm text-gray-700">{opt.text}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </Button>

        {current < total - 1 ? (
          <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
        ) : (
          <Button
            variant="success"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Exam"}
          </Button>
        )}
      </div>
    </div>
  );
}
