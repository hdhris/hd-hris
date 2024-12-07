"use client";
import { useQuery } from "@/services/queries";
import { Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";
import { TrainingRecord } from "../types";
import dayjs from "dayjs";

export default function ViewRecord({ record_id }: { record_id: string }) {
    const { data: record, isLoading } = useQuery<TrainingRecord | null>(
        `/api/admin/trainings-and-seminars/emprecords/read?id=${record_id}`
    );

    if (isLoading || !record) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold">{record.ref_training_programs?.name || 'Unnamed Program'}</h2>
                    <Chip 
                        color={record.ref_training_programs?.type === 'training' ? 'primary' : 'secondary'}
                        variant="flat"
                        className="mt-2"
                    >
                        {record.ref_training_programs?.type || 'Not Specified'}
                    </Chip>
                </div>
                <Chip 
                    color={record.ref_training_programs?.is_active ? 'success' : 'danger'}
                    variant="flat"
                >
                    {record.ref_training_programs?.is_active ? 'Active' : 'Inactive'}
                </Chip>
            </CardHeader>
            <Divider/>
            <CardBody>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Participant</h3>
                        <p>{`${record.trans_employees?.first_name || 'Unknown'} ${record.trans_employees?.last_name || ''}`}</p>
                        <p className="text-sm text-gray-500">{record.trans_employees?.ref_departments?.name || 'No Department'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Instructor</h3>
                        <p>{`${record.ref_training_programs?.instructor_name || "N/A"}`}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Schedule</h3>
                        <p>Start: {record.ref_training_programs?.start_date ? dayjs(record.ref_training_programs.start_date).format('MMM DD, YYYY') : 'Not Scheduled'}</p>
                        <p>End: {record.ref_training_programs?.end_date ? dayjs(record.ref_training_programs.end_date).format('MMM DD, YYYY') : 'Not Scheduled'}</p>
                        <p className="mt-1">Duration: {record.ref_training_programs?.hour_duration || 0} hours</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Status</h3>
                        <Chip
                            color={getStatusColor(record.status || 'unknown')}
                            variant="dot"
                        >
                            {record.status || 'Unknown'}
                        </Chip>
                        <p className="mt-2 text-sm text-gray-500">
                            Location: {record.ref_training_programs?.location || 'Not Specified'}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <h3 className="font-semibold">Description</h3>
                        <p>{record.ref_training_programs?.description || 'No description available'}</p>
                    </div>
                    {record.feedback && (
                        <div className="col-span-2">
                            <h3 className="font-semibold">Feedback</h3>
                            <p>{record.feedback}</p>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'success';
        case 'ongoing':
            return 'primary';
        case 'enrolled':
            return 'warning';
        default:
            return 'default';
    }
};