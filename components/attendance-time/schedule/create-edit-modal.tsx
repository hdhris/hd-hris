import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Switch,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TimeInput,
} from "@nextui-org/react";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { Time } from "@internationalized/date";
import { dateToTime } from "@/lib/utils/dateToTime";

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (schedule: BatchSchedule) => void;
  onDelete: (id: Number | undefined) => void;
  selectedSchedule?: BatchSchedule | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  selectedSchedule,
}) => {
  const [name, setName] = useState("");
  const [clockIn, setClockIn] = useState(new Time(8));
  const [clockOut, setClockOut] = useState(new Time(17));
  const [breakMin, setBreakMin] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Effect to populate modal fields if editing
  useEffect(() => {
    if (selectedSchedule) {
      setName(selectedSchedule.name);
      console.log(selectedSchedule);
      setClockIn(dateToTime(new Date(selectedSchedule.clock_in)));
      setClockOut(dateToTime(new Date(selectedSchedule.clock_out)));
      setBreakMin(selectedSchedule.break_min);
      setIsActive(selectedSchedule.is_active);
    } else {
      // Reset form if adding a new schedule
      setName("");
      setClockIn(new Time(8));
      setClockOut(new Time(17));
      setBreakMin(0);
      setIsActive(true);
    }
  }, [selectedSchedule]);

  const handleSave = () => {
    const newSchedule: BatchSchedule = {
      id: selectedSchedule ? selectedSchedule.id : -1,
      name: name,
      clock_in: clockIn.toString(),
      clock_out: clockOut.toString(),
      break_min: breakMin,
      is_active: isActive,
      created_at: selectedSchedule
        ? selectedSchedule.created_at
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    onSave(newSchedule);
    onClose();
  };

  return (
    <Modal isOpen={visible} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          {selectedSchedule ? "Edit Schedule" : "Add Schedule"}
        </ModalHeader>
        <ModalBody>
          <Input
            isClearable={true}
            label="Schedule Name"
            placeholder="Enter schedule name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TimeInput
            label="Clock In Time"
            fullWidth
            value={clockIn}
            onChange={setClockIn}
          />
          <TimeInput
            label="Clock Out Time"
            fullWidth
            value={clockOut}
            onChange={setClockOut}
          />
          <Input
            isClearable={true}
            label="Break Minutes"
            placeholder="Enter break time in minutes"
            fullWidth
            type="number"
            value={breakMin.toString()}
            onChange={(e) => setBreakMin(parseInt(e.target.value))}
          />
          <Switch
            isSelected={isActive}
            onValueChange={setIsActive}
            color="success"
          >
            {isActive ? "Active" : "Inactive"}
          </Switch>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" className="me-auto" onClick={()=>{onDelete(selectedSchedule?.id)}}>
            Delete
          </Button>
          <Button color="danger" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave}>
            {selectedSchedule ? "Update" : "Add"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleModal;
