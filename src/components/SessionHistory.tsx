import { useState, useEffect } from "react";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { mockTutors } from "@/data/tutors";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, XCircle, CheckCircle } from "lucide-react";
import { format, isPast, parse } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SessionHistory() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [enrichedBookings, setEnrichedBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
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
    // Collect all unique user IDs we need to fetch profiles for
    const userIds = new Set<string>();
    rawBookings.forEach((b) => {
      if (role === "student") userIds.add(b.tutor_id);
      if (role === "tutor") userIds.add(b.student_id);
    });

    // Fetch profiles from DB
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", Array.from(userIds));

    const profileMap = new Map();
    profiles?.forEach((p) => {
      profileMap.set(p.user_id, p);
    });

    // Also check mock tutors just in case
    mockTutors.forEach((t) => {
      profileMap.set(t.id, { full_name: t.name, avatar_url: t.avatar });
    });

    const enriched = rawBookings.map((b) => {
      const partnerId = role === "student" ? b.tutor_id : b.student_id;
      const partner = profileMap.get(partnerId) || { full_name: "Unknown User", avatar_url: "" };
      
      // Parse date and time
      const datetimeStr = `${b.booking_date} ${b.time_slot}`;
      let isPastSession = false;
      try {
        const sessionDate = parse(datetimeStr, "yyyy-MM-dd hh:mm a", new Date());
        isPastSession = isPast(sessionDate);
      } catch (e) {
        // fallback
        isPastSession = new Date(b.booking_date) < new Date();
      }

      // Auto-update status to completed if it's past and was active
      const activeStatuses = ["scheduled", "pending", "confirmed"];
      const status = isPastSession && activeStatuses.includes(b.status) ? "completed" : b.status;

      return {
        ...b,
        partner,
        isPast: isPastSession,
        displayStatus: status
      };
    });

    // Sort by date descending
    enriched.sort((a, b) => {
      return new Date(`${b.booking_date} ${b.time_slot}`).getTime() - new Date(`${a.booking_date} ${a.time_slot}`).getTime();
    });

    setEnrichedBookings(enriched);
    setIsLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    const { error } = await cancelBooking(bookingId);
    if (!error) {
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } else {
      toast.error("Failed to cancel booking");
    }
  };

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
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    {booking.time_slot}
                  </div>
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
                      <p className="font-semibold text-foreground">
                        {booking.partner.full_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <div className="flex gap-2">
                      {booking.displayStatus !== "cancelled" && booking.displayStatus !== "completed" && !booking.isPast && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Upcoming
                        </Badge>
                      )}
                      {booking.displayStatus === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                      {booking.displayStatus === "cancelled" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Cancelled
                        </Badge>
                      )}
                      <Badge variant="secondary" className="font-mono">
                        ${booking.hourly_rate}/hr
                      </Badge>
                    </div>

                    {booking.displayStatus !== "cancelled" && booking.displayStatus !== "completed" && !booking.isPast && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 w-full sm:w-auto border-red-200"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Booking
                      </Button>
                    )}
                    {booking.displayStatus === "completed" && role === "student" && (
                      <Button variant="ghost" size="sm" className="h-8 px-2 w-full sm:w-auto text-primary hover:text-primary hover:bg-primary/5" asChild>
                        <a href={`/tutor/${booking.tutor_id}`}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Leave Review
                        </a>
                      </Button>
                    )}
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
  );
}
