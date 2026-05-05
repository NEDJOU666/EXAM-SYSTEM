"use client";

import { Button } from "@/components/ui/button";

export type QuestionDraft = {
  id: string;
  text: string;
  points: number;
  order: number;
  options: { id: string; text: string; isCorrect: boolean }[];
};

interface QuestionEditorProps {
  questions: QuestionDraft[];
  onChange: (questions: QuestionDraft[]) => void;
}

function newQuestion(order: number): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    points: 1,
    order,
    options: [
      { id: crypto.randomUUID(), text: "", isCorrect: true },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ],
  };
}

export default function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function removeQuestion(id: string) {
    onChange(questions.filter((q) => q.id !== id));
  }

  function addQuestion() {
    onChange([...questions, newQuestion(questions.length)]);
  }

  function updateOption(
    qId: string,
    optId: string,
    patch: Partial<QuestionDraft["options"][0]>
  ) {
    onChange(
      questions.map((q) =>
        q.id !== qId
          ? q
          : { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)) }
      )
    );
  }

  function setCorrect(qId: string, optId: string) {
    onChange(
      questions.map((q) =>
        q.id !== qId
          ? q
          : {
              ...q,
              options: q.options.map((o) => ({ ...o, isCorrect: o.id === optId })),
            }
      )
    );
  }

  function addOption(qId: string) {
    onChange(
      questions.map((q) =>
        q.id !== qId
          ? q
          : {
              ...q,
              options: [...q.options, { id: crypto.randomUUID(), text: "", isCorrect: false }],
            }
      )
    );
  }

  function removeOption(qId: string, optId: string) {
    onChange(
      questions.map((q) =>
        q.id !== qId
          ? q
          : { ...q, options: q.options.filter((o) => o.id !== optId) }
      )
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={q.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold text-gray-400 mt-2">Q{idx + 1}</span>
            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              placeholder="Question text…"
              required
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                value={q.points}
                min={1}
                onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
                title="Points"
              />
              <span className="text-xs text-gray-400">pts</span>
              <button
                type="button"
                onClick={() => removeQuestion(q.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-2 pl-6">
            {q.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={opt.isCorrect}
                  onChange={() => setCorrect(q.id, opt.id)}
                  className="accent-sky-500"
                  title="Mark as correct"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(q.id, opt.id, { text: e.target.value })}
                  placeholder="Option text…"
                  required
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(q.id, opt.id)}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(q.id)}
              className="text-xs text-sky-600 hover:underline"
            >
              + Add option
            </button>
            <p className="text-xs text-gray-400">Select the radio button next to the correct answer.</p>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
        + Add Question
      </Button>
    </div>
  );
}
