import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  DollarSign,
  TrendingUp,
  Megaphone,
  MessageSquare,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getMyBookings, getProfileByUserId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface BookingInfo {
  id: string;
  booking_date: string;
  time_slot: string;
  hourly_rate: number;
  status: string;
  student_id: string;
  studentName?: string;
}

const TutorDashboard = () => {
  const { t } = useTranslation();
  const { user, profile, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || role !== "tutor")) {
      navigate("/");
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!user || role !== "tutor") return;

    const fetchBookings = async () => {
      setIsLoading(true);
      const { data: bks } = await getMyBookings(user.id);
      
      const enrichedBookings = await Promise.all(
        bks.map(async (b: any) => {
          const { data: studentProf } = await getProfileByUserId(b.student_id);
          return { ...b, studentName: studentProf?.full_name || "Student" };
        })
      );
      
      setBookings(enrichedBookings);
      setIsLoading(false);
    };

    fetchBookings();
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

  const totalEarned = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.hourly_rate || 0), 0);

  const pendingRequests = bookings.filter((b) => b.status === "pending").length;

  const handlePromote = () => {
    toast({
      title: "Boost Feature Coming Soon",
      description: "Our paid promotional tools are currently in beta. You will be notified when they are available.",
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
                <h1 className="text-3xl font-bold text-foreground">Tutor Dashboard</h1>
                <Badge variant="default" className="gap-1 bg-teal-500 hover:bg-teal-600">
                  <BookOpen className="h-3 w-3" />
                  Tutor Account
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Manage your lessons, track your earnings, and grow your business.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">${totalEarned}</p>
                      <p className="text-xs text-muted-foreground">Total Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
                      <p className="text-xs text-muted-foreground">Pending Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {new Set(bookings.map(b => b.student_id)).size}
                      </p>
                      <p className="text-xs text-muted-foreground">Unique Students</p>
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
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Lessons
                    </CardTitle>
                    <CardDescription>
                      Your confirmed bookings for the next few days.
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
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              <div>
                                <p className="font-medium text-foreground">
                                  Lesson with {b.studentName}
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
                            <div className="text-right">
                              <span className="font-bold text-primary">${b.hourly_rate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No upcoming lessons scheduled.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Promote Profile Action */}
                <Card className="border-primary/50 bg-primary/5 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-primary" />
                      Boost Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground">
                      Get more students by promoting your profile. Promoted profiles appear at the top of local search results.
                    </p>
                    <Button className="w-full" onClick={handlePromote}>
                      Promote Now
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/profile/edit">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Edit Profile Details
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Student Messages
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

export default TutorDashboard;
