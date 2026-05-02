import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Tutors from "./pages/Tutors";
import TutorProfile from "./pages/TutorProfile";
import BecomeTutor from "./pages/BecomeTutor";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ParentDashboard from "./pages/ParentDashboard";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import MapView from "./pages/MapView";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import i18n from "./i18n";

const queryClient = new QueryClient();

// Get language from URL
const getLangFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/(en|tr|it|sp)(\/|$)/);
  return match ? match[1] : null;
};

let urlLang = getLangFromUrl();

if (!urlLang) {
  // Redirect to /en by default if no language prefix is found
  const newPath = `/en${window.location.pathname === '/' ? '' : window.location.pathname}${window.location.search}`;
  window.location.replace(newPath);
} else if (i18n.language !== urlLang) {
  i18n.changeLanguage(urlLang);
}

const App = () => {
  if (!urlLang) return null; // Wait for redirect

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={`/${urlLang}`}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tutors" element={<Tutors />} />
                <Route path="/tutors/:id" element={<TutorProfile />} />
                <Route path="/become-tutor" element={<BecomeTutor />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/parent-dashboard" element={<ParentDashboard />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
