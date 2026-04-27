export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  location: string;
  bio: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: string[];
  experience: string;
  createdAt?: string;
  studentLevel?: string[];
  reviews?: Review[];
  offersTrial?: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number; // distance in km from user
}

export const studentLevels = [
  "Primary School",
  "Middle School",
  "High School",
  "University",
  "Adult Learner",
];

export const priceRanges = [
  { label: "Under $30/hr", min: 0, max: 30 },
  { label: "$30-50/hr", min: 30, max: 50 },
  { label: "$50-75/hr", min: 50, max: 75 },
  { label: "Over $75/hr", min: 75, max: 999 },
];

export const mockTutors: Tutor[] = [
  {
    id: "00000001-0000-0000-0000-000000000000",
    name: "Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    subjects: ["Mathematics", "Physics"],
    location: "Kadıköy, Istanbul",
    bio: "Passionate math teacher with 8 years of experience helping students excel. I specialize in making complex concepts simple and engaging.",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 45,
    availability: ["Weekdays", "Evenings"],
    experience: "8 years",
    studentLevel: ["High School", "University"],
    reviews: [
      {
        id: "r1",
        studentName: "Alice Johnson",
        rating: 5,
        comment: "Sarah is an amazing tutor! She helped me pass my Calculus exam with flying colors.",
        date: "2024-03-10"
      },
      {
        id: "r2",
        studentName: "Mike Peters",
        rating: 5,
        comment: "Very patient and clear explanations. Highly recommended.",
        date: "2024-02-15"
      }
    ]
  },
  {
    id: "00000002-0000-0000-0000-000000000000",
    name: "David Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    subjects: ["Chemistry", "Biology"],
    location: "Beşiktaş, Istanbul",
    bio: "Former research scientist turned educator. I bring real-world applications to every lesson to make science come alive.",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 50,
    availability: ["Weekends", "Mornings"],
    experience: "6 years",
    studentLevel: ["High School", "University"],
    reviews: [
      {
        id: "r3",
        studentName: "Tom Wilson",
        rating: 5,
        comment: "Great chemistry tutor. I finally understand organic chemistry.",
        date: "2024-01-20"
      }
    ]
  },
  {
    id: "00000003-0000-0000-0000-000000000000",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    subjects: ["English", "Literature", "Writing"],
    location: "Şişli, Istanbul",
    bio: "Published author and English teacher. I help students find their voice and develop strong communication skills.",
    rating: 5.0,
    reviewCount: 156,
    hourlyRate: 40,
    availability: ["Flexible"],
    experience: "10 years",
    studentLevel: ["Middle School", "High School", "University"],
    reviews: [
      {
        id: "r4",
        studentName: "Sarah Kim",
        rating: 5,
        comment: "Emily transformed my essay writing skills completely. A true mentor.",
        date: "2024-03-01"
      },
      {
        id: "r5",
        studentName: "Jake Morrison",
        rating: 5,
        comment: "Best English tutor I've ever had. Really engaging lessons.",
        date: "2024-02-10"
      }
    ]
  },
  {
    id: "00000004-0000-0000-0000-000000000000",
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    subjects: ["Computer Science", "Programming"],
    location: "Üsküdar, Istanbul",
    bio: "Software engineer at a top tech company. I teach coding fundamentals to advanced algorithms with hands-on projects.",
    rating: 4.9,
    reviewCount: 94,
    hourlyRate: 65,
    availability: ["Evenings", "Weekends"],
    experience: "5 years",
    studentLevel: ["High School", "University", "Adult Learner"],
    reviews: [
      {
        id: "r6",
        studentName: "Daniel Park",
        rating: 5,
        comment: "Marcus helped me land my first software engineering job. His mentorship was invaluable.",
        date: "2024-01-15"
      }
    ]
  },
  {
    id: "00000005-0000-0000-0000-000000000000",
    name: "Lisa Park",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    subjects: ["Korean", "Japanese"],
    location: "Fatih, Istanbul",
    bio: "Native Korean speaker with Japanese fluency. I make language learning fun through cultural immersion and conversation practice.",
    rating: 4.7,
    reviewCount: 72,
    hourlyRate: 35,
    availability: ["Weekdays", "Mornings"],
    experience: "4 years",
    studentLevel: ["High School", "University", "Adult Learner"],
    reviews: [
      {
        id: "r7",
        studentName: "Emma Watson",
        rating: 4,
        comment: "Lisa's cultural approach to language learning is unique and effective.",
        date: "2024-02-20"
      }
    ]
  },
  {
    id: "00000006-0000-0000-0000-000000000000",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    subjects: ["History", "Geography"],
    location: "Beyoğlu, Istanbul",
    bio: "History professor with a knack for storytelling. I bring the past to life and help students understand how it shapes our present.",
    rating: 4.8,
    reviewCount: 63,
    hourlyRate: 42,
    availability: ["Afternoons", "Weekends"],
    experience: "12 years",
    studentLevel: ["Middle School", "High School", "University"],
    reviews: [
      {
        id: "r8",
        studentName: "Chris Adams",
        rating: 5,
        comment: "Professor Wilson makes history feel alive. Amazing storyteller.",
        date: "2024-03-05"
      }
    ]
  },
  {
    id: "00000007-0000-0000-0000-000000000000",
    name: "Aisha Patel",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    subjects: ["Mathematics", "Computer Science"],
    location: "Bakırköy, Istanbul",
    bio: "MIT graduate with a passion for teaching STEM. I specialize in preparing students for AP exams and college-level math courses.",
    rating: 4.9,
    reviewCount: 112,
    hourlyRate: 55,
    availability: ["Weekdays", "Evenings"],
    experience: "7 years",
    studentLevel: ["High School", "University"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [
      {
        id: "r9",
        studentName: "Lily Chen",
        rating: 5,
        comment: "Aisha helped me ace my AP Calculus exam. Incredible tutor!",
        date: "2024-03-12"
      },
      {
        id: "r10",
        studentName: "Ryan Brooks",
        rating: 5,
        comment: "Her teaching method is so clear and structured. Highly recommend.",
        date: "2024-02-28"
      }
    ]
  },
  {
    id: "00000008-0000-0000-0000-000000000000",
    name: "Carlos Mendez",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    subjects: ["Spanish", "French"],
    location: "Maltepe, Istanbul",
    bio: "Trilingual language specialist from Barcelona. I use immersive conversation-based teaching methods to get you fluent fast.",
    rating: 4.6,
    reviewCount: 48,
    hourlyRate: 38,
    availability: ["Mornings", "Afternoons", "Weekdays"],
    experience: "3 years",
    studentLevel: ["Middle School", "High School", "Adult Learner"],
    reviews: [
      {
        id: "r11",
        studentName: "Olivia Green",
        rating: 5,
        comment: "Carlos is an incredible Spanish tutor. I went from beginner to conversational in 4 months.",
        date: "2024-01-25"
      }
    ]
  },
  {
    id: "00000009-0000-0000-0000-000000000000",
    name: "Dr. Rachel Kim",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    subjects: ["Biology", "Chemistry"],
    location: "Sarıyer, Istanbul",
    bio: "Medical doctor and biology professor. I turn complex scientific concepts into intuitive, memorable lessons with clinical examples.",
    rating: 5.0,
    reviewCount: 201,
    hourlyRate: 80,
    availability: ["Weekends", "Evenings"],
    experience: "15 years",
    studentLevel: ["University", "Adult Learner"],
    reviews: [
      {
        id: "r12",
        studentName: "Jessica Liu",
        rating: 5,
        comment: "Dr. Kim's biology lessons are phenomenal. She really knows how to explain complex topics.",
        date: "2024-03-08"
      },
      {
        id: "r13",
        studentName: "Mark Thompson",
        rating: 5,
        comment: "Best tutor I've ever worked with. Worth every penny.",
        date: "2024-02-22"
      }
    ]
  },
  {
    id: "00000010-0000-0000-0000-000000000000",
    name: "Oliver Thompson",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
    subjects: ["Music", "Art"],
    location: "Ataşehir, Istanbul",
    bio: "Professional musician and visual artist. I nurture creative expression through personalized lessons in piano, guitar, and mixed media art.",
    rating: 4.5,
    reviewCount: 34,
    hourlyRate: 30,
    availability: ["Flexible"],
    experience: "9 years",
    studentLevel: ["Primary School", "Middle School", "High School", "Adult Learner"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [
      {
        id: "r14",
        studentName: "Amy Foster",
        rating: 5,
        comment: "Oliver is an amazing music teacher. My daughter loves her piano lessons!",
        date: "2024-03-11"
      }
    ]
  },
  {
    id: "00000011-0000-0000-0000-000000000000",
    name: "Natalie Foster",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    subjects: ["Physics", "Mathematics"],
    location: "Ümraniye, Istanbul",
    bio: "PhD in Theoretical Physics from Columbia. I transform abstract physics into visual, intuitive concepts using simulations and real-world demos.",
    rating: 4.8,
    reviewCount: 78,
    hourlyRate: 70,
    availability: ["Weekdays", "Mornings"],
    experience: "6 years",
    studentLevel: ["High School", "University"],
    reviews: [
      {
        id: "r15",
        studentName: "Victor Nguyen",
        rating: 5,
        comment: "Natalie makes physics fascinating. She uses visuals that really help understanding.",
        date: "2024-03-06"
      }
    ]
  },
  {
    id: "00000012-0000-0000-0000-000000000000",
    name: "Tyler Brooks",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    subjects: ["Programming", "Computer Science"],
    location: "Kartal, Istanbul",
    bio: "Full-stack developer and coding bootcamp instructor. I teach Python, JavaScript, React, and help beginners build their first apps from scratch.",
    rating: 4.7,
    reviewCount: 56,
    hourlyRate: 60,
    availability: ["Evenings", "Weekends"],
    experience: "4 years",
    studentLevel: ["University", "Adult Learner"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [
      {
        id: "r16",
        studentName: "Hannah Lee",
        rating: 5,
        comment: "Tyler taught me React from zero. I built my portfolio site in 3 weeks!",
        date: "2024-03-09"
      },
      {
        id: "r17",
        studentName: "Sam Rodriguez",
        rating: 4,
        comment: "Great coding tutor. Very patient with beginners.",
        date: "2024-02-18"
      }
    ]
  },
];

export const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Literature",
  "Writing",
  "Computer Science",
  "Programming",
  "History",
  "Geography",
  "Korean",
  "Japanese",
  "Spanish",
  "French",
  "Music",
  "Art",
  "YKS Hazırlık",
  "LGS Hazırlık",
  "TYT/AYT",
  "DGS"
];

export const locations = [
  "Manhattan, NY",
  "Brooklyn, NY",
  "Queens, NY",
  "San Francisco, CA",
  "Los Angeles, CA",
  "Chicago, IL",
  "Boston, MA",
  "Seattle, WA"
];

export const availabilityOptions = [
  "Weekdays",
  "Weekends",
  "Mornings",
  "Afternoons",
  "Evenings",
  "Flexible"
];
