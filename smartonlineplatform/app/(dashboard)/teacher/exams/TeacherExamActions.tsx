"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateExamStatusAction, deleteExamAction } from "@/lib/actions/exam.actions";
import type { ExamStatus } from "@prisma/client";

interface Props {
  examId: string;
  status: ExamStatus;
}

export default function TeacherExamActions({ examId, status }: Props) {
  const router = useRouter();

  async function handlePublish() {
    const result = await updateExamStatusAction(examId, "PUBLISHED");
    if (result?.error) toast.error(result.error);
    else { toast.success("Exam published!"); router.refresh(); }
  }

  async function handleArchive() {
    const result = await updateExamStatusAction(examId, "ARCHIVED");
    if (result?.error) toast.error(result.error);
    else { toast.success("Exam archived."); router.refresh(); }
  }

  async function handleDelete() {
    if (!confirm("Archive this exam? Students won't be able to take it.")) return;
    const result = await deleteExamAction(examId);
    if (result?.error) toast.error(result.error);
    else { toast.success("Exam archived."); router.refresh(); }
  }

  return (
    <div className="flex gap-2 text-sm">
      {status === "DRAFT" && (
        <button onClick={handlePublish} className="text-green-600 hover:underline">
          Publish
        </button>
      )}
      {status === "PUBLISHED" && (
        <button onClick={handleArchive} className="text-orange-500 hover:underline">
          Archive
        </button>
      )}
      {status !== "ARCHIVED" && (
        <button onClick={handleDelete} className="text-red-400 hover:underline">
          Delete
        </button>
      )}
    </div>
  );
}
