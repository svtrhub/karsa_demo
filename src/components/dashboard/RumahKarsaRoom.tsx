"use client";

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useDemo } from "@/context/DemoContext";
import { ASSETS, STATIONS, HOME_SEATS } from "@/lib/constants";
import { PersonaKey } from "@/lib/types";
import { CharacterSprite, SpriteState } from "./CharacterSprite";
import { useCameraViewport } from "@/hooks/useCameraViewport";

const CoordCalibrationOverlay = dynamic(
  () => import("@/components/dev/CoordCalibrationOverlay"),
  { ssr: false }
);

const ALL_PERSONA_KEYS: PersonaKey[] = ["karsa", "ara", "radit", "sekar", "arka"];

export const RumahKarsaRoom: React.FC = () => {
  const { state, openChat } = useDemo();
  const activePersona = state.activePersona;

  const {
    viewportRef,
    isDragging,
    totalScale,
    finalTranslateX,
    finalTranslateY,
    isDragExceeded,
    eventHandlers,
  } = useCameraViewport({ activePersona });

  const handleSpriteClick = (key: PersonaKey) => {
    if (isDragExceeded()) return;
    openChat(key);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none z-0">
      {/* Fixed Cosmic Space Background Layer */}
      <Image
        src={ASSETS.spaceBg}
        alt="Space Background"
        fill
        priority
        unoptimized
        className="object-cover pointer-events-none select-none z-0"
      />

      {/* Camera Viewport (handles zoom and pan transform) */}
      <div
        ref={viewportRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
        {...eventHandlers}
      >
        {/*
          Room Master Container — fixed 16:9 native aspect ratio anchor canvas
        */}
        <div
          className="room-master absolute inset-0 w-full h-full"
          style={{
            transformOrigin: "0 0",
            transform: `translate3d(${finalTranslateX}px, ${finalTranslateY}px, 0px) scale(${totalScale})`,
            transition: isDragging ? "none" : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            imageRendering: "-webkit-optimize-contrast" as React.CSSProperties["imageRendering"],
          }}
        >
          {/* Transparent Floating Room Island Base Layer */}
          <Image
            src={ASSETS.roomInterior}
            alt="Rumah Karsa Interior"
            fill
            priority
            unoptimized
            className="object-contain pointer-events-none select-none"
          />


          {/* Character Sprites */}
          {ALL_PERSONA_KEYS.map((key) => {
            const isActive = activePersona === key;
            const isCelebrating = state.celebratingPersona === key;

            let spriteState: SpriteState = "idle";
            if (isCelebrating) spriteState = "celebrate";
            else if (isActive) spriteState = "active";

            const homePos = HOME_SEATS[key];
            const workPos = STATIONS[key];
            const position = isActive ? workPos : homePos;

            return (
              <CharacterSprite
                key={key}
                personaId={key}
                state={spriteState}
                position={{ x: position.x, y: position.y }}
                onClick={() => handleSpriteClick(key)}
              />
            );
          })}

          {/* Interactive Calibration Overlay (dev-only, requires ?calibrate=1 in URL) */}
          {process.env.NODE_ENV !== "production" && <CoordCalibrationOverlay />}
        </div>
      </div>
    </div>
  );
};
