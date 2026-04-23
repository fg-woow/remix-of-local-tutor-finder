import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProfileByUserId, getUserRole, updateProfile as apiUpdateProfile } from "@/lib/api";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/api";

type UserRole = "student" | "tutor" | "parent";

export interface UserProfile extends Profile {
  role?: UserRole;
}

interface AuthContextType {
  /** The Supabase Auth user object (null if logged out) */
  user: User | null;
  /** The user's profile from the `profiles` table */
  profile: UserProfile | null;
  /** The user's role ('student' or 'tutor') */
  role: UserRole | null;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Sign up a new user */
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  /** Sign in with email/password */
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Update the current user's profile */
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  /** Force re-fetch the profile from the database */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch profile and role for a given user ID */
  const fetchProfileAndRole = async (userId: string) => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        getProfileByUserId(userId),
        getUserRole(userId),
      ]);

      const userRole = (roleResult.data?.role as UserRole) || null;
      setRole(userRole);

      if (profileResult.data) {
        setProfile({ ...profileResult.data, role: userRole ?? undefined });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
      setRole(null);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // First, get the current session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfileAndRole(session.user.id);
      }
      setIsLoading(false);
    };

    initAuth();

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          // Use setTimeout to avoid potential deadlock with Supabase realtime
          setTimeout(() => fetchProfileAndRole(session.user.id), 0);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setRole(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(session.user);
        } else if (event === "USER_UPDATED" && session?.user) {
          setUser(session.user);
          setTimeout(() => fetchProfileAndRole(session.user.id), 0);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userRole: UserRole
  ): Promise<{ error: Error | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: userRole,
        },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    // If signup is successful and user is auto-confirmed,
    // the onAuthStateChange listener will pick it up.
    // If email confirmation is required, we inform the user.
    if (data.user && !data.session) {
      return { error: new Error("Please check your email to confirm your account before logging in.") };
    }

    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await apiUpdateProfile(user.id, updates);

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data) {
      setProfile({ ...data, role: role ?? undefined });
    }

    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRole(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
