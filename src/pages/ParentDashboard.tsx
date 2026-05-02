import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Calendar,
  BookOpen,
  Star,
  Clock,
  Shield,
  Trash2,
  CheckCircle,
  AlertCircle,
  Mail,
  Search,
  MapPin,
  DollarSign,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  getParentChildren,
  linkChild,
  unlinkChild,
  getChildProfile,
  getChildBookings,
  getProfileByUserId,
} from "@/lib/api";
import { useTranslation } from "react-i18next";

interface ChildInfo {
  linkId: string;
  email: string;
  status: string;
  childId: string | null;
  profile: {
    full_name: string;
    avatar_url: string | null;
    email: string;
  } | null;
  bookings: Array<{
    id: string;
    booking_date: string;
    time_slot: string;
    hourly_rate: number;
    status: string;
    tutor_id: string;
    tutorName?: string;
  }>;
}

const ParentDashboard = () => {
  const { t } = useTranslation();
  const { user, profile, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [childEmail, setChildEmail] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch children data
  useEffect(() => {
    if (!user) return;

    const fetchChildren = async () => {
      setIsLoadingChildren(true);
      const { data: links } = await getParentChildren(user.id);

      const childInfos: ChildInfo[] = await Promise.all(
        links.map(async (link: any) => {
          let childProfile = null;
          let bookings: any[] = [];

          if (link.child_id) {
            const { data: prof } = await getChildProfile(link.child_id);
            childProfile = prof;
            const { data: bks } = await getChildBookings(link.child_id);
            
            // Fetch tutor names for bookings
            bookings = await Promise.all(
              bks.map(async (b: any) => {
                const { data: tutorProf } = await getProfileByUserId(b.tutor_id);
                return { ...b, tutorName: tutorProf?.full_name || "Unknown Tutor" };
              })
            );
          }

          return {
            linkId: link.id,
            email: link.child_email,
            status: link.status,
            childId: link.child_id,
            profile: childProfile,
            bookings,
          };
        })
      );

      setChildren(childInfos);
      setIsLoadingChildren(false);
    };

    fetchChildren();
  }, [user]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !childEmail.trim()) return;

    setIsLinking(true);
    const { data, error } = await linkChild(user.id, childEmail.trim());

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        toast({
          title: "Already linked",
          description: "This child is already linked to your account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Child linked!",
        description: data?.status === "linked"
          ? `${childEmail} has been linked to your account.`
          : `Invitation sent to ${childEmail}. They'll appear once they create an account.`,
      });

      // Refresh children list
      const { data: links } = await getParentChildren(user.id);
      const childInfos: ChildInfo[] = links.map((link: any) => ({
        linkId: link.id,
        email: link.child_email,
        status: link.status,
        childId: link.child_id,
        profile: null,
        bookings: [],
      }));
      setChildren(childInfos);
    }

    setChildEmail("");
    setIsLinking(false);
  };

  const handleUnlinkChild = async (linkId: string, email: string) => {
    const { error } = await unlinkChild(linkId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setChildren((prev) => prev.filter((c) => c.linkId !== linkId));
      toast({ title: "Child removed", description: `${email} has been unlinked.` });
    }
  };

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

  const upcomingBookings = children.flatMap((c) =>
    c.bookings
      .filter((b) => b.status === "confirmed" && new Date(b.booking_date) >= new Date())
      .map((b) => ({ ...b, childName: c.profile?.full_name || c.email }))
  ).sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

  const totalSpent = children.flatMap((c) =>
    c.bookings.filter((b) => b.status === "completed" || b.status === "confirmed")
  ).reduce((sum, b) => sum + (b.hourly_rate || 0), 0);

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
                <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title", { defaultValue: "Parent Dashboard" })}</h1>
                <Badge variant="default" className="gap-1 bg-pink-500 hover:bg-pink-600">
                  <Shield className="h-3 w-3" />
                  Parent Account
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Monitor and manage your child's learning journey safely
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{children.length}</p>
                      <p className="text-xs text-muted-foreground">Children Linked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.upcoming_lessons", { defaultValue: "Upcoming Lessons" })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">${totalSpent}</p>
                      <p className="text-xs text-muted-foreground">Total Invested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">100%</p>
                      <p className="text-xs text-muted-foreground">Verified Tutors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Add Child Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Link a Child's Account
                    </CardTitle>
                    <CardDescription>
                      Enter your child's email to link their Learnnear account to your parent dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLinkChild} className="flex gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          value={childEmail}
                          onChange={(e) => setChildEmail(e.target.value)}
                          placeholder="child@example.com"
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isLinking}>
                        {isLinking ? "Linking..." : "Link Child"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Children Cards */}
                {isLoadingChildren ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex gap-4 animate-pulse">
                            <div className="h-12 w-12 rounded-full bg-muted" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-32 bg-muted rounded" />
                              <div className="h-3 w-48 bg-muted rounded" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : children.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">No children linked yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Link your child's email address above to start monitoring their learning progress.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  children.map((child) => (
                    <Card key={child.linkId}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={child.profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {(child.profile?.full_name || child.email).substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {child.profile?.full_name || child.email}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{child.email}</span>
                                {child.status === "linked" ? (
                                  <Badge variant="default" className="bg-green-500 text-xs gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Linked
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleUnlinkChild(child.linkId, child.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Child's Upcoming Bookings */}
                        {child.bookings.length > 0 ? (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              Upcoming Lessons
                            </h4>
                            <div className="space-y-2">
                              {child.bookings
                                .filter((b) => b.status !== "cancelled")
                                .slice(0, 3)
                                .map((booking) => (
                                  <div
                                    key={booking.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-foreground">
                                          {booking.tutorName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(booking.booking_date).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                          })}{" "}
                                          at {booking.time_slot}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <Badge
                                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                                        className={`text-xs ${booking.status === "confirmed" ? "bg-green-500" : ""}`}
                                      >
                                        {booking.status}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        ${booking.hourly_rate}/hr
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : child.status === "linked" ? (
                          <div className="border-t pt-4 text-center py-4">
                            <p className="text-sm text-muted-foreground">{t("dashboard.no_lessons", { defaultValue: "No upcoming lessons" })}</p>
                            <Button variant="outline" size="sm" className="mt-2" asChild>
                              <Link to="/tutors">
                                <Search className="mr-2 h-3 w-3" />
                                {t("dashboard.find_tutors", { defaultValue: "Find Tutors" })}
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="border-t pt-4 text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              Waiting for your child to create their account
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
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
                      <Link to="/profile/edit">
                        <Users className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Safety Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Safety Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Verified Tutors</p>
                        <p className="text-xs text-muted-foreground">
                          All tutors are verified and background-checked
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Lesson Monitoring</p>
                        <p className="text-xs text-muted-foreground">
                          View all booked lessons and their status
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Review Access</p>
                        <p className="text-xs text-muted-foreground">
                          Read reviews from other parents and students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Spending Overview</p>
                        <p className="text-xs text-muted-foreground">
                          Track your education investment in one place
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Schedule */}
                {upcomingBookings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Next Lessons
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {upcomingBookings.slice(0, 5).map((b) => (
                        <div key={b.id} className="flex items-center gap-3 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {b.childName} → {b.tutorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(b.booking_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at {b.time_slot}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ParentDashboard;
