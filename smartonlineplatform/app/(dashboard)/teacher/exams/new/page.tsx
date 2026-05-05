"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionEditor, { type QuestionDraft } from "@/components/exam/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createExamAction } from "@/lib/actions/exam.actions";
import { toast } from "sonner";

export default function NewExamPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 60,
    rules: "",
    scheduledAt: "",
  });
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error("Add at least one question.");
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error("All questions must have text.");
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        toast.error("All options must have text.");
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        toast.error("Each question must have a correct answer.");
        return;
      }
    }

    setLoading(true);
    const result = await createExamAction({
      ...form,
      duration: Number(form.duration),
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      questions,
    });
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Exam created!");
    router.push("/teacher/exams");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Create New Exam</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                placeholder="e.g. Java Programming Final"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="Brief description of the exam…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => set("duration", Number(e.target.value))}
                  min={1}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled At *
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => set("scheduledAt", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rules</label>
              <textarea
                value={form.rules}
                onChange={(e) => set("rules", e.target.value)}
                rows={2}
                placeholder="Any special rules or instructions…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionEditor questions={questions} onChange={setQuestions} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/teacher/exams")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Exam"}
          </Button>
        </div>
      </form>
    </div>
  );
}
