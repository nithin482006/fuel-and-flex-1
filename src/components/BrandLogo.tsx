import { Zap } from "lucide-react";

/**
 * Canonical Fuel & Flex logo — bolt icon + Orbitron wordmark.
 * Matches the Today screen header exactly. Use everywhere.
 */
export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "sm" ? 15 : size === "lg" ? 22 : 18;
  const fs = size === "sm" ? 14 : size === "lg" ? 21 : 17;
  return (
    <div
      className="flex items-center gap-[9px] font-bold"
      style={{
        fontFamily: "var(--ff-font-display)",
        fontSize: fs,
        letterSpacing: "2px",
        color: "var(--ff-text)",
      }}
    >
      <Zap
        size={px}
        style={{ color: "var(--ff-neon)", filter: "drop-shadow(0 0 6px var(--ff-neon))" }}
      />
      FUEL &amp; FLEX
    </div>
  );
}