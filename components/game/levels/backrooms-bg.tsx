import React from "react";

export default function BackroomsBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <img
        src="/game backgrounds/Backrooms.png"
        alt="Backrooms Background"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}
