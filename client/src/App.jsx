import { useEffect, useState } from "react";
import { fetchPortfolio } from "./api/portfolioApi";
import { sendMessage } from "./api/messageApi";

const isHttpLink = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);
const isPathLink = (value) => typeof value === "string" && value.startsWith("/");
const DEFAULT_RESUME_URL = "/Deepak-Yadav-Resume.pdf";
const THEME_STORAGE_KEY = "portfolio-theme";
const UPDATED_LINKEDIN_URL = "https://www.linkedin.com/in/deepakyadav045/";
const BODMAS_BEAT_LIVE_URL = "https://bodmasbeat.netlify.app/";
const LEGACY_LINKEDIN_URLS = new Set([
  "https://www.linkedin.com/in/deepak-yadav-dev",
  "https://linkedin.com/in/deepak-yadav-dev",
]);

const normalizeLinkedinUrl = (value) => {
  if (typeof value !== "string") {
    return UPDATED_LINKEDIN_URL;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return UPDATED_LINKEDIN_URL;
  }

  const normalizedValue = trimmedValue.replace(/\/+$/, "");
  if (LEGACY_LINKEDIN_URLS.has(normalizedValue)) {
    return UPDATED_LINKEDIN_URL;
  }

  return trimmedValue;
};

const normalizeSocialLinks = (social = {}) => ({
  ...social,
  linkedin: normalizeLinkedinUrl(social.linkedin),
});

const normalizeProjectLinks = (projects = []) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map((project) => {
    if (!project || typeof project !== "object") {
      return project;
    }

    const normalizedTitle =
      typeof project.title === "string"
        ? project.title.trim().toLowerCase()
        : "";
    const normalizedRepoUrl =
      typeof project.repoUrl === "string" ? project.repoUrl.toLowerCase() : "";
    const isBodmasProject =
      normalizedTitle === "bodmas beat" ||
      normalizedRepoUrl.includes("bodmas_beat");

    if (!isBodmasProject || isHttpLink(project.liveUrl)) {
      return project;
    }

    return {
      ...project,
      liveUrl: BODMAS_BEAT_LIVE_URL,
    };
  });
};

const normalizeResumeUrl = (value) => {
  if (typeof value !== "string") {
    return DEFAULT_RESUME_URL;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return DEFAULT_RESUME_URL;
  }

  if (trimmedValue.toLowerCase().endsWith(".txt")) {
    return DEFAULT_RESUME_URL;
  }

  if (isHttpLink(trimmedValue) || isPathLink(trimmedValue)) {
    return trimmedValue;
  }

  return DEFAULT_RESUME_URL;
};

const SocialIcon = ({ platform }) => {
  if (platform === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.51 0-.25-.01-1.08-.02-1.96-2.94.64-3.56-1.24-3.56-1.24-.48-1.22-1.17-1.54-1.17-1.54-.96-.66.07-.65.07-.65 1.06.07 1.62 1.09 1.62 1.09.94 1.62 2.46 1.15 3.06.88.1-.68.37-1.15.67-1.42-2.35-.27-4.82-1.18-4.82-5.26 0-1.16.42-2.1 1.09-2.84-.11-.27-.47-1.35.1-2.81 0 0 .9-.29 2.95 1.08a10.2 10.2 0 0 1 5.37 0c2.04-1.37 2.94-1.08 2.94-1.08.58 1.46.22 2.54.11 2.81.68.74 1.09 1.68 1.09 2.84 0 4.09-2.47 4.99-4.83 5.25.38.33.71.98.71 1.98 0 1.43-.01 2.57-.01 2.92 0 .28.19.62.73.51A10.5 10.5 0 0 0 12 1.5Z" />
      </svg>
    );
  }

  if (platform === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4.98 3.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM3.5 8.75h2.96V20H3.5V8.75Zm5.11 0h2.84v1.54h.04c.4-.75 1.37-1.54 2.83-1.54 3.02 0 3.58 1.99 3.58 4.57V20h-2.96v-5.88c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V20H8.61V8.75Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M18.901 2.25h3.68l-8.04 9.19L24 23.75h-7.41l-5.8-7.47-6.54 7.47H.57l8.6-9.83L0 2.25h7.6l5.24 6.9 6.06-6.9Zm-1.3 19.28h2.04L6.5 4.36H4.3l13.3 17.17Z" />
    </svg>
  );
};

