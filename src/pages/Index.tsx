import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, MapPin, Clock, CheckCircle, BarChart3, BookOpen, Target, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import TutorCard from "@/components/TutorCard";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { mockTutors } from "@/data/tutors";
import heroImage from "@/assets/hero-illustration.jpg";

const Index = () => {
  const { t } = useTranslation();
  const featuredTutors = mockTutors.slice(0, 3);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
          <div className="container">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <span className="mb-4 inline-block rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary-dark">
                  {t("hero.tagline", { defaultValue: "Face-to-face learning made easy" })}
                </span>
                <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                  {t("hero.subtitle")}
                </p>

                <SearchBar />

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{t("features.verified")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{t("features.local")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{t("hero.free_browse", { defaultValue: "Free to browse" })}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block"
              >
                <img
                  src={heroImage}
                  alt="Tutor and student learning together"
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                {t("how_it_works.title", { defaultValue: "How Learnnear works" })}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {t("how_it_works.subtitle", { defaultValue: "Finding the right tutor has never been easier. Just three simple steps." })}
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-3"
            >
              {[
                {
                  icon: Users,
                  title: t("how_it_works.step1_title", { defaultValue: "Browse Tutors" }),
                  description: t("how_it_works.step1_desc", { defaultValue: "Search by subject and location to find qualified tutors in your area." }),
                },
                {
                  icon: MapPin,
                  title: t("how_it_works.step2_title", { defaultValue: "View Profiles" }),
                  description: t("how_it_works.step2_desc", { defaultValue: "Check ratings, reviews, experience, and teaching style before you decide." }),
                },
                {
                  icon: Clock,
                  title: t("how_it_works.step3_title", { defaultValue: "Start Learning" }),
                  description: t("how_it_works.step3_desc", { defaultValue: "Contact your chosen tutor and schedule your first face-to-face lesson." }),
                },
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={fadeInUp}
                  className="group relative rounded-2xl border bg-card p-8 text-center hover-lift hover:shadow-glow"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent transition-colors group-hover:bg-primary-light">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Tutors */}
        <section className="bg-muted/50 py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row"
            >
              <div>
                <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                  {t("featured.title", { defaultValue: "Featured Tutors" })}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("featured.subtitle", { defaultValue: "Highly rated instructors ready to help you succeed" })}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/tutors">
                  {t("featured.view_all", { defaultValue: "View all tutors" })}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-6"
            >
              {featuredTutors.map((tutor) => (
                <motion.div key={tutor.id} variants={fadeInUp}>
                  <TutorCard tutor={tutor} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Seamless and Data-Driven Learning Journey */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <span className="mb-4 inline-block rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary-dark">
                Data-Driven Learning
              </span>
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                {t("learning_journey.title", { defaultValue: "Seamless Learning Journey" })}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {t("learning_journey.subtitle", { defaultValue: "Track every session, visualize progress, and make data-driven decisions for a better learning experience." })}
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  icon: BookOpen,
                  title: t("learning_journey.sessions_title", { defaultValue: "Session History" }),
                  description: t("learning_journey.sessions_desc", { defaultValue: "Complete log of all your past and upcoming sessions with tutors in one place." }),
                  color: "bg-blue-100 dark:bg-blue-900/30",
                  iconColor: "text-blue-600 dark:text-blue-400",
                },
                {
                  icon: BarChart3,
                  title: t("learning_journey.analytics_title", { defaultValue: "Progress Charts" }),
                  description: t("learning_journey.analytics_desc", { defaultValue: "Visualize your learning progress with interactive charts and performance metrics." }),
                  color: "bg-green-100 dark:bg-green-900/30",
                  iconColor: "text-green-600 dark:text-green-400",
                },
                {
                  icon: Target,
                  title: t("learning_journey.goals_title", { defaultValue: "Tutor Feedback" }),
                  description: t("learning_journey.goals_desc", { defaultValue: "Receive personalized feedback from tutors after each session to guide your study." }),
                  color: "bg-amber-100 dark:bg-amber-900/30",
                  iconColor: "text-amber-600 dark:text-amber-400",
                },
                {
                  icon: TrendingUp,
                  title: t("learning_journey.growth_title", { defaultValue: "Rewards & Badges" }),
                  description: t("learning_journey.growth_desc", { defaultValue: "Earn activity badges and unlock discounts as you complete more lessons." }),
                  color: "bg-purple-100 dark:bg-purple-900/30",
                  iconColor: "text-purple-600 dark:text-purple-400",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  className="group relative rounded-2xl border bg-card p-6 text-center hover-lift hover:shadow-glow transition-all"
                >
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} transition-colors`}>
                    <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 text-center"
            >
              <Button variant="outline" size="lg" asChild>
                <Link to="/bookings">
                  View Your Learning History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl bg-primary p-8 text-center md:p-16"
            >
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
                {t("cta.title", { defaultValue: "Ready to start learning?" })}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {t("cta.subtitle", { defaultValue: "Join thousands of students who found their perfect tutor on Learnnear. Start your learning journey today." })}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="secondary" size="xl" asChild>
                  <Link to="/tutors">{t("cta.find_tutor", { defaultValue: "Find a Tutor" })}</Link>
                </Button>
                <Button
                  variant="hero-outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground hover:text-primary-foreground"
                  asChild
                >
                  <Link to="/become-tutor">{t("cta.become_tutor", { defaultValue: "Become a Tutor" })}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
