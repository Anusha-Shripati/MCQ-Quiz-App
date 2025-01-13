"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

export default function Custom404() {
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".error-title",
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
      .fromTo(
        ".error-message",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.5"
      )
      .fromTo(
        ".error-link",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-secondary text-secondary-foreground">
      <div className="text-center">
        <h1 className="error-title text-6xl font-bold mb-4 text-destructive">
          404
        </h1>
        <p className="error-message text-lg mb-6">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="error-link px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-opacity-90 transition"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

