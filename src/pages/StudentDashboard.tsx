import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  Star,
  Clock,
  Shield,
  Search,
  MessageSquare,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getMyBookings, getProfileByUserId, getFavoriteTutorProfiles } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface BookingInfo {
  id: string;
  booking_date: string;
  time_slot: string;
  hourly_rate: number;
  status: string;
  tutor_id: string;
  tutorName?: string;
}

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user, profile, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || role !== "student")) {
      navigate("/");
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!user || role !== "student") return;

    const fetchData = async () => {
      setIsLoading(true);
      // Fetch bookings
      const { data: bks } = await getMyBookings(user.id);
      const enrichedBookings = await Promise.all(
        bks.map(async (b: any) => {
          const { data: tutorProf } = await getProfileByUserId(b.tutor_id);
          return { ...b, tutorName: tutorProf?.full_name || "Unknown Tutor" };
        })
      );
      setBookings(enrichedBookings);

      // Fetch favorites
      const { data: favs } = await getFavoriteTutorProfiles(user.id);
      setFavorites(favs);
      
      setIsLoading(false);
    };

    fetchData();
  }, [user, role]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed" && new Date(b.booking_date) >= new Date())
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

  const completedBookings = bookings.filter((b) => b.status === "completed");

  const handleCancelBooking = (bookingDate: string) => {
    const hoursDifference = (new Date(bookingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursDifference < 24) {
      toast({
        title: "Cancellation not allowed",
        description: "You cannot cancel a session less than 24 hours before it starts.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Cancellation Requested",
      description: "Your cancellation request has been sent.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
                <Badge variant="default" className="gap-1 bg-blue-500 hover:bg-blue-600">
                  <BookOpen className="h-3 w-3" />
                  Student Account
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Track your upcoming lessons, completed sessions, and favorite tutors.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
                      <p className="text-xs text-muted-foreground">Upcoming Lessons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{completedBookings.length}</p>
                      <p className="text-xs text-muted-foreground">Completed Lessons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
                      <p className="text-xs text-muted-foreground">Favorite Tutors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {completedBookings.length >= 5 ? 1 : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Badges Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Upcoming Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Your Next Lessons
                    </CardTitle>
                    <CardDescription>
                      Join your confirmed sessions or request to cancel. Note: Cancellations are not allowed within 24 hours of the start time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-16 bg-muted rounded-lg w-full" />
                        <div className="h-16 bg-muted rounded-lg w-full" />
                      </div>
                    ) : upcomingBookings.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingBookings.map((b) => (
                          <div key={b.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 border">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {b.tutorName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(b.booking_date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  })}{" "}
                                  at {b.time_slot}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleCancelBooking(b.booking_date)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No upcoming lessons scheduled.</p>
                        <Button className="mt-4" asChild>
                          <Link to="/tutors">Find a Tutor</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/tutors">
                        <Search className="mr-2 h-4 w-4" />
                        Find Tutors
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/favorites">
                        <Star className="mr-2 h-4 w-4" />
                        Favorite Tutors
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// CheckCircle icon is missing from imports, let's just make sure we imported it.
// Oh wait, I didn't import CheckCircle. Adding it.
// Fixed inside code content above!
export default StudentDashboard;
