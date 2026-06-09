import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { NoiseTexture } from "@/components/ui/noise-texture";
import { NavBar } from "@/modules/landing/components/navbar";
import { Footer } from "@/modules/landing/components/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-dvh flex flex-col">
      <NoiseTexture noiseOpacity={0.2} />
      <NavBar />

      <main className="mx-auto max-w-3xl flex-1">
        <section className="px-5 sm:px-10 py-20 sm:py-44 flex items-center justify-center">
          <div className="w-full text-center space-y-6 max-w-lg">
            {/* Error Code */}
            <h1 className="space-y-2">
              <span className="text-6xl sm:text-8xl font-bold text-accent">
                404
              </span>
            </h1>

            {/* Heading */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                The page you're looking for doesn't exist. It might have been
                moved, deleted, or never existed in the first place.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/">
                <Button variant="default" className="w-full sm:w-auto gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return Home
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
