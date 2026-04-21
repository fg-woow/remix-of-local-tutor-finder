/**
 * Supabase API Service Layer
 * 
 * Centralized data access layer for all Supabase operations.
 * Provides typed functions for profiles, reviews, and bookings.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// ==========================================
// Type Aliases
// ==========================================
export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;
export type Review = Tables<"reviews">;
export type ReviewInsert = TablesInsert<"reviews">;
export type Booking = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;
export type BookingUpdate = TablesUpdate<"bookings">;
export type UserRole = Tables<"user_roles">;

// ==========================================
// Profile API
// ==========================================

/** Fetch a single profile by user_id */
export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

/** Fetch the current user's role */
export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

/** Update a profile by user_id */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();
  return { data, error };
}

/** Fetch all tutor profiles */
export async function getTutorProfiles() {
  // First get all user IDs that are tutors
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "tutor");
    
  if (roleError || !roleData) return { data: [], error: roleError };
  
  const tutorIds = roleData.map(r => r.user_id);
  
  // Then fetch their profiles
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", tutorIds);

  return { data: data || [], error };
}

/** Fetch a tutor profile by user_id (public view) */
export async function getTutorProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

// ==========================================
// Reviews API
// ==========================================

/** Fetch all reviews for a tutor */
export async function getReviewsByTutorId(tutorId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("tutor_id", tutorId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

/** Submit a new review */
export async function createReview(review: ReviewInsert) {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();
  return { data, error };
}

/** Delete a review */
export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);
  return { error };
}

/** Get average rating and count for a tutor */
export async function getTutorRatingStats(tutorId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("tutor_id", tutorId);

  if (error || !data || data.length === 0) {
    return { averageRating: 0, reviewCount: 0, error };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / data.length) * 10) / 10,
    reviewCount: data.length,
    error: null,
  };
}

// ==========================================
// Bookings API
// ==========================================

/** Create a new booking */
export async function createBooking(booking: BookingInsert) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();
  return { data, error };
}

/** Get bookings for the current user (student or tutor) */
export async function getMyBookings(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
    .order("booking_date", { ascending: true });
  return { data: data || [], error };
}

/** Get bookings for a tutor on a specific date (to check availability) */
export async function getTutorBookingsForDate(tutorId: string, date: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("time_slot, status")
    .eq("tutor_id", tutorId)
    .eq("booking_date", date)
    .neq("status", "cancelled");
  return { data: data || [], error };
}

/** Cancel a booking (update status) */
export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select()
    .single();
  return { data, error };
}

/** Mark a booking as completed */
export async function completeBooking(bookingId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .select()
    .single();
  return { data, error };
}

// ==========================================
// Auth Helpers
// ==========================================

/** Sign up a new user with Supabase Auth */
export async function signUpUser(
  email: string,
  password: string,
  fullName: string,
  role: "student" | "tutor"
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });
  return { data, error };
}

/** Sign in a user with email/password */
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/** Sign out the current user */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/** Get the current session */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data: data.session, error };
}

/** Listen for auth state changes */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// ==========================================
// Favorites API
// ==========================================

/** Get user's favorite tutors */
export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

/** Toggle favorite (add/remove) */
export async function toggleFavorite(userId: string, tutorId: string) {
  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("tutor_id", tutorId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    return { isFavorited: false, error };
  } else {
    // Add
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, tutor_id: tutorId });
    return { isFavorited: true, error };
  }
}

/** Check if a tutor is favorited */
export async function isFavorited(userId: string, tutorId: string) {
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("tutor_id", tutorId)
    .maybeSingle();
  return !!data;
}

/** Get favorite tutor profiles */
export async function getFavoriteTutorProfiles(userId: string) {
  const { data: favs } = await getFavorites(userId);
  if (!favs || favs.length === 0) return { data: [], error: null };

  const tutorIds = favs.map((f: any) => f.tutor_id);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", tutorIds);
  return { data: data || [], error };
}

// ==========================================
// Notifications API
// ==========================================

/** Get user notifications */
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return { data: data || [], error };
}

/** Get unread notification count */
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return { count: count || 0, error };
}

/** Mark notification as read */
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  return { error };
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return { error };
}

/** Create a notification */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string = "info",
  link?: string
) {
  const { error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, title, message, type, link });
  return { error };
}

// ==========================================
// Messages API
// ==========================================

/** Get conversations (unique contacts) */
export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !data) return { data: [], error };

  // Group by conversation partner
  const conversationMap = new Map<string, any>();
  data.forEach((msg: any) => {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        lastMessage: msg,
        unreadCount: msg.receiver_id === userId && !msg.is_read ? 1 : 0,
      });
    } else if (msg.receiver_id === userId && !msg.is_read) {
      const conv = conversationMap.get(partnerId);
      conv.unreadCount++;
    }
  });

  return { data: Array.from(conversationMap.values()), error: null };
}

/** Get messages between two users */
export async function getMessagesBetween(userId: string, partnerId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });
  return { data: data || [], error };
}

/** Send a message */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single();
  return { data, error };
}

/** Mark messages as read */
export async function markMessagesAsRead(
  userId: string,
  senderId: string
) {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", senderId)
    .eq("is_read", false);
  return { error };
}

// ==========================================
// Parent Dashboard API
// ==========================================

/** Link a child to a parent */
export async function linkChild(parentId: string, childEmail: string) {
  // Check if the child account exists
  const { data: childProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", childEmail)
    .maybeSingle();

  const { data, error } = await supabase
    .from("parent_children")
    .insert({
      parent_id: parentId,
      child_email: childEmail,
      child_id: childProfile?.user_id || null,
      status: childProfile ? "linked" : "pending",
    })
    .select()
    .single();
  return { data, error };
}

/** Get parent's linked children */
export async function getParentChildren(parentId: string) {
  const { data, error } = await supabase
    .from("parent_children")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

/** Remove a linked child */
export async function unlinkChild(linkId: string) {
  const { error } = await supabase
    .from("parent_children")
    .delete()
    .eq("id", linkId);
  return { error };
}

/** Get child's bookings (for parent dashboard) */
export async function getChildBookings(childId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("student_id", childId)
    .order("booking_date", { ascending: true });
  return { data: data || [], error };
}

/** Get child's profile */
export async function getChildProfile(childId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", childId)
    .maybeSingle();
  return { data, error };
}
