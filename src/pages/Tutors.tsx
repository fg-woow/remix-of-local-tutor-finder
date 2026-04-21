import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, X, ArrowUpDown, Star, DollarSign, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TutorCard from "@/components/TutorCard";
import TutorCardSkeleton from "@/components/TutorCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { mockTutors, subjects, studentLevels, priceRanges, availabilityOptions } from "@/data/tutors";
import { getTutorProfiles } from "@/lib/api";
import type { Profile } from "@/lib/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistanceKm, CITY_COORDINATES } from "@/lib/geolocation";

type SortOption = "rating" | "price-low" | "price-high" | "newest" | "location" | "most-reviewed";

const Tutors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get("subject") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [selectedStudentLevels, setSelectedStudentLevels] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dbTutors, setDbTutors] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const { userLocation } = useUserLocation();

  useEffect(() => {
    const fetchTutors = async () => {
      const { data, error } = await getTutorProfiles();

      if (!error && data) {
        setDbTutors(data);
      }
      setIsLoading(false);
    };

    fetchTutors();
  }, []);

  // Simulate loading delay when filters change
  const triggerFilterLoading = useCallback(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Combine DB tutors with mock tutors (DB takes priority, deduplicate by user_id)
  const allTutors = useMemo(() => {
    const dbIds = new Set(dbTutors.map((t) => t.user_id));

    const dbTutorCards = dbTutors.map((t) => {
      let distance: number | undefined;
      if (userLocation) {
        const tutorCoords = t.latitude && t.longitude
          ? { latitude: t.latitude, longitude: t.longitude }
          : CITY_COORDINATES[t.location || ""];
        if (tutorCoords) {
          distance = calculateDistanceKm(userLocation, tutorCoords);
        }
      }

      return {
        id: t.user_id,
        name: t.full_name,
        avatar: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name)}&background=0d9488&color=fff`,
        subjects: t.subjects || [],
        location: t.location || "Location not set",
        bio: t.bio || "No bio yet",
        rating: 5.0,
        reviewCount: 0,
        hourlyRate: t.hourly_rate || 0,
        availability: t.availability || [],
        experience: t.experience || "New tutor",
        createdAt: t.created_at,
        studentLevel: t.teaching_levels || ([] as string[]),
        offersTrial: t.offers_trial || false,
        latitude: t.latitude ?? undefined,
        longitude: t.longitude ?? undefined,
        distance,
      };
    });

    // Only include mock tutors whose IDs are NOT already in the DB
    const mockWithDates = mockTutors
      .filter((t) => !dbIds.has(t.id))
      .map((t) => {
        let distance: number | undefined;
        if (userLocation) {
          const tutorCoords = CITY_COORDINATES[t.location];
          if (tutorCoords) {
            distance = calculateDistanceKm(userLocation, tutorCoords);
          }
        }
        return {
          ...t,
          createdAt: t.createdAt || undefined,
          studentLevel: t.studentLevel || ["High School", "University"] as string[],
          distance,
        };
      });

    return [...dbTutorCards, ...mockWithDates];
  }, [dbTutors, userLocation]);

  const filteredAndSortedTutors = useMemo(() => {
    let result = allTutors.filter((tutor) => {
      const matchesSubject = !subjectFilter ||
        tutor.subjects.some((s) =>
          s.toLowerCase().includes(subjectFilter.toLowerCase())
        );
      const matchesLocation = !locationFilter ||
        tutor.location.toLowerCase().includes(locationFilter.toLowerCase());

      // Price range filter
      let matchesPrice = true;
      if (selectedPriceRange.length > 0) {
        matchesPrice = selectedPriceRange.some((rangeLabel) => {
          const range = priceRanges.find((r) => r.label === rangeLabel);
          if (!range) return false;
          return tutor.hourlyRate >= range.min && tutor.hourlyRate < range.max;
        });
      }

      // Student level filter
      let matchesLevel = true;
      if (selectedStudentLevels.length > 0) {
        matchesLevel = selectedStudentLevels.some((level) =>
          tutor.studentLevel?.includes(level)
        );
      }

      // Availability filter
      let matchesAvailability = true;
      if (selectedAvailability.length > 0) {
        matchesAvailability = selectedAvailability.some((option) =>
          tutor.availability?.includes(option)
        );
      }

      return matchesSubject && matchesLocation && matchesPrice && matchesLevel && matchesAvailability;
    });

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "price-high":
        result.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case "newest":
        result.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case "most-reviewed":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "location":
        result.sort((a, b) => {
          const distA = a.distance ?? Infinity;
          const distB = b.distance ?? Infinity;
          if (distA !== distB) return distA - distB;
          return a.location.localeCompare(b.location);
        });
        break;
    }

    return result;
  }, [allTutors, subjectFilter, locationFilter, sortBy, selectedPriceRange, selectedStudentLevels, selectedAvailability]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (subjectFilter) params.set("subject", subjectFilter);
    if (locationFilter) params.set("location", locationFilter);
    setSearchParams(params);
    triggerFilterLoading();
  };

  const clearFilters = () => {
    setSubjectFilter("");
    setLocationFilter("");
    setSelectedPriceRange([]);
    setSelectedStudentLevels([]);
    setSelectedAvailability([]);
    setSearchParams({});
    triggerFilterLoading();
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
    triggerFilterLoading();
  };

  const toggleStudentLevel = (level: string) => {
    setSelectedStudentLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    triggerFilterLoading();
  };

  const toggleAvailability = (option: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
    triggerFilterLoading();
  };

  const handleSortChange = (val: string) => {
    setSortBy(val as SortOption);
    triggerFilterLoading();
  };

  const hasFilters = subjectFilter || locationFilter || selectedPriceRange.length > 0 || selectedStudentLevels.length > 0 || selectedAvailability.length > 0;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="mb-3 font-semibold text-foreground">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.label} className="flex items-center space-x-2">
              <Checkbox
                id={range.label}
                checked={selectedPriceRange.includes(range.label)}
                onCheckedChange={() => togglePriceRange(range.label)}
              />
              <Label htmlFor={range.label} className="text-sm cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Student Level */}
      <div>
        <h4 className="mb-3 font-semibold text-foreground">Student Level</h4>
        <div className="space-y-2">
          {studentLevels.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={level}
                checked={selectedStudentLevels.includes(level)}
                onCheckedChange={() => toggleStudentLevel(level)}
              />
              <Label htmlFor={level} className="text-sm cursor-pointer">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="mb-3 font-semibold text-foreground">Availability</h4>
        <div className="space-y-2">
          {availabilityOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={selectedAvailability.includes(option)}
                onCheckedChange={() => toggleAvailability(option)}
              />
              <Label htmlFor={option} className="text-sm cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  const showSkeletons = isLoading || isFiltering;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <section className="border-b bg-card py-8">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="mb-2 text-3xl font-bold text-foreground">Find Tutors</h1>
              <p className="text-muted-foreground">
                Browse our network of qualified local tutors
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by subject..."
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="relative">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Filters</span>
                      {(selectedPriceRange.length > 0 || selectedStudentLevels.length > 0 || selectedAvailability.length > 0) && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                          {selectedPriceRange.length + selectedStudentLevels.length + selectedAvailability.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {subjectFilter && (
                  <Badge variant="subject" className="gap-1">
                    {subjectFilter}
                    <button onClick={() => setSubjectFilter("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {locationFilter && (
                  <Badge variant="location" className="gap-1">
                    {locationFilter}
                    <button onClick={() => setLocationFilter("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedPriceRange.map((range) => (
                  <Badge key={range} variant="outline" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    {range}
                    <button onClick={() => togglePriceRange(range)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedStudentLevels.map((level) => (
                  <Badge key={level} variant="level" className="gap-1">
                    {level}
                    <button onClick={() => toggleStudentLevel(level)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Quick Subject Filters */}
        <section className="border-b bg-card/50 py-4">
          <div className="container">
            <div className="flex flex-wrap gap-2">
              {subjects.slice(0, 8).map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    setSubjectFilter(subject);
                    triggerFilterLoading();
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105 ${subjectFilter === subject
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                    }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-muted-foreground">
                {isLoading ? (
                  "Loading tutors..."
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{filteredAndSortedTutors.length}</span>{" "}
                    tutors found
                  </>
                )}
              </p>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Highest Rated
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price: Low to High
                      </div>
                    </SelectItem>
                    <SelectItem value="price-high">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price: High to Low
                      </div>
                    </SelectItem>
                    <SelectItem value="most-reviewed">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Most Reviewed
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="location">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Nearest First
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading Progress Bar */}
            <AnimatePresence>
              {isFiltering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="mt-2 text-center text-sm text-muted-foreground animate-pulse">
                    Filtering results...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {showSkeletons ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <TutorCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredAndSortedTutors.length > 0 ? (
              <motion.div
                initial="initial"
                animate="animate"
                variants={{
                  animate: {
                    transition: { staggerChildren: 0.1 },
                  },
                }}
                className="grid gap-6 md:grid-cols-2"
              >
                {filteredAndSortedTutors.map((tutor) => (
                  <motion.div key={tutor.id} variants={fadeInUp}>
                    <TutorCard tutor={tutor} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border bg-card px-6 py-16 text-center shadow-sm"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-md">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">No tutors match your search</h3>
                <p className="mx-auto mb-2 max-w-md text-muted-foreground">
                  We couldn't find any tutors matching your current filters. Here are some things you can try:
                </p>
                <ul className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground space-y-1">
                  <li>• Broaden your subject or location search</li>
                  <li>• Remove some filters to see more results</li>
                  <li>• Check for typos in your search terms</li>
                </ul>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={clearFilters} size="lg">
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => { clearFilters(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    Browse All Tutors
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Tutors;