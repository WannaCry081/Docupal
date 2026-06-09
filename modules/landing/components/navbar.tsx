import Link from "next/link";
import Image from "next/image";

import { GITHUB_REPOSITORY_URL } from "@/lib/constants/site-config";

export const NavBar = () => {
  return (
    <header className="mx-auto max-w-3xl px-5 py-6 sm:py-8 sm:px-10 w-full">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-center gap-2 font-bold"
        >
          <Image
            src="/SVG/icon.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span className="inline-block">Docupal</span>
        </Link>

        <ul className="inline-flex items-center gap-4 text-sm">
          <li>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground"
            >
              How
            </Link>
          </li>
          <li>
            <Link
              href="#frequently-asked-questions"
              className="text-muted-foreground hover:text-foreground"
            >
              FAQ
            </Link>
          </li>
          <li>
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
          </li>
        </ul>
      </nav>
    </header>
  );
};
