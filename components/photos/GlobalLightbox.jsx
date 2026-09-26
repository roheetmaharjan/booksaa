"use client";

import { useEffect } from "react";
import "glightbox/dist/css/glightbox.css";

export default function GlobalLightbox() {
  useEffect(() => {
    let lightbox;

    const initLightbox = async () => {
      const { default: GLightbox } = await import("glightbox");

      lightbox = GLightbox({
        selector: ".glightbox",
        touchNavigation: true,
        loop: true,
        zoomable: true,
      });
    };

    initLightbox();

    return () => {
      lightbox?.destroy();
    };
  }, []);

  return null;
}