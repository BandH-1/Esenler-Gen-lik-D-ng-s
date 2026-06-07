/**
 * Fixed, decorative aurora background. Soft drifting gradient orbs plus a faint
 * dot grid — sits behind all content and never intercepts pointer events.
 */
export function AppBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="anim-aurora absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--brand-from), transparent 70%)",
          animation: "aurora 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 70% 40%, var(--brand-to), transparent 70%)",
          animation: "aurora 26s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[28rem] w-[28rem] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--brand-via), transparent 70%)",
          animation: "aurora 30s ease-in-out infinite",
        }}
      />
      {/* faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--border) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 0%, black, transparent 80%)",
        }}
      />
    </div>
  );
}