const getInitials = (name = "") => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "DY";
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getRepoLabel = (repoUrl) => {
  if (!isHttpLink(repoUrl)) {
    return "";
  }

  try {
    return new URL(repoUrl).pathname.replace(/^\//, "").replace(/\/$/, "");
  } catch {
    return "";
  }
};

const formatUpdatedAt = (value) => {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const gitWorkItems = [
  "Version control with Git and GitHub",
  "Feature branching and clean pull requests",
  "Repository maintenance with regular updates",
];

const gitGraphData = [
  { label: "Branching", value: 92 },
  { label: "Pull Requests", value: 88 },
  { label: "Repo Updates", value: 84 },
  { label: "Issue Tracking", value: 76 },
];

const fallbackPortfolio = {
  name: "Deepak Yadav",
  role: "MERN Stack Developer",
  headline: "Building web products with speed, quality, and strong UX.",
  about:
    "MERN stack developer focused on building fast, scalable, and user-friendly products. I design modern React interfaces, build secure Node and Express APIs, and manage MongoDB data flows with production-ready architecture.",
  email: "yadavdeepak6959@gmail.com",
  phone: "8709583627",
  location: "Bihar, India",
  website: "https://deepakyadav.dev",
  profileImage: "/profile-photo.jpeg",
  resumeUrl: "/Deepak-Yadav-Resume.pdf",
  skills: [
    "MongoDB",
    "Express",
    "React",
    "Node.js",
    "REST APIs",
    "Git",
    "GitHub",
    "Git Workflow",
    "Pull Requests",
    "Deployment",
  ],
  social: {
    github: "https://github.com/yadavdeep123",
    linkedin: "https://www.linkedin.com/in/deepakyadav045/",
    twitter: "https://x.com/deepakyadavdev",
  },
  projects: [
    {
      title: "Dairy Product Management System",
      description:
        "Product management app for dairy inventory workflows with a clean dashboard-style interface.",
      stack: ["JavaScript", "HTML", "CSS"],
      liveUrl: "https://dairy-product-management-systen-cx3.vercel.app/login",
      repoUrl:
        "https://github.com/yadavdeep123/Dairy-Product-management-Systen",
      language: "JavaScript",
      stars: 0,
      updatedAt: "2026-04-04T18:47:55Z",
      badge: "Featured",
    },
    {
      title: "Bodmas Beat",
      description:
        "Interactive arithmetic practice project focused on quick BODMAS based learning exercises.",
      stack: ["HTML", "CSS", "JavaScript"],
      liveUrl: "https://bodmasbeat.netlify.app/",
      repoUrl: "https://github.com/yadavdeep123/bodmas_beat",
      language: "HTML",
      stars: 0,
      updatedAt: "2026-03-24T16:16:21Z",
      badge: "Open Source",
    },
    {
      title: "APP",
      description:
        "Dart based application repository with mobile app experiments and basic feature modules.",
      stack: ["Dart"],
      liveUrl: "",
      repoUrl: "https://github.com/yadavdeep123/APP",
      language: "Dart",
      stars: 0,
      updatedAt: "2026-03-19T04:37:50Z",
      badge: "Mobile",
    },
  ],
};

function App() {
  const [portfolio, setPortfolio] = useState(fallbackPortfolio);
  const [status, setStatus] = useState("loading");
  const [theme, setTheme] = useState(getInitialTheme);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [messageStatus, setMessageStatus] = useState("idle");
  const [messageFeedback, setMessageFeedback] = useState("");

  const normalizedSocial = normalizeSocialLinks(portfolio.social);

  const githubAvatar = isHttpLink(normalizedSocial.github)
    ? `${normalizedSocial.github.replace(/\/+$/, "")}.png`
    : "";

  const profileImage =
    portfolio.profileImage || githubAvatar || "/profile-photo.svg";
  const primaryEmail = portfolio.email || "yadavdeepak6959@gmail.com";
  const primaryPhone = portfolio.phone || "8709583627";
  const primaryLocation = portfolio.location || "Bihar, India";
  const resumeUrl = normalizeResumeUrl(portfolio.resumeUrl);
  const profileInitials = getInitials(portfolio.name);
  const normalizedProjects = normalizeProjectLinks(portfolio.projects);

  const socialLinks = [
    { key: "github", label: "GitHub", toneClass: "social-platform-github" },
    {
      key: "linkedin",
      label: "LinkedIn",
      toneClass: "social-platform-linkedin",
    },
    { key: "twitter", label: "X", toneClass: "social-platform-twitter" },
  ]
    .map((link) => ({
      ...link,
      href: normalizedSocial[link.key],
    }))
    .filter(({ href }) => isHttpLink(href));

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const data = await fetchPortfolio();
        const nextPortfolio =
          data && typeof data === "object" ? data : fallbackPortfolio;

        setPortfolio({
          ...nextPortfolio,
          social: normalizeSocialLinks(nextPortfolio.social),
          projects: normalizeProjectLinks(nextPortfolio.projects),
        });
        setStatus("ready");
      } catch (error) {
        setStatus("offline");
      }
    };

    loadPortfolio();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setPhotoLoadFailed(false);
  }, [profileImage]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const handleContactFieldChange = (event) => {
    const { name, value } = event.target;

    setContactForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (messageStatus === "sending") {
      return;
    }

    setMessageStatus("sending");
    setMessageFeedback("");

    try {
      const response = await sendMessage(contactForm);

      setMessageStatus("success");
      setMessageFeedback(response.message || "Message sent successfully.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      setMessageStatus("error");
      setMessageFeedback(
        error.response?.data?.message ||
          "Could not send message. Please try again.",
      );
    }
  };

  return (
    <div className="site-shell">
      <div className="light-orb light-orb-one" aria-hidden="true" />
      <div className="light-orb light-orb-two" aria-hidden="true" />

      <nav
        className="top-nav card reveal nav-reveal"
        aria-label="Page navigation"
      >
        <a className="brand-mark" href="#home">
          {portfolio.name?.split(" ")?.[0] || "Portfolio"}
        </a>

        <div className="nav-links">
          {navLinks.map((item) => (
            <a key={item.id} className="nav-link" href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <header id="home" className="hero card reveal">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">MERN Portfolio</p>
            <h1>{portfolio.name}</h1>
            <h2>{portfolio.role}</h2>
            <p className="headline">{portfolio.headline}</p>

            <div className="hero-actions">
              <a className="btn btn-solid" href={`mailto:${primaryEmail}`}>
                Let&apos;s Work Together
              </a>
              <a className="btn btn-outline" href={resumeUrl} download>
                Download Resume
              </a>
              {isHttpLink(normalizedSocial.github) && (
                <a
                  className="btn btn-outline"
                  href={normalizedSocial.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}
              <button
                type="button"
                className="btn btn-outline theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </div>

            {status === "loading" && (
              <p className="status">Loading portfolio data...</p>
            )}
            {status === "offline" && (
              <p className="status">
                API is unavailable, showing local fallback content.
              </p>
            )}
          </div>

          <aside className="hero-visual">
            <div className="photo-frame">
              {!photoLoadFailed ? (
                <img
                  className="profile-photo"
                  src={profileImage}
                  alt={`${portfolio.name} profile`}
                  onError={() => setPhotoLoadFailed(true)}
                />
              ) : (
                <div className="photo-fallback">{profileInitials}</div>
              )}
            </div>

            <div className="hero-meta">
              <span>{primaryLocation}</span>
              <span>{portfolio.skills?.length || 0}+ Skills</span>
            </div>
          </aside>
        </div>
      </header>

      <main className="layout">
        <section id="about" className="card reveal delay-1">
          <h3>About Me</h3>
          <p>{portfolio.about}</p>
          <div className="meta-row">
            <span>{primaryLocation}</span>
            {isHttpLink(portfolio.website) && (
              <a href={portfolio.website} target="_blank" rel="noreferrer">
                Personal Website
              </a>
            )}
          </div>
        </section>

        <section id="skills" className="card reveal delay-2">
          <h3>Tech Stack, Git Work &amp; Graph</h3>
          <p className="skills-sub">
            I use Git daily for branch-based development, pull requests, and
            clean code history.
          </p>
          <div className="skills-wrap">
            {portfolio.skills?.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>

          <div className="git-work-grid" aria-label="Git work highlights">
            {gitWorkItems.map((item) => (
              <span className="git-chip" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="git-graph" aria-label="Git work graph">
            {gitGraphData.map((item) => (
              <div className="git-bar-row" key={item.label}>
                <span className="git-bar-label">{item.label}</span>
                <div className="git-bar-track">
                  <span
                    className="git-bar-fill"
                    style={{ width: `${item.value}%` }}
                  >
                    <span className="git-bar-value">{item.value}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="card reveal delay-3 full-width">
          <div className="projects-head">
            <div>
              <h3>Featured Projects</h3>
              <p className="projects-sub">
                A focused set of three builds with practical Git workflow and
                clean implementation.
              </p>
            </div>
            {isHttpLink(normalizedSocial.github) && (
              <a
                className="btn btn-outline projects-cta"
                href={normalizedSocial.github}
                target="_blank"
                rel="noreferrer"
              >
                View All Repos
              </a>
            )}
          </div>

          <div className="projects-grid">
            {normalizedProjects.length ? (
              normalizedProjects.map((project, index) => (
                <article
                  className={`project project-v2 project-tone-${(index % 3) + 1}`}
                  key={project.repoUrl || project.title}
                >
                  <div className="project-top">
                    <span className="project-order">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="project-badge">
                      {project.badge || "Open Source"}
                    </span>
                    <div className="project-stats">
                      {typeof project.stars === "number" && (
                        <span className="project-stat">{`★ ${project.stars}`}</span>
                      )}
                      {project.language && (
                        <span className="project-stat">{project.language}</span>
                      )}
                    </div>
                  </div>

                  <h4>{project.title}</h4>
                  {getRepoLabel(project.repoUrl) && (
                    <p className="project-repo">
                      {getRepoLabel(project.repoUrl)}
                    </p>
                  )}
                  <p className="project-description">
                    {project.description ||
                      "Open-source project available on my GitHub profile."}
                  </p>

                  {project.stack?.length > 0 && (
                    <div className="skills-wrap compact">
                      {project.stack.map((item) => (
                        <span className="chip" key={`${project.title}-${item}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="project-footer">
                    <div className="project-links">
                      {isHttpLink(project.liveUrl) && (
                        <a
                          className="project-link"
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live Demo
                        </a>
                      )}
                      {isHttpLink(project.repoUrl) && (
                        <a
                          className="project-link"
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source
                        </a>
                      )}
                    </div>

                    {formatUpdatedAt(project.updatedAt) && (
                      <p className="project-updated">
                        Updated {formatUpdatedAt(project.updatedAt)}
                      </p>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p>
                Add your first project through the API and it will appear here.
              </p>
            )}
          </div>
        </section>

        <section id="contact" className="card reveal delay-4">
          <h3>Contact</h3>
          <p>Available for freelance and full time opportunities.</p>

          <form className="contact-form" onSubmit={handleSendMessage}>
            <div className="contact-grid">
              <label className="field" htmlFor="name">
                <span>Name</span>
                <input
                  id="name"
                  className="field-input"
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactFieldChange}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="field" htmlFor="email">
                <span>Email</span>
                <input
                  id="email"
                  className="field-input"
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactFieldChange}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <label className="field" htmlFor="message">
              <span>Message</span>
              <textarea
                id="message"
                className="field-input field-textarea"
                name="message"
                value={contactForm.message}
                onChange={handleContactFieldChange}
                placeholder="Type your message here"
                minLength={10}
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-solid send-btn"
              disabled={messageStatus === "sending"}
            >
              {messageStatus === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>

          {messageFeedback && (
            <p
              className={`message-feedback ${messageStatus === "error" ? "is-error" : "is-success"}`}
            >
              {messageFeedback}
            </p>
          )}

          <div className="contact-items">
            <a className="contact-item" href={`mailto:${primaryEmail}`}>
              <span className="icon-badge" aria-hidden="true">
                EM
              </span>
              <span>{primaryEmail}</span>
            </a>

            <a className="contact-item" href={`tel:${primaryPhone}`}>
              <span className="icon-badge" aria-hidden="true">
                PH
              </span>
              <span>{primaryPhone}</span>
            </a>

            <div
              className="contact-item contact-item-static"
              aria-label="Address"
            >
              <span className="icon-badge" aria-hidden="true">
                AD
              </span>
              <span>{primaryLocation}</span>
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="socials">
              {socialLinks.map((link) => (
                <a
                  className={`social-link ${link.toneClass}`}
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${link.label} profile`}
                >
                  <span className="social-icon" aria-hidden="true">
                    <SocialIcon platform={link.key} />
                  </span>
                  <span className="social-label">{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
