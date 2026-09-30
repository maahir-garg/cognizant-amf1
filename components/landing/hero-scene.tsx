"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.09]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const routeScale = useTransform(scrollYProgress, [0, 0.8], [0.08, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden border-b border-line bg-bg"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <Image
          src="/brand/amr26-launch-quarter.jpg"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-[62%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-bg/30" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-y-0 left-[8%] w-px bg-line/70" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-line/35" />
        <div className="absolute inset-y-0 right-[8%] w-px bg-line/70" />
        <div className="absolute inset-x-0 top-[28%] h-px bg-line/50" />
        <motion.div
          style={{ scaleX: reduceMotion ? 1 : routeScale }}
          className="absolute inset-x-[8%] bottom-[15%] h-px origin-left bg-lime"
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-[1600px] flex-col px-4 pt-8 pb-6 sm:px-6 sm:pt-12 lg:px-10 lg:pt-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ y: reduceMotion ? 0 : copyY }}
          className="relative z-20"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-lime" aria-hidden />
            <p className="label text-ink-2">Aston Martin Aramco × Cognizant</p>
          </div>
          <h1 className="display mt-5 max-w-[12ch] text-[clamp(4.2rem,13.5vw,13rem)] leading-[0.78]">
            Follow
            <br />
            the car.
          </h1>
          <p className="mt-6 max-w-md bg-bg/90 p-4 text-base leading-relaxed text-ink-2 sm:text-lg lg:ml-[9%] lg:max-w-lg">
            From the factory floor to the circuit and beyond race day, see how the team&apos;s published environmental and social
            impact travels with the car.
          </p>
        </motion.div>

        <div className="relative z-20 mt-auto grid gap-5 bg-bg/90 p-4 sm:grid-cols-[auto_1fr] sm:items-end sm:p-5 lg:grid-cols-[auto_1fr_auto]">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/lap">
              Start the story <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Link
            href="/start"
            className="min-h-12 px-1 py-3 text-sm font-semibold text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink sm:justify-self-start"
          >
            Personalise your view
          </Link>
          <a
            href="#route"
            className="hidden min-h-11 items-center gap-3 text-sm text-ink-3 transition-colors hover:text-ink lg:inline-flex"
          >
            Scroll to follow <ArrowDown className="size-4" aria-hidden />
          </a>
        </div>
      </div>

      <div className="absolute top-[28%] right-[8%] hidden -translate-y-full pb-3 text-right lg:block" aria-hidden>
        <p className="label">Factory</p>
        <p className="label mt-1 text-lime">Circuit bound</p>
      </div>
    </section>
  );
}
