"use client";

import React, { useState } from "react";

export type PassportType = "REGULAR" | "OFFICIAL" | "DIPLOMATIC";

interface PassportCoverProps {
  type?: PassportType;
  holderName?: string;
  applicationId?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
}

export default function PassportCover({
  type = "REGULAR",
  holderName,
  applicationId,
  size = "md",
  interactive = true,
  className = "",
}: PassportCoverProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Cover configurations inspired by official Ministry specifications & Passport Index
  const config = {
    REGULAR: {
      name: "Ordinary Citizen Passport",
      code: "Type P",
      bgGradient: "from-[#0f1d38] via-[#091224] to-[#040812]",
      leatherTexture: "rgba(15, 29, 56, 0.95)",
      accentColor: "#d4af37",
      foilColor: "text-[#d4af37]",
      foilBorder: "border-[#d4af37]/40",
      foilGlow: "shadow-[0_0_30px_rgba(212,175,55,0.25)]",
      emblemFill: "#d4af37",
      pages: "36 / 60 Pages",
      eligible: "All Indian Citizens",
    },
    OFFICIAL: {
      name: "Official Government Passport",
      code: "Type S",
      bgGradient: "from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]",
      leatherTexture: "rgba(241, 245, 249, 0.98)",
      accentColor: "#0f172a",
      foilColor: "text-[#0f172a]",
      foilBorder: "border-slate-400/50",
      foilGlow: "shadow-[0_0_30px_rgba(15,23,42,0.18)]",
      emblemFill: "#0f172a",
      pages: "36 Pages",
      eligible: "Govt Officials & Delegates",
    },
    DIPLOMATIC: {
      name: "Diplomatic Passport",
      code: "Type D",
      bgGradient: "from-[#4a0815] via-[#2c040c] to-[#140105]",
      leatherTexture: "rgba(74, 8, 21, 0.96)",
      accentColor: "#f3e5ab",
      foilColor: "text-[#f3e5ab]",
      foilBorder: "border-[#f3e5ab]/45",
      foilGlow: "shadow-[0_0_30px_rgba(243,229,171,0.25)]",
      emblemFill: "#f3e5ab",
      pages: "60 Pages",
      eligible: "Ambassadors & High Commissioners",
    },
  }[type];

  // Scale dimensions
  const dimensions = {
    sm: "w-[170px] h-[245px] text-[9px] p-3 rounded-xl",
    md: "w-[240px] h-[345px] text-xs p-5 rounded-2xl",
    lg: "w-[300px] h-[430px] text-sm p-6 rounded-2xl",
  }[size];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -y / 14,
      y: x / 14,
    });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: interactive
          ? `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
          : undefined,
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
      }}
      className={`relative select-none flex flex-col justify-between overflow-hidden bg-gradient-to-br ${config.bgGradient} ${dimensions} ${className} shadow-[0_18px_45px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/10`}
    >
      {/* Subtle Booklet Spine on Left */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none" />

      {/* Surface Gold / Specular Shimmer on Hover */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent transition-opacity duration-300"
          style={{
            transform: `translate(${rotate.y * 5}px, ${rotate.x * 5}px)`,
          }}
        />
      )}

      {/* Top Header Foil Typography */}
      <div className="text-center pt-1 z-10 space-y-0.5">
        <p
          className={`font-serif tracking-[0.22em] font-bold ${config.foilColor} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight`}
          style={{ fontSize: size === "sm" ? "10px" : size === "md" ? "13px" : "15px" }}
        >
          भारत गणराज्य
        </p>
        <p
          className={`tracking-[0.28em] font-extrabold uppercase ${config.foilColor} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-sans`}
          style={{ fontSize: size === "sm" ? "8px" : size === "md" ? "10px" : "12px" }}
        >
          REPUBLIC OF INDIA
        </p>
      </div>

      {/* Central State Emblem of India (Ashoka Lion Capital Vector) */}
      <div className="my-auto py-2 flex flex-col items-center justify-center z-10">
        <svg
          viewBox="0 0 200 240"
          className={size === "sm" ? "w-16 h-20" : size === "md" ? "w-24 h-28" : "w-32 h-36"}
          style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.7))` }}
        >
          <g fill={config.emblemFill}>
            {/* Crown of 4 Lions Silhouette */}
            <path d="M 50 40 Q 60 15, 80 25 Q 100 10, 120 25 Q 140 15, 150 40 Q 155 60, 145 80 Q 135 100, 100 105 Q 65 100, 55 80 Q 45 60, 50 40 Z" opacity="0.95" />
            <circle cx="80" cy="50" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="120" cy="50" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="100" cy="40" r="5" fill="currentColor" opacity="0.3" />
            
            {/* Lion Mane & Muscle Etchings */}
            <path d="M 65 65 Q 100 85, 135 65 Q 100 95, 65 65 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 75 80 Q 100 98, 125 80" fill="none" stroke="currentColor" strokeWidth="2" />

            {/* Abacus / Base Platform */}
            <rect x="40" y="112" width="120" height="20" rx="3" />
            <rect x="45" y="108" width="110" height="5" rx="1.5" opacity="0.8" />

            {/* Ashoka Chakra in Center of Abacus */}
            <circle cx="100" cy="122" r="7" fill="none" stroke="black" strokeWidth="1.5" />
            <circle cx="100" cy="122" r="2" fill="black" />
            {/* Chakra Spokes */}
            <line x1="100" y1="115" x2="100" y2="129" stroke="black" strokeWidth="1" />
            <line x1="93" y1="122" x2="107" y2="122" stroke="black" strokeWidth="1" />
            <line x1="95" y1="117" x2="105" y2="127" stroke="black" strokeWidth="1" />
            <line x1="95" y1="127" x2="105" y2="117" stroke="black" strokeWidth="1" />

            {/* Bull and Horse carvings on Abacus */}
            <ellipse cx="65" cy="122" rx="6" ry="3" fill="black" opacity="0.7" />
            <ellipse cx="135" cy="122" rx="6" ry="3" fill="black" opacity="0.7" />

            {/* Inverted Lotus Pedestal */}
            <path d="M 45 134 Q 100 152, 155 134 Q 145 160, 100 162 Q 55 160, 45 134 Z" />
            <path d="M 58 140 Q 100 155, 142 140" fill="none" stroke="currentColor" strokeWidth="1.5" />

            {/* Motto Banner: SATYAMEVA JAYATE */}
            <rect x="35" y="172" width="130" height="15" rx="2" opacity="0.2" />
            <text
              x="100"
              y="183"
              textAnchor="middle"
              fontSize="9"
              fontFamily="serif"
              fontWeight="bold"
              fill={config.emblemFill}
              letterSpacing="1.5"
            >
              सत्यमेव जयते
            </text>
          </g>
        </svg>

        {holderName && (
          <div className="mt-1 text-center bg-black/30 px-3 py-0.5 rounded border border-white/5 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-300">
              {holderName}
            </p>
            {applicationId && (
              <p className="font-mono text-[8px] text-amber-400 font-semibold">
                {applicationId}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Passport Foil Title & Biometric Chip Symbol */}
      <div className="text-center pb-2 z-10 space-y-1.5">
        <div>
          <p
            className={`font-serif tracking-[0.25em] font-bold ${config.foilColor} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight`}
            style={{ fontSize: size === "sm" ? "11px" : size === "md" ? "14px" : "17px" }}
          >
            पासपोर्ट
          </p>
          <p
            className={`tracking-[0.38em] font-extrabold uppercase ${config.foilColor} drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-sans`}
            style={{ fontSize: size === "sm" ? "10px" : size === "md" ? "13px" : "15px" }}
          >
            PASSPORT
          </p>
        </div>

        {/* Official ICAO Biometric e-Passport Chip Symbol */}
        <div className="flex justify-center pt-1">
          <svg
            viewBox="0 0 40 24"
            className={size === "sm" ? "w-6 h-3.5" : size === "md" ? "w-8 h-4.5" : "w-10 h-6"}
            fill="none"
          >
            {/* Outer Rounded Gold Stamped Rectangle */}
            <rect
              x="2"
              y="2"
              width="36"
              height="20"
              rx="3"
              stroke={config.emblemFill}
              strokeWidth="2.2"
            />
            {/* Center Horizontal Bridge Line */}
            <line
              x1="2"
              y1="12"
              x2="38"
              y2="12"
              stroke={config.emblemFill}
              strokeWidth="2.2"
            />
            {/* Central Microchip Embedded Circle */}
            <circle
              cx="20"
              cy="12"
              r="4.5"
              fill={type === "OFFICIAL" ? "#f8fafc" : type === "DIPLOMATIC" ? "#2c040c" : "#091224"}
              stroke={config.emblemFill}
              strokeWidth="2.2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
