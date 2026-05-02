import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, User, GraduationCap, Users, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["student", "tutor", "parent"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  if (score === 4) return { score: 4, label: "Strong", color: "bg-emerald-500" };
  return { score: 5, label: "Very Strong", color: "bg-green-600" };
};

const Signup = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "tutor" | "parent",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user } = useAuth();

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  // Redirect if already logged in
  if (user) {
    navigate("/profile");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!acceptTerms) {
      setErrors({ terms: "You must accept the terms and conditions" });
      return;
    }

    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.role
    );

    if (error) {
      let message = "An error occurred during signup.";
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please log in instead.";
      } else if (error.message.includes("password")) {
        message = "Password is too weak. Please use a stronger password.";
      }
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Account created!",
      description: formData.role === "tutor" 
        ? "Welcome to Learnnear! Complete your tutor profile to start teaching."
        : formData.role === "parent"
        ? "Welcome to Learnnear! Set up your parent dashboard to manage your child's education."
        : "Welcome to Learnnear! Start exploring tutors.",
    });
    navigate(formData.role === "parent" ? "/parent-dashboard" : "/profile");
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Learnnear</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("signup.title", { defaultValue: "Create an account" })}</CardTitle>
            <CardDescription>
              {t("signup.subtitle", { defaultValue: "Join Learnnear to find or become a tutor" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  I want to...
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "student" })}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.role === "student"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <GraduationCap className={`h-6 w-6 ${formData.role === "student" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${formData.role === "student" ? "text-primary" : "text-foreground"}`}>
                      {t("signup.student_desc", { defaultValue: "Find a tutor" })}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "tutor" })}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.role === "tutor"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Users className={`h-6 w-6 ${formData.role === "tutor" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${formData.role === "tutor" ? "text-primary" : "text-foreground"}`}>
                      {t("signup.tutor_desc", { defaultValue: "Become a tutor" })}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "parent" })}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.role === "parent"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${formData.role === "parent" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${formData.role === "parent" ? "text-primary" : "text-foreground"}`}>
                      {t("signup.parent_role", { defaultValue: "I'm a parent" })}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                  {t("signup.full_name", { defaultValue: "Full Name" })}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="pl-10"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  {t("signup.email", { defaultValue: "Email" })}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                  {t("signup.password", { defaultValue: "Password" })}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                )}
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1 text-xs font-medium ${
                      passwordStrength.score <= 1 ? "text-red-500" :
                      passwordStrength.score === 2 ? "text-orange-500" :
                      passwordStrength.score === 3 ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => {
                    setAcceptTerms(checked as boolean);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: "" });
                    }
                  }}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="accept-terms" className="text-sm cursor-pointer text-muted-foreground leading-snug">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => {}}
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => {}}
                    >
                      Privacy Policy
                    </button>
                  </Label>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-destructive">{errors.terms}</p>
                  )}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : t("signup.create_account", { defaultValue: "Sign up" })}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("signup.already_have_account", { defaultValue: "Already have an account?" })}{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                {t("signup.login", { defaultValue: "Log in" })}
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
