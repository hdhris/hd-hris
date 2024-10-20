import { getSimilarityPercentage } from "@/lib/utils/similarityPercentage";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { TransHoliday } from "@/types/attendance-time/HolidayTypes";

export function findByDateAndName(
  data: any,
  selectedItem: any
): TransHoliday | null {
  if (selectedItem.id === null) return null;
  
  const useConsole = false;
  if (useConsole) console.log("FLAG", data, selectedItem.name);
  function findBestMatch(target: any, criteria: number) {
    let transHoliday: TransHoliday | null = null;
    let highestNamePercentage = 0;
    target.forEach((tg: any) => {
      const percentage = getSimilarityPercentage(tg.name, selectedItem.name);
      if (useConsole) console.log(tg.name, selectedItem.name, percentage);
      if (percentage > criteria && percentage > highestNamePercentage) {
        highestNamePercentage = percentage;
        transHoliday = tg;
      }
    });
    return transHoliday;
  }

  if (!data || !selectedItem) {
    console.log("Flag 0");
    return null;
  }
  if (useConsole) console.log("Flag 1");
  // First: Try to find by date (MM-DD format)
  const foundByDate = data.filter(
    (th: any) =>
      toGMT8(th.date).format("MM-DD") ===
      toGMT8(selectedItem?.created_at).format("MM-DD")
  );

  if (useConsole) console.log("Flag 2", foundByDate);
  // If found by date, check name similarity
  if (foundByDate.length > 0) {
    // If similarity is above 75%, return the found item
    const bestDateMatch = findBestMatch(foundByDate, 50);
    if (bestDateMatch) {
      return bestDateMatch;
    }
  }

  if (useConsole) console.log("Flag 3");
  // If no match by date, fallback to finding a similar name with 90% threshold
  const bestNameMatch = findBestMatch(data, 60);
  if (useConsole) console.log("Final: ", bestNameMatch);
  // Return best match if found, otherwise null
  return bestNameMatch || null;
}

export function switchLabel(label: string, description: string) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-medium font-semibold">{label}</p>
      <p className="text-tiny text-default-400">{description}</p>
    </div>
  );
}
