import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Calendar as CalendarIcon,
  Star,
  Clock,
  Shield,
  Trash2,
  CheckCircle,
  AlertCircle,
  Mail,
  Search,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Bell,
  Heart,
  Edit,
  MessageSquare,
  MoreVertical,
  Minus,
  Send,
  HeadphonesIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const CircularProgress = ({ value, max, size = 100, strokeWidth = 8 }: { value: number; max: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / max) * circumference;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-500 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center px-2">
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold leading-tight mb-1">Wallet<br/>Balance</span>
        <span className="text-2xl font-extrabold text-foreground leading-none">${value.toFixed(2)}</span>
        <span className="text-[10px] text-muted-foreground mt-1">of ${max.toFixed(2)}</span>
      </div>
    </div>
  );
};

const CalendarWidget = ({ bookings }: { bookings: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];
  
  // Previous month filler days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold text-sm">{monthNames[month]} {year}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground font-medium mb-2">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="grid grid-cols-7 text-center text-sm gap-y-2">
        <TooltipProvider>
          {days.map((d, idx) => {
            const dayBookings = bookings.filter(b => {
              const bDate = new Date(b.booking_date);
              return bDate.getDate() === d.day && bDate.getMonth() === d.date.getMonth() && bDate.getFullYear() === d.date.getFullYear();
            });
            const hasBookings = dayBookings.length > 0;
            const isToday = new Date().toDateString() === d.date.toDateString();

            if (!d.isCurrentMonth) {
              return <div key={idx} className="text-muted-foreground/30">{d.day}</div>;
            }

            return (
              <Tooltip key={idx} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full cursor-pointer transition-colors
                    ${hasBookings ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : "hover:bg-muted"}
                    ${!hasBookings && isToday ? "border border-primary text-primary" : ""}
                  `}>
                    {d.day}
                  </div>
                </TooltipTrigger>
                {hasBookings && (
                  <TooltipContent className="p-3 max-w-[250px] bg-white dark:bg-card border shadow-lg text-foreground" sideOffset={5}>
                    <p className="font-bold mb-2 text-sm border-b pb-1 border-border">
                      {d.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-2">
                      {dayBookings.map((b, i) => (
                        <div key={i} className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-semibold text-xs leading-none">{b.childName}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">with {b.tutorName}</p>
                          </div>
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">{b.time_slot}</Badge>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};

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

  const upcomingBookings = children.flatMap((c) =>
    c.bookings
      .filter((b) => b.status === "confirmed" && new Date(b.booking_date) >= new Date())
      .map((b) => ({ ...b, childName: c.profile?.full_name || c.email }))
  ).sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

  const totalSpent = children.flatMap((c) =>
    c.bookings.filter((b) => b.status === "completed" || b.status === "confirmed")
  ).reduce((sum, b) => sum + (b.hourly_rate || 0), 0);

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

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB] dark:bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Top Header & Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-foreground">Parent Dashboard</h1>
                  <Badge className="bg-pink-500 hover:bg-pink-600 rounded-full px-3 py-0.5 text-xs font-medium">
                    Parent Account
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Monitor and manage your child's learning journey safely
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white dark:bg-card p-4 pr-6 rounded-3xl shadow-sm border">
                <CircularProgress value={45} max={100} size={110} strokeWidth={5} />
                <Button size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-md bg-teal-500 hover:bg-teal-600">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{children.length || 2}</p>
                    <p className="text-sm font-medium text-muted-foreground mb-4">Children Linked</p>
                    <Link to="#" className="text-xs font-semibold text-primary flex items-center hover:underline">
                      View Children <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-500">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{upcomingBookings.length || 3}</p>
                    <p className="text-sm font-medium text-muted-foreground mb-4">Upcoming Lessons</p>
                    <Link to="#" className="text-xs font-semibold text-primary flex items-center hover:underline">
                      View Calendar <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">${totalSpent || 120}.00</p>
                    <p className="text-sm font-medium text-muted-foreground mb-4">Total Invested</p>
                    <Link to="#" className="text-xs font-semibold text-primary flex items-center hover:underline">
                      View Transactions <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">100%</p>
                    <p className="text-sm font-medium text-muted-foreground mb-4">Verified Tutors</p>
                    <Link to="#" className="text-xs font-semibold text-primary flex items-center hover:underline">
                      Learn More <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Grid Content */}
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Left Column (Spans 2) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Upcoming Schedule Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Calendar Widget */}
                  <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card flex flex-col">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        Upcoming Schedule
                      </CardTitle>
                      <Link to="#" className="text-xs font-semibold text-primary">View Calendar</Link>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CalendarWidget bookings={upcomingBookings} />
                      
                      <div className="mt-auto bg-muted/30 p-3 rounded-xl flex items-center justify-between border">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Notify 15 mins before class.</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Lessons List */}
                  <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold">Next Lesson</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Today, May 20 • 2:30 PM</p>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-foreground text-sm">Math</h4>
                            <p className="text-xs text-muted-foreground">with John Smith</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-green-600 bg-green-50 border-green-200">Online</Badge>
                        </div>
                      </div>

                      <div className="space-y-1 pt-3 border-t border-dashed">
                        <p className="text-xs text-muted-foreground font-medium">Thu, May 22 • 4:00 PM</p>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-foreground text-sm">English</h4>
                            <p className="text-xs text-muted-foreground">with Sarah Johnson</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-green-600 bg-green-50 border-green-200">Online</Badge>
                        </div>
                      </div>

                      <div className="space-y-1 pt-3 border-t border-dashed">
                        <p className="text-xs text-muted-foreground font-medium">Sat, May 24 • 11:00 AM</p>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-foreground text-sm">Science</h4>
                            <p className="text-xs text-muted-foreground">with Michael Brown</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50 border-blue-200">In-Person</Badge>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>

                {/* My Children Row */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-foreground">My Children</h3>
                    <Link to="#" className="text-xs font-semibold text-primary hover:underline">Manage Children</Link>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    {/* Child 1 */}
                    <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-muted">
                              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                              <AvatarFallback>AM</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-sm">Alex Miller</h4>
                              <p className="text-xs text-muted-foreground">Age 9</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Next Lesson</span>
                            <span className="font-medium">Today, 2:30 PM (Math)</span>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-primary">40%</span>
                            </div>
                            <Progress value={40} className="h-1.5" />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Last Activity</span>
                            <span className="font-medium">May 19, 2026</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full mt-4 h-8 text-xs rounded-lg text-primary border-primary/20 hover:bg-primary/5">
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Child 2 */}
                    <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-muted">
                              <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                              <AvatarFallback>EM</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-sm">Emma Miller</h4>
                              <p className="text-xs text-muted-foreground">Age 7</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Next Lesson</span>
                            <span className="font-medium">Thu, 4:00 PM (English)</span>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-purple-600">70%</span>
                            </div>
                            <Progress value={70} className="h-1.5 bg-purple-100 dark:bg-purple-900/30 indicator-purple-500" />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Last Activity</span>
                            <span className="font-medium">May 18, 2026</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full mt-4 h-8 text-xs rounded-lg text-primary border-primary/20 hover:bg-primary/5">
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Add Child */}
                    <Card className="rounded-2xl shadow-none border-2 border-dashed bg-transparent hover:bg-muted/30 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                      <div className="h-12 w-12 rounded-full border border-muted-foreground/30 flex items-center justify-center mb-3">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-bold text-sm mb-1">Add Another Child</h4>
                      <p className="text-xs text-muted-foreground">Link a new child to start monitoring their learning.</p>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Learning Progress (Moved to sidebar in this layout to fit grid better, or kept separate. Let's make it fit right side for balance) */}
                <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold">Learning Progress</CardTitle>
                    <Link to="#" className="text-xs font-semibold text-primary">View Report</Link>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <h4 className="text-sm font-bold">Math</h4>
                          <p className="text-[10px] text-muted-foreground">Good job! Keep it up.</p>
                        </div>
                        <span className="text-sm font-bold text-primary">40%</span>
                      </div>
                      <Progress value={40} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <h4 className="text-sm font-bold">English</h4>
                          <p className="text-[10px] text-muted-foreground">Great progress!</p>
                        </div>
                        <span className="text-sm font-bold text-purple-600">70%</span>
                      </div>
                      <Progress value={70} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <h4 className="text-sm font-bold">Science</h4>
                          <p className="text-[10px] text-muted-foreground">You're doing well.</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600">60%</span>
                      </div>
                      <Progress value={60} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground pl-1">Quick Actions</h3>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-white dark:bg-card shadow-sm border-none font-semibold text-primary hover:text-primary" asChild>
                    <Link to="/tutors">
                      <Search className="mr-3 h-4 w-4" />
                      Find Tutors
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-white dark:bg-card shadow-sm border-none font-semibold text-primary hover:text-primary" asChild>
                    <Link to="/favorites">
                      <Heart className="mr-3 h-4 w-4" />
                      Favorite Tutors
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12 bg-white dark:bg-card shadow-sm border-none font-semibold text-primary hover:text-primary" asChild>
                    <Link to="/profile/edit">
                      <Edit className="mr-3 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>

                {/* Messages Widget Mock */}
                <Card className="rounded-2xl shadow-md border-none overflow-hidden flex flex-col bg-white dark:bg-card">
                  <div className="bg-primary p-3 flex justify-between items-center text-primary-foreground">
                    <span className="font-semibold text-sm">Messages</span>
                    <div className="flex gap-2">
                      <Minus className="h-4 w-4 cursor-pointer" />
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <div className="p-3 space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src="https://i.pravatar.cc/150?img=11" />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">John Smith</span>
                            <span className="text-[10px] text-muted-foreground">10:30 AM</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            Lesson is confirmed for today at 2:30 PM.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">Sarah Johnson</span>
                            <span className="text-[10px] text-muted-foreground">Yesterday</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            Thanks! See you then.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <HeadphonesIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-primary">Support Team</span>
                            <span className="text-[10px] text-muted-foreground">May 18</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            How can we help you?
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 border-t bg-muted/10">
                    <div className="relative w-full flex items-center">
                      <Input placeholder="Type a message..." className="text-xs rounded-full pr-10 border-none bg-muted/30 focus-visible:ring-0 h-9" />
                      <Button size="icon" className="absolute right-1 h-7 w-7 rounded-full bg-primary hover:bg-primary/90">
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>

                {/* Safety Features */}
                <Card className="rounded-2xl shadow-sm border-none bg-white dark:bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Safety Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground leading-none mb-1">Verified Tutors</p>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          All tutors are verified and background-checked
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground leading-none mb-1">Lesson Monitoring</p>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          View all booked lessons and their status
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground leading-none mb-1">Review Access</p>
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          Read reviews from other parents and students
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>

            {/* Bottom Notification Bar */}
            <div className="mt-8 flex items-center justify-between bg-white dark:bg-card p-4 rounded-2xl shadow-sm border text-sm">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-bold">Reminder is ON</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">You will receive a notification 15 minutes before each class starts.</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-full text-xs h-8">
                Manage Notifications
              </Button>
            </div>
            
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ParentDashboard;
