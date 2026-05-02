import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subjects, locations } from "@/data/tutors";
import { useTranslation } from "react-i18next";

const SearchBar = () => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const navigate = useNavigate();

  const filteredSubjects = subjects.filter((s) =>
    s.toLowerCase().includes(subject.toLowerCase())
  );

  const filteredLocations = locations.filter((l) =>
    l.toLowerCase().includes(location.toLowerCase())
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (location) params.set("location", location);
    navigate(`/tutors?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-xl sm:flex-row sm:items-center sm:p-2">
        {/* Subject Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={t("hero.search_placeholder", { defaultValue: "What do you want to learn?" })}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onFocus={() => setShowSubjectSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
            className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
          />
          {showSubjectSuggestions && filteredSubjects.length > 0 && subject && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border bg-card p-2 shadow-lg">
              {filteredSubjects.slice(0, 5).map((s) => (
                <button
                  key={s}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  onMouseDown={() => setSubject(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        {/* Location Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
          />
          {showLocationSuggestions && filteredLocations.length > 0 && location && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border bg-card p-2 shadow-lg">
              {filteredLocations.slice(0, 5).map((l) => (
                <button
                  key={l}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  onMouseDown={() => setLocation(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button variant="hero" size="lg" onClick={handleSearch} className="sm:w-auto">
          <Search className="h-4 w-4" />
          <span>{t("hero.search_button", { defaultValue: "Search" })}</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
