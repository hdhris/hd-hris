"use client";
import { useParams } from 'next/navigation';
import { Card, CardBody } from '@nextui-org/react'; // Assuming you're using NextUI

const EditEarningsPage = () => {
  const { id } = useParams(); // This will capture the dynamic 'id' from the URL

  return (
    <Card>
      <CardBody>
        <h3>Edit Earnings for ID: {id}</h3>
        {/* Add your form or edit logic here */}
      </CardBody>
    </Card>
  );
};

export default EditEarningsPage;
