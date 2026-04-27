import { useState, useEffect } from "react";
import { parse, differenceInSeconds } from "date-fns";

export function Countdown({ dateStr, timeStr }: { dateStr: string; timeStr: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const datetimeStr = `${dateStr} ${timeStr}`;
        const targetDate = parse(datetimeStr, "yyyy-MM-dd hh:mm a", new Date());
        const secondsDiff = differenceInSeconds(targetDate, new Date());

        if (secondsDiff <= 0) {
          setTimeLeft("In progress / Passed");
          return;
        }

        const days = Math.floor(secondsDiff / (3600 * 24));
        const hours = Math.floor((secondsDiff % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsDiff % 3600) / 60);

        if (days > 0) {
          setTimeLeft(`In ${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`In ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`In ${minutes}m`);
        }
      } catch (e) {
        setTimeLeft("");
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  if (!timeLeft) return null;

  return (
    <div className="text-xs font-medium text-amber-600 bg-amber-50 dark:text-amber-500 dark:bg-amber-950/30 px-2 py-0.5 rounded-full whitespace-nowrap animate-pulse">
      {timeLeft}
    </div>
  );
}
