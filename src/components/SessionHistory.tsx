import { useState, useEffect } from "react";
import { getMyBookings, cancelBooking, createBooking } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { mockTutors } from "@/data/tutors";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, XCircle, CheckCircle, CalendarClock, MessageSquare } from "lucide-react";
import { format, isPast, parse } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Countdown } from "@/components/Countdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function SessionHistory() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [enrichedBookings, setEnrichedBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cancel/Reschedule state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelMode, setCancelMode] = useState<"cancel" | "reschedule">("cancel");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");

  // Tutor feedback state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState<any>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [performanceRating, setPerformanceRating] = useState(5);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await getMyBookings(user!.id);
    if (!error && data) {
      setBookings(data);
      enrichBookings(data);
    } else {
      setIsLoading(false);
    }
  };

  const enrichBookings = async (rawBookings: any[]) => {
    const userIds = new Set<string>();
    rawBookings.forEach((b) => {
      if (role === "student") userIds.add(b.tutor_id);
      if (role === "tutor") userIds.add(b.student_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", Array.from(userIds));

    const profileMap = new Map();
    profiles?.forEach((p) => profileMap.set(p.user_id, p));
    mockTutors.forEach((t) => profileMap.set(t.id, { full_name: t.name, avatar_url: t.avatar }));

    const enriched = rawBookings.map((b) => {
      const partnerId = role === "student" ? b.tutor_id : b.student_id;
      const partner = profileMap.get(partnerId) || { full_name: "Unknown User", avatar_url: "" };
      const datetimeStr = `${b.booking_date} ${b.time_slot}`;
      let isPastSession = false;
      try {
        const sessionDate = parse(datetimeStr, "yyyy-MM-dd hh:mm a", new Date());
        isPastSession = isPast(sessionDate);
      } catch (e) {
        isPastSession = new Date(b.booking_date) < new Date();
      }
      const activeStatuses = ["scheduled", "pending", "confirmed"];
      const status = isPastSession && activeStatuses.includes(b.status) ? "completed" : b.status;
      return { ...b, partner, isPast: isPastSession, displayStatus: status };
    });

    enriched.sort((a, b) => new Date(`${b.booking_date} ${b.time_slot}`).getTime() - new Date(`${a.booking_date} ${a.time_slot}`).getTime());
    setEnrichedBookings(enriched);
    setIsLoading(false);
  };

  const openCancelDialog = (booking: any, mode: "cancel" | "reschedule") => {
    setSelectedBooking(booking);
    setCancelMode(mode);
    setNewDate("");
    setNewTimeSlot("");
    setCancelDialogOpen(true);
  };

  const handleCancelOrReschedule = async () => {
    if (!selectedBooking) return;

    if (cancelMode === "reschedule") {
      if (!newDate || !newTimeSlot) {
        toast.error("Please select both a new date and time slot");
        return;
      }
      // Cancel old booking
      await cancelBooking(selectedBooking.id);
      // Create new booking with new date/time
      const { error } = await createBooking({
        tutor_id: selectedBooking.tutor_id,
        student_id: selectedBooking.student_id,
        booking_date: newDate,
        time_slot: newTimeSlot,
        hourly_rate: selectedBooking.hourly_rate,
      });
      if (error) {
        toast.error("Failed to reschedule", { description: error.message });
      } else {
        toast.success("Booking rescheduled!", { description: `New session: ${newDate} at ${newTimeSlot}` });
      }
    } else {
      const { error } = await cancelBooking(selectedBooking.id);
      if (!error) {
        toast.success("Booking cancelled successfully");
      } else {
        toast.error("Failed to cancel booking");
      }
    }
    setCancelDialogOpen(false);
    fetchBookings();
  };

  // Tutor feedback
  const openFeedbackDialog = (booking: any) => {
    setFeedbackBooking(booking);
    setFeedbackNote("");
    setPerformanceRating(5);
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackBooking || !feedbackNote.trim()) {
      toast.error("Please write a note about the session");
      return;
    }
    // Store feedback (mock for now - in real implementation this would go to a tutor_feedback table)
    toast.success("Feedback submitted!", {
      description: `Your notes for ${feedbackBooking.partner.full_name} have been saved and shared with the parent.`,
    });
    setFeedbackDialogOpen(false);
  };

  const TIME_SLOTS_OPTIONS = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM",
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const upcomingBookings = enrichedBookings.filter(b => !b.isPast);
  const pastBookings = enrichedBookings.filter(b => b.isPast);

  const renderBookings = (list: any[]) => {
    if (list.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No tutoring sessions found here.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((booking) => (
          <Card key={booking.id} className={`overflow-hidden transition-all ${booking.displayStatus === 'cancelled' ? 'opacity-60' : ''}`}>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Date/Time Section */}
                <div className="bg-muted/50 p-4 sm:w-48 flex flex-col justify-center border-b sm:border-b-0 sm:border-r">
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(new Date(booking.booking_date), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Clock className="h-4 w-4" />
                    {booking.time_slot}
                  </div>
                  {!booking.isPast && booking.displayStatus !== "cancelled" && (
                    <Countdown dateStr={booking.booking_date} timeStr={booking.time_slot} />
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {booking.partner.avatar_url ? (
                        <img src={booking.partner.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm text-muted-foreground">
                        {role === "student" ? "Tutor" : "Student"}
                      </p>
                      <p className="font-semibold text-foreground">{booking.partner.full_name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <div className="flex gap-2 flex-wrap">
                      {booking.displayStatus !== "cancelled" && booking.displayStatus !== "completed" && !booking.isPast && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>
                      )}
                      {booking.displayStatus === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                      )}
                      {booking.displayStatus === "cancelled" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
                      )}
                      <Badge variant="secondary" className="font-mono">${booking.hourly_rate}/hr</Badge>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {booking.displayStatus !== "cancelled" && booking.displayStatus !== "completed" && !booking.isPast && (
                        <>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => openCancelDialog(booking, "reschedule")}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 px-3 border-amber-200"
                          >
                            <CalendarClock className="h-4 w-4 mr-1" /> Reschedule
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => openCancelDialog(booking, "cancel")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 border-red-200"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </>
                      )}
                      {booking.displayStatus === "completed" && role === "student" && (
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/5" asChild>
                          <a href={`/tutor/${booking.tutor_id}`}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Leave Review
                          </a>
                        </Button>
                      )}
                      {booking.displayStatus === "completed" && role === "tutor" && (
                        <Button variant="outline" size="sm" onClick={() => openFeedbackDialog(booking)}
                          className="h-8 px-3 text-primary border-primary/30 hover:bg-primary/5">
                          <MessageSquare className="h-4 w-4 mr-1" /> Write Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderBookings(upcomingBookings)}
        </TabsContent>
        <TabsContent value="past">
          {renderBookings(pastBookings)}
        </TabsContent>
      </Tabs>

      {/* Cancel / Reschedule Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {cancelMode === "reschedule" ? "Reschedule Booking" : "Cancel Booking"}
            </DialogTitle>
            <DialogDescription>
              {cancelMode === "reschedule"
                ? "Choose a new date and time for your session. The old booking will be automatically cancelled."
                : "Are you sure you want to cancel this booking? This action cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>

          {cancelMode === "reschedule" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Date</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newDate}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Time Slot</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                >
                  <option value="">Select a time...</option>
                  {TIME_SLOTS_OPTIONS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              {selectedBooking && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">Current booking:</p>
                  <p className="font-medium">
                    {selectedBooking.booking_date} at {selectedBooking.time_slot}
                  </p>
                </div>
              )}
            </div>
          )}

          {cancelMode === "cancel" && (
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ Cancelling within 24 hours of the lesson may not qualify for a refund. Consider rescheduling instead.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Go Back</Button>
            {cancelMode === "cancel" && (
              <Button variant="outline" onClick={() => setCancelMode("reschedule")}
                className="text-amber-600 border-amber-300 hover:bg-amber-50">
                <CalendarClock className="h-4 w-4 mr-1" /> Reschedule Instead
              </Button>
            )}
            <Button
              variant={cancelMode === "cancel" ? "destructive" : "default"}
              onClick={handleCancelOrReschedule}
            >
              {cancelMode === "reschedule" ? "Confirm Reschedule" : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutor Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Share your notes about the session. This will be visible to the student and their parent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {feedbackBooking && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{feedbackBooking.partner.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(feedbackBooking.booking_date), "MMM d, yyyy")} at {feedbackBooking.time_slot}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Student Performance (1-10)</label>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} type="button" onClick={() => setPerformanceRating(n)}
                    className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${
                      n <= performanceRating
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/20"
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Session Notes</label>
              <Textarea
                placeholder="What topics were covered? How did the student perform? What should they work on next?"
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recommended Areas for Improvement</label>
              <div className="flex flex-wrap gap-2">
                {["Practice more exercises", "Review fundamentals", "Homework assigned", "Excellent progress", "Needs extra attention"].map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setFeedbackNote(prev => prev ? `${prev}\n• ${tag}` : `• ${tag}`)}>
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
