import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, ArrowLeft, Mail, CheckCircle, Calendar, GraduationCap, Award, Users, FileText, Video, Sparkles, Heart, MessageSquare, Gift, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockTutors, Tutor, Review } from "@/data/tutors";
import { getTutorProfileByUserId, getReviewsByTutorId, getTutorRatingStats, isFavorited, toggleFavorite } from "@/lib/api";
import Reviews from "@/components/Reviews";
import BookingCalendar from "@/components/BookingCalendar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TutorMap from "@/components/TutorMap";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistanceKm, getFallbackCoordinates } from "@/lib/geolocation";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

interface EnhancedTutor extends Tutor {
  education?: string;
  certificates?: string[];
  course_topics?: string[];
  teaching_levels?: string[];
  intro_video_url?: string;
  suitable_for?: string[];
  reviews?: Review[];
  offersTrial?: boolean;
}

const isNewTutor = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
};

const getVideoEmbedUrl = (url: string): string | null => {
  // Check YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  
  // Check Streamable
  const streamableMatch = url.match(/streamable\.com\/([a-zA-Z0-9]+)/);
  if (streamableMatch) return `https://streamable.com/e/${streamableMatch[1]}`;
  
  return null;
};

const TutorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<EnhancedTutor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const { userLocation } = useUserLocation();

  useEffect(() => {
    if (user && id) {
      isFavorited(user.id, id).then(setIsFav);
    }
  }, [user, id]);

  useEffect(() => {
    const fetchTutor = async () => {
      // First try to fetch from database
      const { data, error } = await getTutorProfileByUserId(id!);

      if (data && !error) {
        // Also fetch rating stats from reviews
        const { averageRating, reviewCount } = await getTutorRatingStats(id!);

        let lat = data.latitude;
        let lng = data.longitude;
        if (!lat || !lng) {
          const fallback = getFallbackCoordinates(data.location || "");
          lat = fallback.latitude;
          lng = fallback.longitude;
        }

        setTutor({
          id: data.user_id,
          name: data.full_name,
          avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=0d9488&color=fff`,
          subjects: data.subjects || [],
          location: data.location || "Location not set",
          bio: data.bio || "No bio yet",
          rating: averageRating || 5.0,
          reviewCount: reviewCount,
          hourlyRate: data.hourly_rate || 0,
          availability: data.availability || [],
          experience: data.experience || "New tutor",
          createdAt: data.created_at,
          education: data.education ?? undefined,
          certificates: data.certificates || [],
          course_topics: data.course_topics || [],
          teaching_levels: data.teaching_levels || [],
          intro_video_url: data.intro_video_url || mockTutors.find(t => t.id === data.user_id || t.name === data.full_name)?.intro_video_url || undefined,
          suitable_for: data.suitable_for || [],
          offersTrial: data.offers_trial || false,
          latitude: lat,
          longitude: lng,
        });
        setIsNew(isNewTutor(data.created_at));
      } else {
        // Fall back to mock data
        const mockTutor = mockTutors.find((t) => t.id === id);
        if (mockTutor) {
          setTutor({
            ...mockTutor,
            education: "Bachelor's in Education",
            certificates: ["Teaching Certification", "Subject Specialist"],
            course_topics: [],
            teaching_levels: ["High School", "University"],
            suitable_for: ["Exam Preparation", "Beginners"],
            intro_video_url: mockTutor.intro_video_url,
          });
        }
      }
      setIsLoading(false);
    };

    if (id) {
      fetchTutor();
    }
  }, [id]);

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

  if (!tutor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Tutor not found</h1>
            <Button asChild>
              <Link to="/tutors">Browse all tutors</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const embedUrl = tutor.intro_video_url ? getVideoEmbedUrl(tutor.intro_video_url) : null;

  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to favorite tutors.",
      });
      return;
    }
    if (!tutor.id) return;
    
    setIsFavLoading(true);
    const { isFavorited: newFavState, error } = await toggleFavorite(user.id, tutor.id);
    if (!error) {
      setIsFav(newFavState);
      if (newFavState) {
        toast({ title: "Added to favorites", description: `${tutor.name} saved to your favorites.` });
      } else {
        toast({ title: "Removed from favorites", description: `${tutor.name} removed from favorites.` });
      }
    }
    setIsFavLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tutors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to tutors
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card>
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
                    <div className="relative">
                      {embedUrl ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative cursor-pointer group">
                              <img
                                src={tutor.avatar}
                                alt={tutor.name}
                                className="h-32 w-32 rounded-2xl object-cover shadow-md transition-all group-hover:brightness-75"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="rounded-full bg-black/40 p-2 backdrop-blur-sm transition-transform group-hover:scale-110">
                                  <Play className="h-8 w-8 text-white fill-white" />
                                </div>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none">
                            <DialogTitle className="sr-only">Introduction Video</DialogTitle>
                            <div className="aspect-video w-full">
                              <iframe
                                src={embedUrl + (embedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Tutor introduction video"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <img
                          src={tutor.avatar}
                          alt={tutor.name}
                          className="h-32 w-32 rounded-2xl object-cover shadow-md"
                        />
                      )}
                      {isNew && (
                        <Badge variant="new" className="absolute -top-2 -right-2 gap-1 z-10">
                          <Sparkles className="h-3 w-3" />
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <div className="absolute top-0 right-0 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full h-10 w-10 border-muted-foreground/20 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
                          onClick={handleFavoriteClick}
                          disabled={isFavLoading}
                          title={isFav ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full h-10 w-10 border-muted-foreground/20 hover:bg-primary/10 hover:border-primary/30"
                          asChild
                          title="Message tutor"
                        >
                          <Link to={`/messages?with=${tutor.id}`}>
                            <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          </Link>
                        </Button>
                      </div>

                      <div className="mb-2 flex flex-wrap items-center gap-3 pr-24">
                        <h1 className="text-2xl font-bold text-foreground">{tutor.name}</h1>
                        <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="font-semibold text-foreground">{tutor.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({tutor.reviewCount} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{tutor.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{tutor.experience} experience</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tutor.offersTrial && (
                          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 gap-1">
                            <Gift className="h-3 w-3" />
                            Free Trial Available
                          </Badge>
                        )}
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="subject">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div className="border-t p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">About</h2>
                    <p className="leading-relaxed text-muted-foreground">{tutor.bio}</p>
                  </div>

                  {/* Education */}
                  {tutor.education && (
                    <div className="border-t p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Education
                      </h2>
                      <p className="text-muted-foreground">{tutor.education}</p>
                    </div>
                  )}

                  {/* Certificates */}
                  {tutor.certificates && tutor.certificates.length > 0 && (
                    <div className="border-t p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Award className="h-5 w-5 text-primary" />
                        Certificates & Qualifications
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {tutor.certificates.map((cert) => (
                          <Badge key={cert} variant="secondary" className="gap-1">
                            <Award className="h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Topics */}
                  {tutor.course_topics && tutor.course_topics.length > 0 && (
                    <div className="border-t p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        Topics I Teach
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {tutor.course_topics.map((topic) => (
                          <Badge key={topic} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teaching Levels */}
                  {tutor.teaching_levels && tutor.teaching_levels.length > 0 && (
                    <div className="border-t p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Users className="h-5 w-5 text-primary" />
                        Student Levels
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teaching_levels.map((level) => (
                          <Badge key={level} variant="level">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suitable For */}
                  {tutor.suitable_for && tutor.suitable_for.length > 0 && (
                    <div className="border-t p-6">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Best Suited For</h2>
                      <div className="flex flex-wrap gap-2">
                        {tutor.suitable_for.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900/30 px-4 py-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lesson Packages / Bundle Deals */}
                  <div className="border-t p-6 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Bundle & Save
                      </h2>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">SPECIAL OFFERS</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Purchase a lesson package to get a discount on the hourly rate. Credits never expire!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { count: 5, discount: 5, name: "Starter" },
                        { count: 10, discount: 10, name: "Popular" },
                        { count: 20, discount: 20, name: "Elite" }
                      ].map((pkg) => {
                        const originalPrice = tutor.hourlyRate * pkg.count;
                        const discountedPrice = originalPrice * (1 - pkg.discount / 100);
                        return (
                          <div key={pkg.count} className="relative rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all border-primary/10 hover:border-primary/30 flex flex-col items-center text-center group">
                            {pkg.count === 10 && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                BEST VALUE
                              </div>
                            )}
                            <h3 className="font-bold text-lg mb-1">{pkg.count} Lessons</h3>
                            <p className="text-xs text-muted-foreground mb-3">{pkg.name} Package</p>
                            
                            <div className="mb-4">
                              <span className="text-2xl font-bold">${discountedPrice.toFixed(0)}</span>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(0)}</span>
                                <Badge className="h-4 px-1.5 text-[9px] bg-green-500">{pkg.discount}% OFF</Badge>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                              onClick={() => {
                                toast({
                                  title: "Package Purchased!",
                                  description: `You have successfully purchased the ${pkg.count} lesson package. Credits have been added to your account.`,
                                });
                              }}
                            >
                              Buy Package
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Appointment Booking */}
                  <div className="border-t p-6">
                    <h2 className="mb-6 text-lg font-semibold text-foreground">Book a Single Lesson</h2>
                    <BookingCalendar tutorId={tutor.id} hourlyRate={tutor.hourlyRate} />
                  </div>
                </CardContent>
              </Card>



              {/* Reviews Section */}
              <Card>
                <CardContent className="p-6">
                  <Reviews reviews={tutor.reviews || []} tutorId={tutor.id} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-6 text-center">
                    <span className="text-3xl font-bold text-foreground">${tutor.hourlyRate}</span>
                    <span className="text-muted-foreground">/hour</span>
                  </div>

                  <Button size="lg" className="mb-4 w-full" asChild>
                    <Link to={`/messages?with=${tutor.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message {tutor.name.split(" ")[0]}
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
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Responds within 24 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Section */}
              {tutor.latitude && tutor.longitude && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Tutor Location
                    </h3>
                    {userLocation && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {(() => {
                          const dist = calculateDistanceKm(userLocation, { latitude: tutor.latitude!, longitude: tutor.longitude! });
                          return dist < 1 ? "< 1 km away" : `${Math.round(dist * 10) / 10} km away`;
                        })()}
                      </span>
                    )}
                  </div>
                  <TutorMap
                    tutorName={tutor.name}
                    tutorLocation={tutor.location}
                    latitude={tutor.latitude}
                    longitude={tutor.longitude}
                    userLatitude={userLocation?.latitude}
                    userLongitude={userLocation?.longitude}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TutorProfile;