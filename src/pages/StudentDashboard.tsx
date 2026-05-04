import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, BookOpen, Star, Clock, Shield, Search, MessageSquare, Award,
  CheckCircle, Gift, CalendarPlus, Trophy, Sparkles, TrendingUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

  // Gift lesson dialog
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [giftRecipientEmail, setGiftRecipientEmail] = useState("");

  // Google Calendar dialog
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || role !== "student")) {
      navigate("/");
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!user || role !== "student") return;

    const fetchData = async () => {
      setIsLoading(true);
      const { data: bks } = await getMyBookings(user.id);
      const enrichedBookings = await Promise.all(
        bks.map(async (b: any) => {
          const { data: tutorProf } = await getProfileByUserId(b.tutor_id);
          return { ...b, tutorName: tutorProf?.full_name || "Unknown Tutor" };
        })
      );
      setBookings(enrichedBookings);

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
  const totalLessons = completedBookings.length;

  // Badge system
  const badges = [
    { name: "First Step", icon: "🎯", threshold: 1, desc: "Complete your first lesson", discount: 0 },
    { name: "Dedicated Learner", icon: "📚", threshold: 5, desc: "Complete 5 lessons", discount: 5 },
    { name: "Knowledge Seeker", icon: "🔥", threshold: 10, desc: "Complete 10 lessons", discount: 8 },
    { name: "Scholar", icon: "🎓", threshold: 25, desc: "Complete 25 lessons", discount: 10 },
    { name: "Master Learner", icon: "👑", threshold: 50, desc: "Complete 50 lessons", discount: 15 },
  ];

  const earnedBadges = badges.filter(b => totalLessons >= b.threshold);
  const nextBadge = badges.find(b => totalLessons < b.threshold);
  const currentDiscount = earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1].discount : 0;

  // Google Calendar mock
  const addToGoogleCalendar = (booking: BookingInfo) => {
    const startDate = booking.booking_date.replace(/-/g, '');
    const title = encodeURIComponent(`Tutoring Session with ${booking.tutorName}`);
    const details = encodeURIComponent(`Lesson at ${booking.time_slot}. Rate: $${booking.hourly_rate}/hr`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${startDate}&details=${details}`;
    window.open(url, '_blank');
    toast({
      title: "Opening Google Calendar",
      description: "A new tab will open for you to add this event to your calendar.",
    });
  };

  const handleGiftLesson = () => {
    if (!giftRecipientEmail.trim()) {
      toast({ title: "Email required", description: "Please enter the recipient's email.", variant: "destructive" });
      return;
    }
    toast({
      title: "Gift Sent! 🎁",
      description: `A lesson gift has been sent to ${giftRecipientEmail}. You've earned credit towards your next discount!`,
    });
    setGiftDialogOpen(false);
    setGiftRecipientEmail("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
                <Badge variant="default" className="gap-1 bg-blue-500 hover:bg-blue-600">
                  <BookOpen className="h-3 w-3" /> Student Account
                </Badge>
                {currentDiscount > 0 && (
                  <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                    <Sparkles className="h-3 w-3" /> {currentDiscount}% Loyalty Discount
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Track your lessons, earn badges, and unlock discounts.
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
                      <p className="text-xs text-muted-foreground">Completed</p>
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
                      <p className="text-xs text-muted-foreground">Favorites</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{earnedBadges.length}</p>
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Your Next Lessons
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCalendarDialogOpen(true)} className="text-primary">
                        <CalendarPlus className="h-4 w-4 mr-1" /> Sync Calendar
                      </Button>
                    </div>
                    <CardDescription>
                      Manage your upcoming sessions. Add them to Google Calendar or reschedule.
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
                                <p className="font-medium text-foreground">{b.tutorName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(b.booking_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at {b.time_slot}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addToGoogleCalendar(b)} title="Add to Google Calendar">
                                <CalendarPlus className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/bookings">Manage</Link>
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

                {/* Rewards & Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" /> Rewards & Badges
                    </CardTitle>
                    <CardDescription>
                      Complete more lessons to unlock badges and earn discounts on future bookings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress to next badge */}
                    {nextBadge && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground">
                            Next: {nextBadge.icon} {nextBadge.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {totalLessons}/{nextBadge.threshold} lessons
                          </span>
                        </div>
                        <Progress value={(totalLessons / nextBadge.threshold) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {nextBadge.discount > 0 ? `Unlocks ${nextBadge.discount}% discount on all lessons` : nextBadge.desc}
                        </p>
                      </div>
                    )}

                    {/* Badge grid */}
                    <div className="grid grid-cols-5 gap-3">
                      {badges.map((badge) => {
                        const earned = totalLessons >= badge.threshold;
                        return (
                          <div key={badge.name} className={`text-center p-3 rounded-xl border transition-all ${
                            earned ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-muted/30 border-border opacity-50"
                          }`}>
                            <span className="text-2xl block mb-1">{badge.icon}</span>
                            <p className="text-xs font-medium text-foreground truncate">{badge.name}</p>
                            {badge.discount > 0 && (
                              <p className={`text-xs mt-0.5 ${earned ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                                -{badge.discount}%
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {currentDiscount > 0 && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                        <Sparkles className="h-5 w-5 text-green-600" />
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                          You have a {currentDiscount}% loyalty discount active on all bookings!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Gift a Lesson */}
                <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/10 dark:to-rose-900/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="h-5 w-5 text-pink-500" /> Gift a Lesson
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground">
                      Gift a tutoring session to a friend! They get a lesson, you earn credit towards your next discount.
                    </p>
                    <Button className="w-full bg-pink-500 hover:bg-pink-600" onClick={() => setGiftDialogOpen(true)}>
                      <Gift className="mr-2 h-4 w-4" /> Send a Gift
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
                      <Link to="/tutors">
                        <Search className="mr-2 h-4 w-4" /> Find Tutors
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/bookings">
                        <BookOpen className="mr-2 h-4 w-4" /> All Bookings
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/favorites">
                        <Star className="mr-2 h-4 w-4" /> Favorite Tutors
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" /> Messages
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

      {/* Gift Dialog */}
      <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" /> Gift a Lesson
            </DialogTitle>
            <DialogDescription>
              Send a free lesson to a friend. When they use it, you earn credit towards your loyalty discount.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient's Email</label>
              <Input
                placeholder="friend@example.com"
                value={giftRecipientEmail}
                onChange={(e) => setGiftRecipientEmail(e.target.value)}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">What they get:</p>
              <p className="text-muted-foreground">• One free tutoring session (up to $50 value)</p>
              <p className="font-medium text-foreground mt-2">What you get:</p>
              <p className="text-muted-foreground">• $10 credit towards your next booking</p>
              <p className="text-muted-foreground">• Progress towards your next badge</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftDialogOpen(false)}>Cancel</Button>
            <Button className="bg-pink-500 hover:bg-pink-600" onClick={handleGiftLesson}>
              <Gift className="mr-2 h-4 w-4" /> Send Gift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Calendar Dialog */}
      <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" /> Sync with Google Calendar
            </DialogTitle>
            <DialogDescription>
              Add your upcoming lessons to Google Calendar to stay organized.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {upcomingBookings.length > 0 ? (
              <>
                {upcomingBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{b.tutorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.booking_date).toLocaleDateString()} at {b.time_slot}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addToGoogleCalendar(b)}>
                      <CalendarPlus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                ))}
                <Button className="w-full mt-2" onClick={() => {
                  upcomingBookings.forEach(b => addToGoogleCalendar(b));
                  setCalendarDialogOpen(false);
                }}>
                  Add All to Calendar
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming lessons to sync.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
