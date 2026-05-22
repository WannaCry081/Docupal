"use client";

import { PropsWithChildren } from "react";
import { ReactLenis } from "lenis/react";

import "lenis/dist/lenis.css";

export const LenisProvider = ({ children }: PropsWithChildren) => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
};
