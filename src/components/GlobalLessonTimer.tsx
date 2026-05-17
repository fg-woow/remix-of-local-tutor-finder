import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getMyBookings, getChildBookings, getParentChildren, getProfileByUserId } from "@/lib/api";
import { parse, differenceInMinutes, differenceInSeconds } from "date-fns";
import { Clock, ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalLessonTimer() {
  const { user, role } = useAuth();
  const [upcomingBooking, setUpcomingBooking] = useState<any | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [show, setShow] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        let allBookings: any[] = [];
        
        if (role === "parent") {
          const { data: childrenLinks } = await getParentChildren(user.id);
          const childIds = childrenLinks?.filter(c => c.status === 'linked' && c.child_id).map(c => c.child_id) || [];
          
          for (const childId of childIds) {
             const { data: bks } = await getChildBookings(childId);
             allBookings = [...allBookings, ...(bks || [])];
          }
        } else {
          const { data: bks } = await getMyBookings(user.id);
          allBookings = bks || [];
        }

        // Filter for upcoming bookings
        const now = new Date();
        const futureBookings = allBookings
          .filter(b => b.status === "confirmed")
          .map(b => {
            const datetimeStr = `${b.booking_date} ${b.time_slot}`;
            const targetDate = parse(datetimeStr, "yyyy-MM-dd hh:mm a", new Date());
            return { ...b, targetDate };
          })
          .filter(b => b.targetDate > now)
          .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

        if (futureBookings.length > 0) {
          const closest = futureBookings[0];
          // get tutor name
          const { data: profile } = await getProfileByUserId(closest.tutor_id);
          setUpcomingBooking({ ...closest, tutorName: profile?.full_name || "Tutor" });
        } else {
           setUpcomingBooking(null);
        }
      } catch (e) {
        console.error("Failed to fetch bookings for timer", e);
      }
    };

    fetchBookings();
    
    // Refresh bookings every 5 minutes
    const interval = setInterval(fetchBookings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, role]);

  useEffect(() => {
    if (!upcomingBooking || isDismissed) {
       setShow(false);
       return;
    }

    const checkTime = () => {
      const targetDate = upcomingBooking.targetDate;
      const minutesDiff = differenceInMinutes(targetDate, new Date());
      const secondsDiff = differenceInSeconds(targetDate, new Date());

      if (minutesDiff >= 0 && minutesDiff <= 30 && secondsDiff > 0) {
        setShow(true);
        const mins = Math.floor(secondsDiff / 60);
        const secs = secondsDiff % 60;
        setTimeLeftStr(`${mins}:${secs.toString().padStart(2, "0")}`);
      } else {
        setShow(false);
      }
    };

    checkTime();
    const timerInterval = setInterval(checkTime, 1000);
    return () => clearInterval(timerInterval);
  }, [upcomingBooking, isDismissed]);

  return (
    <AnimatePresence>
      {show && upcomingBooking && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-72 bg-card border shadow-lg rounded-xl overflow-hidden"
        >
          <div className="bg-primary px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="font-semibold text-sm">Upcoming Lesson!</span>
            </div>
            <button 
              onClick={() => setIsDismissed(true)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Session with {upcomingBooking.tutorName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {upcomingBooking.time_slot}
              </p>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Starts in
                </p>
                <p className="text-2xl font-bold text-amber-500 tabular-nums leading-none">
                  {timeLeftStr}
                </p>
              </div>
              
              <Link 
                to="/bookings"
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors"
              >
                Join <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
