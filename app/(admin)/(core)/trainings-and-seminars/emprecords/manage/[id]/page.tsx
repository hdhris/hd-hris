import ManageRecord from "@/components/admin/trainings-and-seminars/emprecords/ManageRecord";


export default function Page({ params }: { params: { id: string } }) {
    return <ManageRecord record_id={params.id} />;
}