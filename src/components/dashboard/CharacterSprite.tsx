"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ASSETS, PERSONA_POSES } from "@/lib/constants";
import { PERSONAS } from "@/lib/personas";
import { PersonaKey } from "@/lib/types";

export type SpriteState = "idle" | "active" | "working" | "celebrate";

interface CharacterSpriteProps {
  personaId: PersonaKey;
  state: SpriteState;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  position: { x: number; y: number };
  isHovered?: boolean;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  personaId,
  state,
  onClick,
  onMouseEnter,
  onMouseLeave,
  position,
  isHovered = false,
}) => {
  const [randomDelay, setRandomDelay] = useState("-0.5s");

  useEffect(() => {
    // Stagger idle breathe animation so they don't all bob in sync
    const delay = -(Math.random() * 0.9 + 0.3).toFixed(2);
    setRandomDelay(`${delay}s`);
  }, []);

  const persona = PERSONAS[personaId];
  const poseName = PERSONA_POSES[personaId][state] || PERSONA_POSES[personaId].idle;
  const imageSrc = ASSETS.pose(personaId, poseName);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Buka percakapan dengan ${persona.name}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transition: "left 700ms cubic-bezier(0.22,1,0.36,1), top 700ms cubic-bezier(0.22,1,0.36,1)",
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karsa-gold rounded-full"
    >
      <div
        className="relative sprite-idle-motion flex flex-col items-center"
        style={{ animationDelay: randomDelay }}
      >
        {/* Name Tag Above Sprite — Absolute positioned so it never displaces sprite feet */}
        <div
          className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 opacity-90 group-hover:opacity-100 transition-opacity px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-bold text-slate-100 flex items-center gap-1 sm:gap-1.5 shadow-lg whitespace-nowrap pointer-events-none z-30"
          style={{ borderColor: isHovered ? `${persona.accentColor}80` : undefined }}
        >
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: persona.accentColor }}
          />
          <span>{persona.name}</span>
        </div>

        {/* Character Image Sprite */}
        <div
          className="relative transition-transform duration-300 group-hover:scale-105"
          style={{
            width: "4.5vw",
            height: "5.8vw",
            minWidth: "48px",
            minHeight: "62px",
            maxWidth: "90px",
            maxHeight: "116px",
            filter: isHovered
              ? `drop-shadow(0 0 8px ${persona.accentColor}99) drop-shadow(0_10px_15px_rgba(0,0,0,0.6))`
              : "drop-shadow(0 10px 15px rgba(0,0,0,0.6))",
          }}
        >
          <Image
            src={imageSrc}
            alt={`${persona.name} (${state})`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 60px, 90px"
            priority
          />
        </div>

        {/* Status Bubble Badge Below Sprite */}
        <div
          className="mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 px-2.5 py-1 rounded-xl bg-slate-900/90 border text-[10px] italic shadow-xl pointer-events-none max-w-[150px] text-center truncate"
          style={{
            borderColor: `${persona.accentColor}50`,
            color: persona.accentColor,
          }}
        >
          {persona.statusText}
        </div>
      </div>
    </div>
  );
};
