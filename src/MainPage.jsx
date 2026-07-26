import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Layers3,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "FAQ", href: "#faq" },
  { label: "About Us", href: "#about" },
];

const featureItems = [
  {
    icon: Search,
    title: "Find notes fast",
    description:
      "Search curated PDFs, semester resources, and subject material without opening the full app.",
  },
  {
    icon: Layers3,
    title: "Semester-ready",
    description:
      "Organized collections keep class content clean, current, and easy to scan before login.",
  },
  {
    icon: MessageCircle,
    title: "Community flow",
    description:
      "Students can move from discovery to chat, sharing, and profile tools after signing in.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Browse public updates and see how Pixel Class works.",
    points: ["Public landing access", "Resource previews", "Community updates"],
  },
  {
    name: "Student",
    price: "Included",
    description: "Sign in to unlock downloads, uploads, and saved class flow.",
    points: ["PDF downloads", "Subject collections", "Peer discovery"],
  },
  {
    name: "Campus",
    price: "Custom",
    description: "A cleaner hub for class groups, batches, and shared material.",
    points: ["Shared resource hubs", "Class coordination", "Profile network"],
  },
];

const posts = [
  {
    tag: "Guide",
    title: "How to keep semester PDFs easy to find",
  },
  {
    tag: "Update",
    title: "A faster way to move from resources to classmates",
  },
  {
    tag: "Workflow",
    title: "Turning scattered notes into a reliable study system",
  },
];

const faqs = [
  {
    question: "Can visitors see this landing page without logging in?",
    answer:
      "Yes. The home route now renders this page directly, while study tools and user screens remain protected.",
  },
  {
    question: "Do I need an account to use the full app?",
    answer:
      "Yes. Login is still required for protected routes such as profiles, chat, and resource pages.",
  },
  {
    question: "What is Pixel Class built for?",
    answer:
      "Pixel Class is a student resource hub for finding notes, organizing subjects, and connecting with classmates.",
  },
];

const MainPage = () => {
  const [isCombinedNav, setIsCombinedNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsCombinedNav(window.scrollY >= 96);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="landing-page">
      <header
        className={`landing-header ${isCombinedNav ? "is-combined" : ""}`}
        aria-label="Pixel Class navigation"
      >
        <Link to="/" className="landing-logo" aria-label="Pixel Class home">
          <img
            src="./logo.png"
            alt="Pixel Class"
          />
        </Link>

        <nav className="landing-nav" aria-label="Landing sections">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <Link to="/auth/login" className="landing-login">
          Login
        </Link>
      </header>

      <nav className="landing-mobile-nav" aria-label="Landing sections">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <section id="home" className="landing-hero-shell">
        <div className="landing-hero">
          <div className="landing-wing landing-wing-left" aria-hidden="true" />
          <div className="landing-wing landing-wing-right" aria-hidden="true" />
          <div className="landing-lines landing-lines-top" aria-hidden="true" />
          <div className="landing-lines landing-lines-bottom" aria-hidden="true" />
          <div className="landing-circuit landing-circuit-left" aria-hidden="true" />
          <div className="landing-circuit landing-circuit-right" aria-hidden="true" />

          <div className="landing-hero-content">
            <a href="#pricing" className="landing-badge">
              Flexible plans for you
              <ArrowRight size={14} strokeWidth={2.4} />
            </a>

            <h1>Study resources in seconds, not hours</h1>

            <p>
              Pixel Class puts notes, subject materials, and student connections
              in one clean place so you can get to the right resource quickly.
            </p>

            <div className="landing-actions">
              <Link to="/auth/signup" className="landing-button landing-button-primary">
                Start learning
              </Link>
              <a href="#features" className="landing-button landing-button-secondary">
                View features
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section landing-preview">
        <div className="landing-section-heading">
          <span className="landing-kicker">
            <Sparkles size={15} />
            Features
          </span>
          <h2>A public front door for the study platform.</h2>
          <p>
            Visitors can understand what Pixel Class offers before signing in,
            then move into protected tools when they are ready.
          </p>
        </div>

        <div className="landing-feature-grid">
          {featureItems.map(({ icon: Icon, title, description }) => (
            <article key={title} className="landing-card">
              <span className="landing-icon">
                <Icon size={22} strokeWidth={2.1} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="landing-section">
        <div className="landing-section-heading">
          <span className="landing-kicker">
            <BookOpen size={15} />
            Pricing
          </span>
          <h2>Simple access for students and class groups.</h2>
        </div>

        <div className="landing-pricing-grid">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={`landing-plan ${index === 1 ? "is-featured" : ""}`}
            >
              <div>
                <span>{plan.name}</span>
                <strong>{plan.price}</strong>
                <p>{plan.description}</p>
              </div>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>
                    <Check size={16} strokeWidth={2.4} />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="blog" className="landing-section landing-split">
        <div className="landing-section-heading landing-section-heading-left">
          <span className="landing-kicker">Blog</span>
          <h2>Short notes on studying with less friction.</h2>
          <p>
            A lightweight editorial area gives new visitors more context without
            hiding the core product behind authentication.
          </p>
        </div>

        <div className="landing-post-list">
          {posts.map((post) => (
            <article key={post.title} className="landing-post">
              <span>{post.tag}</span>
              <h3>{post.title}</h3>
              <ArrowRight size={18} />
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="landing-section">
        <div className="landing-section-heading">
          <span className="landing-kicker">FAQ</span>
          <h2>What visitors can see before login.</h2>
        </div>

        <div className="landing-faq-list">
          {faqs.map((item) => (
            <details key={item.question} className="landing-faq">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="about" className="landing-section landing-about">
        <div>
          <span className="landing-kicker">
            <ShieldCheck size={15} />
            About Us
          </span>
          <h2>Built around the way students actually collect resources.</h2>
          <p>
            Pixel Class turns scattered PDFs, peer help, and subject collections
            into a focused study hub. The landing page is public, and the deeper
            tools stay private behind login.
          </p>
        </div>
        <Link to="/auth/signup" className="landing-button landing-button-primary">
          Create account
        </Link>
      </section>
    </main>
  );
};

export default MainPage;
