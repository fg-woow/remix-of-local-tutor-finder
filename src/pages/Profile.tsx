import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Mail,
  CheckCircle,
  GraduationCap,
  Award,
  Users,
  BookOpen,
  Video,
  FileText,
  Calendar,
  Edit,
  Sparkles,
  DollarSign,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import SessionHistory from "@/components/SessionHistory";

const isNewUser = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

/* ===== STUDENT PROFILE ===== */
const StudentProfile = ({ profile }: { profile: UserProfile }) => {
  const isNew = isNewUser(profile.created_at);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-0">
          {/* Cover Banner */}
          <div className="h-32 rounded-t-lg bg-gradient-to-r from-primary via-primary/80 to-teal-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar + Name */}
            <div className="flex flex-col sm:flex-row gap-4 -mt-12">
              <div className="relative">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0d9488&color=fff&size=200`}
                  alt={profile.full_name}
                  className="h-24 w-24 rounded-2xl border-4 border-card object-cover shadow-lg"
                />
                {isNew && (
                  <Badge variant="default" className="absolute -top-1 -right-1 gap-1 bg-amber-500 hover:bg-amber-600 text-xs">
                    <Sparkles className="h-3 w-3" />
                    New
                  </Badge>
                )}
              </div>
              <div className="sm:mt-14 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                  <Badge variant="secondary" className="gap-1">
                    {profile.role === "parent" ? <Heart className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                    {profile.role === "parent" ? "Parent" : "Student"}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button asChild className="sm:mt-14 self-start">
                <Link to="/profile/edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Find Tutors</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse local tutors in your area</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/tutors">Browse</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 transition-colors group-hover:bg-secondary/30">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">My Bookings</h3>
            <p className="mt-1 text-sm text-muted-foreground">View your upcoming lessons</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <a href="#session-history">View Bookings</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 transition-colors group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50">
              <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-foreground">My Reviews</h3>
            <p className="mt-1 text-sm text-muted-foreground">Reviews you've written</p>
            <Button variant="outline" size="sm" className="mt-3" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-medium text-foreground">{profile.full_name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary">{profile.role === "parent" ? "Parent" : "Student"}</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium text-foreground">
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <div id="session-history" className="scroll-mt-24">
        <h2 className="text-xl font-bold mb-4 text-foreground">Session History</h2>
        <SessionHistory />
      </div>
    </div>
  );
};

/* ===== TUTOR PROFILE ===== */
const TutorProfileView = ({ profile }: { profile: UserProfile }) => {
  const isNew = isNewUser(profile.created_at);
  const embedUrl = profile.intro_video_url
    ? getYouTubeEmbedUrl(profile.intro_video_url)
    : null;

  const subjects = profile.subjects || [];
  const availability = profile.availability || [];
  const certificates = profile.certificates || [];
  const course_topics = profile.course_topics || [];
  const teaching_levels = profile.teaching_levels || [];
  const suitable_for = profile.suitable_for || [];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-0">
            {/* Cover Banner */}
            <div className="h-32 rounded-t-lg bg-gradient-to-r from-primary via-teal-500 to-emerald-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
            </div>

            {/* Header */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row gap-4 -mt-12">
                <div className="relative">
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0d9488&color=fff&size=200`}
                    alt={profile.full_name}
                    className="h-28 w-28 rounded-2xl border-4 border-card object-cover shadow-lg"
                  />
                  {isNew && (
                    <Badge variant="default" className="absolute -top-1 -right-1 gap-1 bg-amber-500 hover:bg-amber-600 text-xs">
                      <Sparkles className="h-3 w-3" />
                      New
                    </Badge>
                  )}
                </div>
                <div className="sm:mt-14 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                    <Badge variant="default" className="gap-1 bg-primary">
                      <Users className="h-3 w-3" />
                      Tutor
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.experience && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{profile.experience} experience</span>
                      </div>
                    )}
                  </div>
                  {subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {subjects.map((subject) => (
                        <Badge key={subject} variant="subject">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button asChild className="sm:mt-14 self-start">
                  <Link to="/profile/edit">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>

            {/* About */}
            <div className="border-t p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">About</h2>
              <p className="leading-relaxed text-muted-foreground">
                {profile.bio || "No bio added yet. Click 'Edit Profile' to tell students about yourself!"}
              </p>
            </div>

            {/* Education */}
            {profile.education && (
              <div className="border-t p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education
                </h2>
                <p className="text-muted-foreground">{profile.education}</p>
              </div>
            )}

            {/* Certificates */}
            {certificates.length > 0 && (
              <div className="border-t p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Award className="h-5 w-5 text-primary" />
                  Certificates & Qualifications
                </h2>
                <div className="flex flex-wrap gap-2">
                  {certificates.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1">
                      <Award className="h-3 w-3" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Course Topics */}
            {course_topics.length > 0 && (
              <div className="border-t p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  Topics I Teach
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course_topics.map((topic) => (
                    <Badge key={topic} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Teaching Levels */}
            {teaching_levels.length > 0 && (
              <div className="border-t p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  Student Levels
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teaching_levels.map((level) => (
                    <Badge key={level} variant="level">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suitable For */}
            {suitable_for.length > 0 && (
              <div className="border-t p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Best Suited For</h2>
                <div className="flex flex-wrap gap-2">
                  {suitable_for.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900/30 px-4 py-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {availability.length > 0 && (
              <div className="border-t p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Availability
                </h2>
                <div className="flex flex-wrap gap-2">
                  {availability.map((slot) => (
                    <Badge key={slot} variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intro Video */}
        {embedUrl && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Video className="h-5 w-5 text-primary" />
                Introduction Video
              </h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Tutor introduction video"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardContent className="p-6">
            {/* Rate */}
            <div className="mb-6 text-center">
              {profile.hourly_rate ? (
                <>
                  <span className="text-3xl font-bold text-foreground">${profile.hourly_rate}</span>
                  <span className="text-muted-foreground">/hour</span>
                </>
              ) : (
                <span className="text-lg text-muted-foreground">Rate not set</span>
              )}
            </div>

            <Button size="lg" className="mb-4 w-full" asChild>
              <Link to="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Verified tutor</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Face-to-face lessons</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>{profile.email}</span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Account Details</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Role</span>
                  <Badge variant="default" className="bg-primary text-xs">Tutor</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Member Since</span>
                  <span className="font-medium text-foreground">
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Profile Completeness</h3>
              {(() => {
                const fields = [
                  !!profile.bio,
                  subjects.length > 0,
                  !!profile.location,
                  !!profile.hourly_rate,
                  !!profile.experience,
                  availability.length > 0,
                  !!profile.education,
                  certificates.length > 0,
                ];
                const filled = fields.filter(Boolean).length;
                const percentage = Math.round((filled / fields.length) * 100);
                return (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{filled}/{fields.length} sections</span>
                      <span className="font-semibold text-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={`h-full rounded-full ${
                          percentage >= 80
                            ? "bg-green-500"
                            : percentage >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    {percentage < 100 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Complete your profile to attract more students!
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-foreground">Session History</h2>
        <SessionHistory />
      </div>
    </div>
  );
};

/* ===== MAIN PROFILE PAGE ===== */
const Profile = () => {
  const { user, profile, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
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

  if (!user || !profile) return null;

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
            {role === "tutor" ? (
              <TutorProfileView profile={profile} />
            ) : (
              <StudentProfile profile={profile} />
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
