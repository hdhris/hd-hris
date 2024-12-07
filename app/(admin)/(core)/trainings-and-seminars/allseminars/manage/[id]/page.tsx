// app/trainings-and-seminars/empprograms/manage/[id]/page.tsx
"use client";
import ManageSeminars from "@/components/admin/trainings-and-seminars/allseminars/ManageSeminars";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditSeminarPage({ params }: PageProps) {
  return <ManageSeminars seminar_id={params.id} />;
}