import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, BookOpen, DollarSign, TrendingUp, Megaphone, MessageSquare, Users,
  Star, BarChart3, Eye, Zap, Clock, CheckCircle, FileText, Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getMyBookings, getProfileByUserId, getReviewsByTutorId, completeBooking, updateBookingNotes } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [boostPlan, setBoostPlan] = useState<string>("weekly");
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfo | null>(null);
  const [tutorNotes, setTutorNotes] = useState("");
  const [perfRating, setPerfRating] = useState(8);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || role !== "tutor")) {
      navigate("/");
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!user || role !== "tutor") return;

    const fetchData = async () => {
      setIsLoading(true);
      const { data: bks } = await getMyBookings(user.id);

      const enrichedBookings = await Promise.all(
        bks.map(async (b: any) => {
          const { data: studentProf } = await getProfileByUserId(b.student_id);
          return { ...b, studentName: studentProf?.full_name || "Student" };
        })
      );
      setBookings(enrichedBookings);

      const { data: revs } = await getReviewsByTutorId(user.id);
      setReviews(revs);

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
  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.hourly_rate || 0), 0);
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;
  const uniqueStudents = new Set(bookings.map(b => b.student_id)).size;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "N/A";

  // Weekly earnings calculation (last 7 days)
  const lastWeekEarnings = bookings
    .filter(b => {
      const d = new Date(b.booking_date);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return b.status === "completed" && d >= weekAgo;
    })
    .reduce((sum, b) => sum + (b.hourly_rate || 0), 0);

  // Boost plans
  const boostPlans = [
    { id: "weekly", name: "Weekly Boost", price: 9.99, features: ["Top of search for 7 days", "Featured badge", "50% more views"] },
    { id: "monthly", name: "Monthly Boost", price: 29.99, features: ["Top of search for 30 days", "Featured badge", "Priority listing", "Analytics dashboard"] },
    { id: "premium", name: "Premium Boost", price: 49.99, features: ["Top of search for 30 days", "Gold featured badge", "Homepage spotlight", "Priority listing", "Full analytics"] },
  ];

  const handleBoostPurchase = () => {
    const plan = boostPlans.find(p => p.id === boostPlan);
    toast({
      title: "Boost Activated! 🚀",
      description: `Your ${plan?.name} is now active. Your profile will appear at the top of search results.`,
    });
    setBoostDialogOpen(false);
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedBooking) return;
    setIsSubmittingFeedback(true);
    
    // First mark as completed if not already
    if (selectedBooking.status !== 'completed') {
      await completeBooking(selectedBooking.id);
    }

    const { error } = await updateBookingNotes(selectedBooking.id, tutorNotes, perfRating);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feedback Saved", description: "Your feedback has been saved for the student." });
      setFeedbackDialogOpen(false);
      setTutorNotes("");
      setSelectedBooking(null);
      
      // Refresh bookings
      const { data: bks } = await getMyBookings(user!.id);
      const enrichedBookings = await Promise.all(
        bks.map(async (b: any) => {
          const { data: studentProf } = await getProfileByUserId(b.student_id);
          return { ...b, studentName: studentProf?.full_name || "Student" };
        })
      );
      setBookings(enrichedBookings);
    }
    setIsSubmittingFeedback(false);
  };

  const pastConfirmedBookings = bookings
    .filter((b) => b.status === "confirmed" && new Date(b.booking_date) < new Date())
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Tutor Dashboard</h1>
                <Badge variant="default" className="gap-1 bg-teal-500 hover:bg-teal-600">
                  <BookOpen className="h-3 w-3" /> Tutor Account
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Manage your lessons, track your earnings, and grow your business.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              <Card>
                <CardContent className="p-5">
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
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{uniqueStudents}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
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
                      <Calendar className="h-5 w-5 text-primary" /> Upcoming Lessons
                    </CardTitle>
                    <CardDescription>Your confirmed bookings for the next few days.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-16 bg-muted rounded-lg w-full" />
                        <div className="h-16 bg-muted rounded-lg w-full" />
                      </div>
                    ) : upcomingBookings.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingBookings.slice(0, 5).map((b) => (
                          <div key={b.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 border">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              <div>
                                <p className="font-medium text-foreground">Lesson with {b.studentName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(b.booking_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at {b.time_slot}
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
                
                {/* Lessons Awaiting Feedback */}
                {pastConfirmedBookings.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-900/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <MessageSquare className="h-5 w-5" /> Lessons Awaiting Feedback
                      </CardTitle>
                      <CardDescription>These lessons are in the past. Mark them as completed and add student feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pastConfirmedBookings.map((b) => (
                          <div key={b.id} className="flex items-center justify-between rounded-xl bg-white dark:bg-card px-4 py-3 border border-amber-200/50 shadow-sm">
                            <div>
                              <p className="font-bold text-foreground">Lesson with {b.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(b.booking_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {b.time_slot}
                              </p>
                            </div>
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg" onClick={() => { setSelectedBooking(b); setFeedbackDialogOpen(true); }}>
                              Add Feedback
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Performance Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" /> Performance Analytics
                    </CardTitle>
                    <CardDescription>Your teaching performance at a glance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/10 p-4 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-700 dark:text-green-400 mb-1">This Week's Earnings</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">${lastWeekEarnings}</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Completion Rate</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Profile Completeness</span>
                          <span className="font-medium text-primary">
                            {profile ? Math.min(100, [profile.bio, profile.education, profile.subjects?.length, profile.hourly_rate, profile.location, profile.experience].filter(Boolean).length * 17) : 0}%
                          </span>
                        </div>
                        <Progress value={profile ? Math.min(100, [profile.bio, profile.education, profile.subjects?.length, profile.hourly_rate, profile.location, profile.experience].filter(Boolean).length * 17) : 0} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Response Rate</span>
                          <span className="font-medium text-primary">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                    </div>

                    {/* Recent Reviews */}
                    {reviews.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-semibold text-foreground">Recent Reviews</h4>
                        {reviews.slice(0, 3).map((r, i) => (
                          <div key={i} className="bg-muted/30 rounded-lg p-3 border">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, si) => (
                                  <Star key={si} className={`h-3.5 w-3.5 ${si < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{r.student_name}</span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Boost Your Profile */}
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-primary" /> Boost Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground">
                      Get more students by promoting your profile. Promoted profiles appear at the top of search results.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4 text-primary" /> 3x more profile views
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary" /> Priority in search results
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4 text-primary" /> Featured badge on profile
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => setBoostDialogOpen(true)}>
                      <Megaphone className="mr-2 h-4 w-4" /> Boost Now
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
                        <BookOpen className="mr-2 h-4 w-4" /> Edit Profile
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/bookings">
                        <FileText className="mr-2 h-4 w-4" /> View All Bookings
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" /> Student Messages
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Teaching Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" /> Tips to Grow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {[
                      { done: !!profile?.bio, text: "Complete your bio" },
                      { done: !!profile?.intro_video_url, text: "Add an intro video" },
                      { done: (profile?.certificates?.length || 0) > 0, text: "Add certificates" },
                      { done: !!profile?.offers_trial, text: "Offer a free trial" },
                      { done: (profile?.course_topics?.length || 0) >= 3, text: "List 3+ course topics" },
                    ].map((tip, i) => (
                      <div key={i} className={`flex items-center gap-2 ${tip.done ? "text-green-600" : "text-muted-foreground"}`}>
                        <CheckCircle className={`h-4 w-4 ${tip.done ? "text-green-500" : "text-muted"}`} />
                        <span className={tip.done ? "line-through" : ""}>{tip.text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Boost Dialog */}
      <Dialog open={boostDialogOpen} onOpenChange={setBoostDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> Boost Your Profile
            </DialogTitle>
            <DialogDescription>
              Choose a plan to promote your profile and get more students.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {boostPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setBoostPlan(plan.id)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  boostPlan === plan.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground">{plan.name}</h4>
                  <Badge variant={boostPlan === plan.id ? "default" : "secondary"} className="text-base">
                    ${plan.price}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBoostDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBoostPurchase}>
              <Zap className="mr-2 h-4 w-4" /> Purchase Boost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Add notes and a performance rating for {selectedBooking?.studentName}. This will be visible to their parent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Performance Rating (1-10)</Label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="1" max="10" step="1" 
                  className="flex-1 accent-primary" 
                  value={perfRating} 
                  onChange={(e) => setPerfRating(parseInt(e.target.value))} 
                />
                <span className="font-bold text-lg bg-primary/10 text-primary px-3 py-1 rounded-lg w-12 text-center">
                  {perfRating}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Session Notes & Progress</Label>
              <Textarea 
                placeholder="How was the session? What did you cover? What should the student practice?" 
                className="min-h-[120px] rounded-xl"
                value={tutorNotes}
                onChange={(e) => setTutorNotes(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Your notes are private between you and the parent/student.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} disabled={isSubmittingFeedback}>
              {isSubmittingFeedback ? "Saving..." : "Save & Mark Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorDashboard;
