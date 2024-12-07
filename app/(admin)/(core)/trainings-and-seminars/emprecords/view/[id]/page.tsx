import ViewRecord from "@/components/admin/trainings-and-seminars/emprecords/ViewRecord";


export default function Page({ params }: { params: { id: string } }) {
    return <ViewRecord record_id={params.id} />;
}
