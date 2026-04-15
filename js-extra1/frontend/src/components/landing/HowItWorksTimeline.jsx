/**
 * HowItWorksTimeline — Premium scroll-driven animated timeline
 *
 * GSAP + ScrollTrigger for tight synchronisation between:
 *   • Thin, subtle progress line filling downward on scroll
 *   • Single-active-step with soft blurred halo
 *   • Cards gliding in from their sides with blur-to-clear motion
 *
 * Content, colours, cards, layout — all unchanged.
 */
import { useRef, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Route } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientButton from "../common/GradientButton";

gsap.registerPlugin(ScrollTrigger);

/* premium easing — close to cubic-bezier(0.22, 1, 0.36, 1) */
const EASE_PREMIUM = "power3.out";

/* ════════════════════════════════════════════════════════════════ */
/*  TIMELINE CIRCLE                                                */
/* ════════════════════════════════════════════════════════════════ */
const TimelineCircle = ({ item, isActive, hasRevealed }) => (
  <div className="absolute left-6 top-0 z-10 hidden lg:left-1/2 lg:block lg:-translate-x-1/2">
    {/* Outer soft halo — only visible on active step */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        transform: isActive ? "scale(1.85)" : "scale(1.15)",
        opacity: isActive ? 0.5 : 0,
        background:
          "radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(6,182,212,0.08) 55%, transparent 100%)",
        filter: "blur(8px)",
        transition:
          "transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}
    />

    {/* Main circle */}
    <div
      className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient}`}
      style={{
        transform: isActive
          ? "scale(1)"
          : hasRevealed
            ? "scale(0.92)"
            : "scale(0.82)",
        opacity: hasRevealed ? 1 : 0.35,
        boxShadow: isActive
          ? "0 0 18px rgba(99,102,241,0.18), 0 0 36px rgba(6,182,212,0.08), 0 4px 10px rgba(0,0,0,0.08)"
          : "0 2px 6px rgba(0,0,0,0.06)",
        transition:
          "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease, box-shadow 0.7s ease",
      }}
    >
      <span className="text-sm font-bold text-white">{item.step}</span>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
/*  CARD CONTENT (pure presentation — no layout responsibility)    */
/* ════════════════════════════════════════════════════════════════ */
const CardContent = ({ item, index, isActive, hasRevealed }) => {
  const Icon = item.icon;
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl ${
        isActive
          ? "border-brand-indigo/25 bg-white/[0.09] shadow-[0_8px_40px_rgba(99,102,241,0.10)] dark:border-cyan-500/20 dark:bg-slate-900/40 dark:shadow-[0_8px_40px_rgba(34,211,238,0.06)]"
          : hasRevealed
            ? "border-white/15 bg-white/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.04)] dark:border-white/8 dark:bg-slate-900/25"
            : "border-white/10 bg-white/[0.03] dark:border-white/5 dark:bg-slate-900/15"
      }`}
      style={{
        transition:
          "border-color 0.7s ease, background 0.7s ease, box-shadow 0.7s ease",
      }}
    >
      {/* Subtle gradient background on hover */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]`}
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-3">
          {/* Mobile step number */}
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-xs font-bold text-white shadow-md lg:hidden`}
          >
            {item.step}
          </div>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} bg-opacity-10`}
          >
            <Icon size={17} className="text-brand-indigo dark:text-cyan-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {item.title}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {item.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.highlight.split(" · ").map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-indigo/15 bg-brand-indigo/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-brand-indigo dark:border-cyan-500/20 dark:bg-cyan-500/[0.08] dark:text-cyan-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════ */
/*  MAIN TIMELINE COMPONENT                                        */
/* ════════════════════════════════════════════════════════════════ */
const HowItWorksTimeline = ({
  steps,
  joinTarget,
  isAuthenticated,
  navigate,
}) => {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const progressRef = useRef(null);
  const tipDotRef = useRef(null);
  const stepRefs = useRef([]);
  const cardRefs = useRef([]);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [revealedSet, setRevealedSet] = useState(new Set());

  /* ── GSAP ScrollTrigger — master scroll-linked animation ── */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    const progressEl = progressRef.current;
    const tipDot = tipDotRef.current;
    if (!section || !timeline || !progressEl || !tipDot) return;

    const ctx = gsap.context(() => {
      /* ─── 1. Scroll-linked progress line (scrub) ─── */
      gsap.fromTo(
        progressEl,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 75%",
            end: "bottom 25%",
            scrub: 0.4,
          },
        }
      );

      /* ─── Tip dot follows the progress ─── */
      gsap.fromTo(
        tipDot,
        { top: "0%" },
        {
          top: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 75%",
            end: "bottom 25%",
            scrub: 0.4,
          },
        }
      );

      /* ─── 2. Per-step: set initial card state + trigger activation ─── */
      stepRefs.current.forEach((stepEl, i) => {
        if (!stepEl) return;
        const cardEl = cardRefs.current[i];
        const isEven = i % 2 === 0;

        /* Set card to its hidden starting position */
        if (cardEl) {
          gsap.set(cardEl, {
            opacity: 0,
            x: isEven ? -36 : 36,
            y: 24,
            filter: "blur(6px)",
          });
        }

        /* ScrollTrigger fires when the step row reaches the viewport */
        ScrollTrigger.create({
          trigger: stepEl,
          start: "top 68%",
          onEnter: () => {
            /* Mark step as active + revealed */
            setActiveIndex(i);
            setRevealedSet((prev) => {
              const next = new Set(prev);
              next.add(i);
              return next;
            });

            /* Animate card in */
            if (cardEl) {
              gsap.to(cardEl, {
                opacity: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
                duration: 0.85,
                ease: EASE_PREMIUM,
                overwrite: true,
              });
            }
          },
          onEnterBack: () => {
            setActiveIndex(i);
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [steps.length]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="container-4k">
        {/* ── Section header ── */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-indigo/25 bg-brand-indigo/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-indigo dark:border-brand-indigo/40 dark:bg-brand-indigo/20 dark:text-cyan-300"
          >
            <Route size={13} />
            Your Journey
          </motion.span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle mx-auto mt-2 max-w-2xl">
            From profile to placement — five powerful steps to accelerate your
            career with AI.
          </p>
        </div>

        {/* ── Timeline area ── */}
        <div ref={timelineRef} className="relative mx-auto max-w-4xl">
          {/* ── Vertical center line — desktop only ── */}
          <div className="pointer-events-none absolute left-6 top-0 hidden h-full lg:left-1/2 lg:block lg:-translate-x-px">
            {/* Inactive base line — 1px, faint lavender */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                width: "1px",
                background:
                  "linear-gradient(to bottom, rgba(139,92,246,0.06), rgba(139,92,246,0.14), rgba(139,92,246,0.06))",
              }}
            />

            {/* Active progress fill — soft gradient, follows scroll */}
            <div
              ref={progressRef}
              className="absolute left-0 top-0 rounded-full"
              style={{
                width: "1.5px",
                height: "0%",
                background:
                  "linear-gradient(to bottom, rgba(99,102,241,0.45), rgba(6,182,212,0.35), rgba(139,92,246,0.30))",
              }}
            />

            {/* Tip dot — tiny, soft glow riding the progress front */}
            <div
              ref={tipDotRef}
              className="absolute"
              style={{
                left: "50%",
                top: "0%",
                width: "5px",
                height: "5px",
                marginLeft: "-2.5px",
                marginTop: "-2.5px",
                borderRadius: "50%",
                background: "rgba(6,182,212,0.65)",
                boxShadow:
                  "0 0 6px rgba(6,182,212,0.35), 0 0 14px rgba(6,182,212,0.12)",
              }}
            />
          </div>

          {/* ── Step rows ── */}
          <div className="space-y-16 lg:space-y-20">
            {steps.map((item, index) => {
              const isEven = index % 2 === 0;
              const isActive = activeIndex === index;
              const hasRevealed = revealedSet.has(index);

              return (
                <div
                  key={item.step}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  className={`relative flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:gap-0 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Circle */}
                  <TimelineCircle
                    item={item}
                    isActive={isActive}
                    hasRevealed={hasRevealed}
                  />

                  {/* Card wrapper — GSAP controls opacity/x/y/blur on this div */}
                  <div
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className={`w-full lg:w-[calc(50%-2rem)] ${
                      isEven ? "lg:pr-4" : "lg:pl-4"
                    }`}
                  >
                    <CardContent
                      item={item}
                      index={index}
                      isActive={isActive}
                      hasRevealed={hasRevealed}
                    />
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden w-[calc(50%-2rem)] lg:block" />
                </div>
              );
            })}
          </div>

          {/* ── Bottom CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 text-center"
          >
            <GradientButton
              onClick={() => navigate(joinTarget)}
              className="px-6 py-3"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
              <ArrowRight size={15} className="ml-2" />
            </GradientButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;
