import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut, Menu, X, Edit, Heart, MessageSquare, LayoutDashboard, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "react-i18next";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, profile, role, signOut, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(en|tr|it|sp)/, '') || '/';
    window.location.href = `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang}${window.location.search}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link
        to="/tutors"
        onClick={onClick}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("nav.tutors", { defaultValue: "Find Tutors" })}
      </Link>
      <Link
        to="/map"
        onClick={onClick}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
      >
        Map View
      </Link>
      {!user && (
        <Link
          to="/signup"
          onClick={onClick}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Become a Tutor
        </Link>
      )}
      {user && role === "parent" && (
        <Link
          to="/parent-dashboard"
          onClick={onClick}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
      )}
      {user && (
        <Link
          to="/profile"
          onClick={onClick}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          My Profile
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Learnnear</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          {/* Toggles for Theme and Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Language"
                className="hidden md:flex"
              >
                <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English (EN)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('tr')}>Türkçe (TR)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('it')}>Italiano (IT)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('sp')}>Español (SP)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
            className="hidden md:flex"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
            {/* Notification Bell */}
            <NotificationBell />

            {/* Messages */}
            <Link
              to="/messages"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors hidden md:flex"
              title="Messages"
            >
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </Link>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors hidden md:flex"
              title="Favorites"
            >
              <Heart className="h-5 w-5 text-muted-foreground" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">{role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/edit" className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                {role === "parent" && (
                  <DropdownMenuItem asChild>
                    <Link to="/parent-dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Parent Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                <Link to="/login">{t("nav.login", { defaultValue: "Login" })}</Link>
              </Button>
              <Button size="sm" asChild className="hidden md:inline-flex">
                <Link to="/signup">{t("nav.signup", { defaultValue: "Sign Up" })}</Link>
              </Button>
            </>
          )}

          {/* Mobile Hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <BookOpen className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Learnnear
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Language"
                      >
                        <Globe className="h-[1.2rem] w-[1.2rem]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English (EN)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLanguageChange('tr')}>Türkçe (TR)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLanguageChange('it')}>Italiano (IT)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLanguageChange('sp')}>Español (SP)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    title="Toggle Theme"
                  >
                    {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                  </Button>
                </div>
                <NavLinks onClick={() => setMobileOpen(false)} />
                {!user && (
                  <>
                    <hr className="my-2" />
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Log in
                    </Link>
                    <Button size="sm" asChild>
                      <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>
                    </Button>
                  </>
                )}
                {user && (
                  <>
                    <hr className="my-2" />
                    <Link
                      to="/favorites"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Link>
                    {role === "parent" && (
                      <Link
                        to="/parent-dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Parent Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile/edit"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <User className="h-4 w-4" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
