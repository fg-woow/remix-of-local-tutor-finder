import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Save, MapPin, DollarSign, Clock, BookOpen, GraduationCap, Award, Users, Video, FileText, Plus, X, Navigation } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { subjects, studentLevels } from "@/data/tutors";

const suitableForOptions = [
  "Exam Preparation",
  "Beginners",
  "Advanced Students",
  "Engineering Students",
  "Medical Students",
  "Business Students",
  "Language Learners",
  "Hobbyists",
];

const ProfileEdit = () => {
  const { user, profile, role, updateProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newCertificate, setNewCertificate] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    subjects: [] as string[],
    location: "",
    hourly_rate: "",
    experience: "",
    availability: [] as string[],
    education: "",
    certificates: [] as string[],
    course_topics: [] as string[],
    teaching_levels: [] as string[],
    intro_video_url: "",
    suitable_for: [] as string[],
    offers_trial: false,
    travel_radius: "",
    travel_rate_per_km: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        subjects: profile.subjects || [],
        location: profile.location || "",
        hourly_rate: profile.hourly_rate?.toString() || "",
        experience: profile.experience || "",
        availability: profile.availability || [],
        education: profile.education || "",
        certificates: profile.certificates || [],
        course_topics: profile.course_topics || [],
        teaching_levels: profile.teaching_levels || [],
        intro_video_url: profile.intro_video_url || "",
        suitable_for: profile.suitable_for || [],
        offers_trial: profile.offers_trial || false,
        travel_radius: (profile as any).travel_radius?.toString() || "",
        travel_rate_per_km: (profile as any).travel_rate_per_km?.toString() || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updates = {
      full_name: formData.full_name,
      bio: formData.bio || null,
      subjects: formData.subjects,
      location: formData.location || null,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      experience: formData.experience || null,
      availability: formData.availability,
      education: formData.education || null,
      certificates: formData.certificates,
      course_topics: formData.course_topics,
      teaching_levels: formData.teaching_levels,
      intro_video_url: formData.intro_video_url || null,
      suitable_for: formData.suitable_for,
      offers_trial: formData.offers_trial,
      travel_radius: formData.travel_radius ? parseInt(formData.travel_radius) : null,
      travel_rate_per_km: formData.travel_rate_per_km ? parseFloat(formData.travel_rate_per_km) : null,
    };

    const { error } = await updateProfile(updates);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleAvailability = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter((t) => t !== time)
        : [...prev.availability, time],
    }));
  };

  const toggleTeachingLevel = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      teaching_levels: prev.teaching_levels.includes(level)
        ? prev.teaching_levels.filter((l) => l !== level)
        : [...prev.teaching_levels, level],
    }));
  };

  const toggleSuitableFor = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      suitable_for: prev.suitable_for.includes(option)
        ? prev.suitable_for.filter((o) => o !== option)
        : [...prev.suitable_for, option],
    }));
  };

  const addCourseTopic = () => {
    if (newTopic.trim() && !formData.course_topics.includes(newTopic.trim())) {
      setFormData((prev) => ({
        ...prev,
        course_topics: [...prev.course_topics, newTopic.trim()],
      }));
      setNewTopic("");
    }
  };

  const removeCourseTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      course_topics: prev.course_topics.filter((t) => t !== topic),
    }));
  };

  const addCertificate = () => {
    if (newCertificate.trim() && !formData.certificates.includes(newCertificate.trim())) {
      setFormData((prev) => ({
        ...prev,
        certificates: [...prev.certificates, newCertificate.trim()],
      }));
      setNewCertificate("");
    }
  };

  const removeCertificate = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((c) => c !== cert),
    }));
  };

  const availabilityOptions = ["Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Flexible"];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Edit Profile</CardTitle>
                <CardDescription>
                  {role === "tutor" 
                    ? "Complete your tutor profile to start receiving lesson requests"
                    : "Update your profile information"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-foreground">
                        Full Name
                      </label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="mb-2 block text-sm font-medium text-foreground">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell students about yourself, your teaching style, and experience..."
                        className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
                      <MapPin className="mr-1 inline-block h-4 w-4" />
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Manhattan, NY"
                    />
                  </div>

                  {/* Tutor-specific fields */}
                  {role === "tutor" && (
                    <>
                      {/* Education */}
                      <div>
                        <label htmlFor="education" className="mb-2 block text-sm font-medium text-foreground">
                          <GraduationCap className="mr-1 inline-block h-4 w-4" />
                          Education Background
                        </label>
                        <Input
                          id="education"
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          placeholder="e.g., M.Sc. in Mathematics from MIT"
                        />
                      </div>

                      {/* Certificates */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          <Award className="mr-1 inline-block h-4 w-4" />
                          Certificates & Qualifications
                        </label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newCertificate}
                            onChange={(e) => setNewCertificate(e.target.value)}
                            placeholder="e.g., TEFL Certified, CPA License"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertificate())}
                          />
                          <Button type="button" variant="outline" onClick={addCertificate}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.certificates.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.certificates.map((cert) => (
                              <Badge key={cert} variant="secondary" className="gap-1">
                                <Award className="h-3 w-3" />
                                {cert}
                                <button type="button" onClick={() => removeCertificate(cert)}>
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Subjects */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          <BookOpen className="mr-1 inline-block h-4 w-4" />
                          Subjects you teach
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => toggleSubject(subject)}
                              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                formData.subjects.includes(subject)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card text-foreground hover:border-primary"
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Course Topics */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          <FileText className="mr-1 inline-block h-4 w-4" />
                          Specific Course Topics
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add specific topics you teach (e.g., Ancient Egyptian History, Calculus, Organic Chemistry)
                        </p>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="e.g., East Asian History, Linear Algebra"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCourseTopic())}
                          />
                          <Button type="button" variant="outline" onClick={addCourseTopic}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.course_topics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.course_topics.map((topic) => (
                              <Badge key={topic} variant="subject" className="gap-1">
                                {topic}
                                <button type="button" onClick={() => removeCourseTopic(topic)}>
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Teaching Levels */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          <Users className="mr-1 inline-block h-4 w-4" />
                          Student Levels You Teach
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {studentLevels.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => toggleTeachingLevel(level)}
                              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                formData.teaching_levels.includes(level)
                                  ? "border-blue-500 bg-blue-500 text-white"
                                  : "border-border bg-card text-foreground hover:border-blue-500"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Suitable For */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          Best Suited For
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Who would benefit most from your tutoring?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suitableForOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleSuitableFor(option)}
                              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                formData.suitable_for.includes(option)
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-border bg-card text-foreground hover:border-green-500"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Intro Video URL */}
                      <div>
                        <label htmlFor="intro_video_url" className="mb-2 block text-sm font-medium text-foreground">
                          <Video className="mr-1 inline-block h-4 w-4" />
                          Introduction Video URL (30-60 seconds)
                        </label>
                        <Input
                          id="intro_video_url"
                          name="intro_video_url"
                          value={formData.intro_video_url}
                          onChange={handleChange}
                          placeholder="e.g., https://youtube.com/watch?v=..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload to YouTube or Vimeo and paste the link here
                        </p>
                      </div>

                      {/* Hourly Rate */}
                      <div>
                        <label htmlFor="hourly_rate" className="mb-2 block text-sm font-medium text-foreground">
                          <DollarSign className="mr-1 inline-block h-4 w-4" />
                          Hourly Rate ($)
                        </label>
                        <Input
                          id="hourly_rate"
                          name="hourly_rate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourly_rate}
                          onChange={handleChange}
                          placeholder="45"
                        />
                      </div>

                      {/* Travel Radius */}
                      <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            <Navigation className="mr-1 inline-block h-4 w-4" />
                            Travel Radius
                          </label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Set the maximum distance you're willing to travel for lessons and the extra charge per km.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="travel_radius" className="text-xs text-muted-foreground mb-1 block">
                                Max Distance (km)
                              </label>
                              <Input
                                id="travel_radius"
                                name="travel_radius"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.travel_radius}
                                onChange={handleChange}
                                placeholder="e.g., 15"
                              />
                            </div>
                            <div>
                              <label htmlFor="travel_rate_per_km" className="text-xs text-muted-foreground mb-1 block">
                                Extra $/km
                              </label>
                              <Input
                                id="travel_rate_per_km"
                                name="travel_rate_per_km"
                                type="number"
                                min="0"
                                step="0.50"
                                value={formData.travel_rate_per_km}
                                onChange={handleChange}
                                placeholder="e.g., 2.00"
                              />
                            </div>
                          </div>
                          {formData.travel_radius && (
                            <p className="text-xs text-primary mt-2">
                              💡 Max travel fee: ${(Number(formData.travel_radius) * Number(formData.travel_rate_per_km || 0)).toFixed(2)} for {formData.travel_radius} km
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label htmlFor="experience" className="mb-2 block text-sm font-medium text-foreground">
                          Teaching Experience
                        </label>
                        <Input
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          placeholder="e.g., 5 years"
                        />
                      </div>

                      {/* Availability */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          <Clock className="mr-1 inline-block h-4 w-4" />
                          Availability
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availabilityOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleAvailability(time)}
                              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                formData.availability.includes(time)
                                  ? "border-secondary bg-secondary text-secondary-foreground"
                                  : "border-border bg-card text-foreground hover:border-secondary"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Free Trial */}
                      <div className="space-y-4 rounded-lg border p-4 bg-muted/20 mt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-foreground">Offer Free Trial</label>
                            <p className="text-xs text-muted-foreground">
                              Allow students to book a short, free trial lesson to see if you're a good fit.
                            </p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              name="offers_trial"
                              className="peer sr-only"
                              checked={formData.offers_trial}
                              onChange={handleToggle}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700"></div>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileEdit;