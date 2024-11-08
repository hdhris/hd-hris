import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import {
  AttendaceStatuses,
  AttendanceLog,
  InStatus,
  OutStatus,
} from "@/types/attendance-time/AttendanceTypes";
import { min } from "lodash";

export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    // const date = "2024-09-07";

    //////////////////////////////////
    // Prepare and get attendance logs
    const isoDateStart = toGMT8(`${date}T00:00:00.000Z`).toISOString();
    const isoDateEnd = toGMT8(`${date}T23:59:59.999Z`).toISOString();
    const attendanceLog = (await prisma.log_attendances.findMany({
      where: {
        timestamp: {
          gte: isoDateStart,
          lt: isoDateEnd, // Matches records within the day
        },
      },
      orderBy : {
        timestamp : "desc",
      }
    })) as unknown as AttendanceLog[];

    /////////////////////////////////////////////////////////////////////
    // Organize and sort all attendance logs into each of employee's logs
    const organizedLogs = attendanceLog.reduce((acc, log) => {
      const empId = log.employee_id;
      if (!acc[empId]) {
        acc[empId] = [];
      }
      acc[empId].push(log);
      acc[empId].sort((a, b) => toGMT8(a.timestamp).diff(toGMT8(b.timestamp)));
      return acc;
    }, {} as Record<number, AttendanceLog[]>);


    ///////////////////////////////////////////////////////////////
    // Prepare batch schedule and every individuals's schedule info
    const employeeSchedule = await prisma.dim_schedules.findMany({
      where: {
        trans_employees: {
          id: {
            in: attendanceLog.map((al) => al.employee_id),
          },
        },
      },
    });
    const batchSchedule = await prisma.ref_batch_schedules.findMany({
      where: {
        id : {
          in : employeeSchedule.map(es => es.batch_id!),
        }
      }
    });

    ///////////////////////////////////////////////////////////////////////////////////
    // Arrange and label the time log for each entry and return the overall information
    // STRUCTURE:
    // AttendaceStatuses = {
    //  employeeID:{
    //               amIn?: {id: number; time: string | null; status: InStatus;};
    //               amOut?: {id: number; time: string | null; status: OutStatus;};
    //               pmIn?: {id: number; time: string | null; status: InStatus;};
    //               pmOut?: {id: number; time: string | null; status: OutStatus;};
    //               shift?: number;
    //               overtime?: number;
    //             }
    // };
    let statuses: AttendaceStatuses = {};
    const offset = 8; // Temporary time offset
    const gracePeriod = 5; // 5 min grace period
    Object.entries(organizedLogs).forEach(([empId, logs]) => {
      const employeeId = Number(empId);
      // Fetch an individual employee's schedule info
      const daySchedule = employeeSchedule.find(
        (es) => es.employee_id === employeeId
      );
      const timeSchedule = batchSchedule.find(
        (bs) => bs.id === daySchedule?.batch_id
      );

      // Skip if the current individual has invalid schedule
      if (!daySchedule || !timeSchedule) return;
      const timeIn = toGMT8(timeSchedule?.clock_in!).subtract(offset, "hours");
      const timeOut = toGMT8(timeSchedule?.clock_out!).subtract(
        offset,
        "hours"
      );
      // Initialize a record for current individual incase if it is null
      if (!statuses[employeeId]) {
        statuses[employeeId] = {};
      }

      // For each entry log of the current individual
      logs.forEach((log) => {
        // Convert the timestamp of the log to dayjs(toGMT8)
        const timestamp = toGMT8(log.timestamp).subtract(offset, "hours");
        // For punched IN logs or Morning entry
        if (log.punch === 0) {
          // If time-in is 4hrs closer to clock-in schedule...
          // Consider it as an AM time in
          if (timestamp.hour() - timeIn.hour() < 4) {
            // Late if time-in is 5mins later than clock-in schedule...
            const stat: InStatus = timestamp.diff(timeIn, 'minute') > gracePeriod ? "late" : "ontime";
            statuses[employeeId].amIn = {
              id: log.id, // Record the log ID for later reference
              time: timestamp.format("HH:mm:ss"),
              status: stat, // Record the status label for later reference
            };
          // If time-in is 4hrs over the clock-in schedule...
          // Consider it as a PM time in 
          } else {
            // Initialize as no break if individual has not punched out at morning yet
            let stat: InStatus = "no break";
            // If individual has punched out at morning...
            if (statuses[employeeId].amOut)
              // Check if PM time-in has passed the break-mins schedule after AM time-out....
              stat =
                timestamp.diff(
                  toGMT8(statuses[employeeId].amOut.time!).subtract(
                    offset,
                    "h"
                  ),
                  "minutes"
                ) > timeSchedule.break_min!
                  ? "late"
                  : "ontime"; // Otherwise, its closer to break-mins duration schedule
            statuses[employeeId].pmIn = {
              id: log.id,
              time: timestamp.format("HH:mm:ss"),
              status: stat,
            };
          }


        // For punched OUT logs or Afternoon entry
        } else {
          // If time-out is 4hrs earlier than clock-out schedule...
          // Consider it as an AM time out
          if (timeOut.hour() - timestamp.hour() > 4) {
            // Initialize as lunch if individual has not punched in at afternoon yet
            let stat: OutStatus = "lunch";
            // Prepare to check if AM time-out is today and if PM time-in doesn't exist
            const today = toGMT8().subtract(offset,'h').startOf('day');
            const dateToCheck = timestamp.startOf('day');
            // If not today, its history
            if (!dateToCheck.isSame(today, 'day')){
              // if individual has not punched in at afternoon...
              // considered it as early out
              if(!statuses[employeeId].pmIn) stat = "early-out"
            }
            statuses[employeeId].amOut = {
              id: log.id,
              time: timestamp.format("HH:mm:ss"),
              status: stat,
            };
          // If time-out is 4hrs closer the clock-out schedule...
          // Consider it as a PM time out 
          } else {
            // Overtime if time-out is 5mins later than clock-out schedule
            // Temporary variable to match dates between clock-out and time-out date
            const temptimeOut = timeOut.year(timestamp.year()).month(timestamp.month()).date(timestamp.date());
            // if(log.id === 45) console.log(timestamp.toISOString(), temptimeOut.toISOString(), timestamp.diff(temptimeOut, "minute"));
            const stat: OutStatus =
              timestamp.diff(temptimeOut, "minute") > gracePeriod
                ? "overtime"
                : timestamp.diff(temptimeOut, "minute") < gracePeriod
                ? "early-out" // Early if time-out is 5mins earlier than clock-out schedule
                : "ontime"; // Otherwise, its closer to clock out schedule
            statuses[employeeId].pmOut = {
              id: log.id,
              time: timestamp.format("HH:mm:ss"),
              status: stat,
            };
          }
        }

        // If not punched IN at morning, mark as absent
        if (statuses[employeeId].amIn === null) {
          statuses[employeeId].amIn = {
            id: log.id,
            time: null,
            status: "absent",
          };
        }
        // If not punched OUT at morning...
        if (!statuses[employeeId].amOut) {
          // Mark absent if not also punched OUT at afternoon
          if (statuses[employeeId].pmOut === null) {
            statuses[employeeId].amOut = {
              id: log.id,
              time: null,
              status: "absent",
            };
          // Mark no break if individual has eventually punched OUT at afternoon
          } else {
            statuses[employeeId].amOut = {
              id: log.id,
              time: null,
              status: "no break",
            };
          }
        }
        // If not punched IN at afternoon...
        if (!statuses[employeeId].pmIn) {
          // Mark absent if not also punched IN at morning
          if (!statuses[employeeId].amIn) {
            statuses[employeeId].pmIn = {
              id: log.id,
              time: null,
              status: "absent",
            };
          // Mark no break if individual has actually punched IN at morning
          } else {
            statuses[employeeId].pmIn = {
              id: log.id,
              time: null,
              status: "no break",
            };
          }
        }
        // If not punched OUT at afternoon, mark as absent
        if (!statuses[employeeId].pmOut) {
          statuses[employeeId].pmOut = {
            id: log.id,
            time: null,
            status: "absent",
          };
        }
        // Get the minutes rendered from overall log entry
        // Ignore entry such as:
        // MORNING: punch OUT but no punch IN
        // AFTERNOON: punch OUT but no punch IN
        const shiftLength = ((): number => {
          // Initializing morning and afternoon duration
          let morning = 0;
          let afternoon = 0;
          // If time-in and time-out for morning is valid
          if (
            statuses[employeeId].amIn?.time &&
            statuses[employeeId].amOut.time
          ) {
            morning = toGMT8(statuses[employeeId].amOut.time)
              .subtract(offset, "h")
              .diff(
                toGMT8(statuses[employeeId].amIn.time).subtract(offset, "h"),
                "minute"
              );
          }
          // If time-in and time-out for afternoon is valid
          if (
            statuses[employeeId].pmIn?.time &&
            statuses[employeeId].pmOut.time
          ) {
            afternoon = toGMT8(statuses[employeeId].pmOut.time)
              .subtract(offset, "h")
              .diff(
                toGMT8(statuses[employeeId].pmIn.time).subtract(offset, "h"),
                "minute"
              );
          }

          // For special cases for individuals who took no breaks
          // such as when individual has punched IN at morning
          // and never punched OUT at morning & never punched IN at afternoon
          // and has punched OUT at afternoong
          //    amIN:  time-in
          //    amOUT: x
          //    pmIN:  x
          //    pmOUT: time-out
          // Consider as valid
          if (
            statuses[employeeId].amIn?.time &&
            !statuses[employeeId].amOut?.time &&
            !statuses[employeeId].pmIn?.time &&
            statuses[employeeId].pmOut?.time
          ) {
            afternoon = toGMT8(statuses[employeeId].pmOut.time)
              .subtract(offset, "h")
              .diff(
                toGMT8(statuses[employeeId].amIn.time).subtract(offset, "h"),
                "minute"
              );
          }
          // Return the combined shift length
          return morning + afternoon;
        })();

        // Get the actual shift length of an individual
        const factShiftLength =
          toGMT8(timeSchedule.clock_out!)
            .subtract(offset, "h")
            .diff(
              toGMT8(timeSchedule.clock_in!).subtract(offset, "h"),
              "minute"
            ) - timeSchedule.break_min!;

        // Rendered shift lenght must never exceed actaul shift length
        statuses[employeeId].shift = min([shiftLength, factShiftLength]);

        // Instead, record the overtime length for individual's log record
        statuses[employeeId].overtime =
          shiftLength > factShiftLength ? shiftLength - factShiftLength : 0;
        // Also record the undertime length for individual's log record
        statuses[employeeId].undertime =
          shiftLength < factShiftLength ? factShiftLength - shiftLength : 0;
      });
    });

    // Get list of employees for reference in the attendance log table
    const employees = await prisma.trans_employees.findMany({
      where: {
        id: {
          in: attendanceLog.map((al) => al.employee_id),
        },
      },
      ...emp_rev_include.employee_detail,
    });

    return NextResponse.json({attendanceLog, employees, statuses, batchSchedule, employeeSchedule});
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
