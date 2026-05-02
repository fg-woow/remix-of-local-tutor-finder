import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, MapPin, Clock, CheckCircle } from "lucide-react";
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
                  Face-to-face learning made easy
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
                    <span>{t("features.flexible")}</span>
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
                How Learnnear works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Finding the right tutor has never been easier. Just three simple steps.
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
                  title: "Browse Tutors",
                  description: "Search by subject and location to find qualified tutors in your area.",
                },
                {
                  icon: MapPin,
                  title: "View Profiles",
                  description: "Check ratings, reviews, experience, and teaching style before you decide.",
                },
                {
                  icon: Clock,
                  title: "Start Learning",
                  description: "Contact your chosen tutor and schedule your first face-to-face lesson.",
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
                  Featured Tutors
                </h2>
                <p className="text-lg text-muted-foreground">
                  Highly rated instructors ready to help you succeed
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/tutors">
                  View all tutors
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
                Ready to start learning?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                Join thousands of students who found their perfect tutor on Learnnear. 
                Start your learning journey today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="secondary" size="xl" asChild>
                  <Link to="/tutors">Find a Tutor</Link>
                </Button>
                <Button
                  variant="hero-outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground hover:text-primary-foreground"
                  asChild
                >
                  <Link to="/become-tutor">Become a Tutor</Link>
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
