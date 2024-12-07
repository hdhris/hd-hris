// app/trainings-and-seminars/empprograms/manage/[id]/page.tsx
"use client";
import ManagePrograms from "@/components/admin/trainings-and-seminars/empprograms/ManagePrograms";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditProgramPage({ params }: PageProps) {
  return <ManagePrograms program_id={params.id} />;
}