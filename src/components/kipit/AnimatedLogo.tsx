type AnimatedLogoProps = {
  className?: string;
  tone?: "brand" | "light";
};

export function AnimatedLogo({ className = "", tone = "brand" }: AnimatedLogoProps) {
  const letters = ["K", "i", "p", "i", "t"];
  const textColor = tone === "light" ? "text-brand-foreground" : "text-brand";

  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-tight ${textColor} ${className}`}>
      <span className="inline-flex overflow-hidden">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="animate-letter-reveal inline-block"
            style={{ animationDelay: `${80 + index * 70}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span
        className="animate-dot-reveal ml-0.5 inline-block size-[0.28em] translate-y-[-0.06em] rounded-full bg-gold"
        style={{ animationDelay: "450ms" }}
      />
      <style>{`
        @keyframes letter-reveal {
          0% {
            opacity: 0;
            transform: translateY(0.35em);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes dot-reveal {
          0% {
            opacity: 0;
            transform: translateY(-0.06em) scale(0);
          }
          60% {
            transform: translateY(-0.06em) scale(1.15);
          }
          100% {
            opacity: 1;
            transform: translateY(-0.06em) scale(1);
          }
        }
        .animate-letter-reveal {
          animation: letter-reveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }
        .animate-dot-reveal {
          animation: dot-reveal 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </span>
  );
}
