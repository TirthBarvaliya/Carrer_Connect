import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Mail, Linkedin, Github } from "lucide-react";
import { ROUTES } from "../../utils/constants";

/* ─── placeholder links — update with real values ─── */
const SOCIAL_LINKS = {
  email: "mailto:carrerconnec.tnoreply@gmail.com",
  linkedin: "https://www.linkedin.com/in/tirthbarvaliya09",
  github: "https://github.com/TirthBarvaliya/Career_Connect",
};

const Footer = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (location.pathname === ROUTES.LOGIN) {
    return null;
  }

  const joinTarget = isAuthenticated
    ? user?.role === "recruiter"
      ? ROUTES.RECRUITER_DASHBOARD
      : ROUTES.STUDENT_DASHBOARD
    : ROUTES.SIGNUP;

  return (
    <footer className="mt-24">
      {/* Soft gradient background */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(186,220,243,0.35) 0%, rgba(206,196,236,0.30) 40%, rgba(232,200,220,0.25) 70%, rgba(186,220,243,0.20) 100%)",
        }}
        className="dark:bg-slate-950/60"
      >
        <div className="container-4k py-12">
          <div className="grid gap-10 md:grid-cols-3">

            {/* ── Brand column ── */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                {/* Logo */}
                <div className="relative h-14 w-12 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                    src="/logo.webm"
                  >
                    <source src="/logo.webm" type="video/webm" />
                  </video>
                </div>
                <h3 className="font-poppins text-lg font-semibold text-slate-800 dark:text-white">
                  Career Connect
                </h3>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Built for job seekers and recruiters to discover better
                opportunities, measurable growth, and faster hiring through
                intelligent tools and actionable insights.
              </p>
            </div>

            {/* ── Explore column ── */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <Link
                    to={ROUTES.JOBS}
                    className="transition-colors duration-200 hover:text-brand-indigo dark:hover:text-cyan-300"
                  >
                    Job Listings
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.ROADMAP}
                    className="transition-colors duration-200 hover:text-brand-indigo dark:hover:text-cyan-300"
                  >
                    Career Roadmaps
                  </Link>
                </li>
                <li>
                  <Link
                    to={joinTarget}
                    className="transition-colors duration-200 hover:text-brand-indigo dark:hover:text-cyan-300"
                  >
                    {isAuthenticated ? "Open Dashboard" : "Join Platform"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── Connect column ── */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Connect
              </h4>

              <a
                href={SOCIAL_LINKS.email}
                className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-brand-indigo dark:text-slate-300 dark:hover:text-cyan-300"
              >
                <Mail size={15} />
                Contact Us
              </a>

              {/* Social icons */}
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={SOCIAL_LINKS.email}
                  aria-label="Email"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/50 bg-white/60 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/40 hover:text-brand-indigo hover:shadow-md dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                >
                  <Mail size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/50 bg-white/60 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/40 hover:text-brand-indigo hover:shadow-md dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/50 bg-white/60 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/40 hover:text-brand-indigo hover:shadow-md dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                >
                  <Github size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* ── Copyright bar ── */}
          <div className="mt-10 border-t border-slate-300/30 pt-6 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Career Connect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
