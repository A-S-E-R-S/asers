"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  { src: "/images/display/optimized/1.jpg", alt: "Student presenting research to a full auditorium" },
  { src: "/images/display/optimized/2.jpg", alt: "Student presenting a research project on stage" },
  { src: "/images/display/optimized/3.jpg", alt: "Students celebrating with awards after the symposium" },
  { src: "/images/display/optimized/4.jpg", alt: "Students receiving certificates on stage" },
  { src: "/images/display/optimized/5.jpg", alt: "Researchers and judges visiting poster presentations" },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6000);
    slides.slice(1).forEach((slide) => {
      const image = new window.Image();
      image.src = slide.src;
    });
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const move = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <div className="relative">
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-brand-dark">
        <Image
          src={slides[active].src}
          alt={slides[active].alt}
          fill
          priority={active === 0}
          unoptimized
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
        <p className="absolute bottom-3 left-4 text-xs font-medium uppercase tracking-[0.08em] text-white">NJSRS in action</p>
      </div>
      <div className="flex items-center bg-brand">
        <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className="flex h-14 w-16 items-center justify-center border-r border-white/30 text-white transition hover:bg-brand-dark sm:h-[62px] sm:w-[78px]">
          <span className="h-3 w-3 rotate-45 border-b-2 border-l-2 border-white" aria-hidden="true" />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button key={slide.src} type="button" aria-label={"Show photo " + (index + 1)} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} className={"h-2.5 w-2.5 rounded-full border border-white transition " + (index === active ? "bg-white" : "bg-transparent hover:bg-white/60")} />
          ))}
        </div>
        <button type="button" aria-label="Next photo" onClick={() => move(1)} className="flex h-14 w-16 items-center justify-center border-l border-white/30 text-white transition hover:bg-brand-dark sm:h-[62px] sm:w-[78px]">
          <span className="h-3 w-3 -rotate-[135deg] border-b-2 border-l-2 border-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
