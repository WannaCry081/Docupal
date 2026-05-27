import Link from "next/link";
import Image from "next/image";

import { ModeToggle } from "@/components/shared/mode-toggle";

import { GITHUB_REPOSITORY_URL } from "@/lib/constants/site-config";

export const Footer = async () => {
  "use cache";

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-auto max-w-3xl mt-8 py-8 sm:py-10 border-t">
      <div className="px-5 sm:px-10 flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          © {currentYear} Docupal. All rights reserved.
        </div>
        <div className="inline-flex items-center gap-2">
          <Link
            href={GITHUB_REPOSITORY_URL}
            className="opacity-60 transition-opacity hover:opacity-100"
            aria-label="GitHub"
          >
            <Image
              src="/SVG/github.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              className="size-5 dark:invert"
            />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};
