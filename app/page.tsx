import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NoiseTexture } from "@/components/ui/noise-texture";

import { Footer } from "@/modules/landing/components/footer";
import { NavBar } from "@/modules/landing/components/navbar";

import { HOW_IT_WORKS_CONTENT } from "@/modules/landing/constants/how-it-works-content";
import { FAQS_CONTENT } from "@/modules/landing/constants/faqs-content";
import { QueuePanel } from "@/modules/landing/components/queue-panel";
import { TopicSelector } from "@/modules/landing/components/topic-input";
import { FadeIn } from "@/components/shared/fade-in";

export default function Page() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <NoiseTexture noiseOpacity={0.2} />
      <NavBar />

      <main className="mx-auto max-w-3xl">
        <FadeIn>
          <section className="px-5 sm:px-10 mt-12 sm:mt-20 mb-8">
            <div className="w-full sm:max-w-xl mx-auto text-center space-y-3">
              <h1 className="text-2xl sm:text-4xl">
                Get TutorialsPoint PDFs instantly.
              </h1>
              <p className="text-muted-foreground text-sm">
                A small utility for grabbing tutorial PDFs from TutorialsPoint —
                with availability checks and a downloadable queue.
              </p>
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <TopicSelector />
        </FadeIn>

        <FadeIn>
          <QueuePanel />
        </FadeIn>

        <FadeIn>
          <section id="how-it-works" className="px-5 sm:px-10 pb-20">
            <h2 className="text-lg mb-6 font-medium">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {HOW_IT_WORKS_CONTENT.map(({ id, title, body }, index) => (
                <div key={`${index}-${title}`}>
                  <span className="text-sm text-muted-foreground font-mono block mb-2">
                    {id}
                  </span>
                  <h3 className="mb-2 font-medium">{title}</h3>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <section
            id="frequently-asked-questions"
            className="px-5 sm:px-10 pb-20"
          >
            <h2 className="text-lg mb-6 font-medium">FAQs</h2>
            <div>
              {FAQS_CONTENT.map(({ id, title, body }, index) => (
                <Accordion
                  key={`${index}-${title}`}
                  type="single"
                  collapsible
                  defaultValue={`item-${id}`}
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="underline-offset-4">
                      {title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </section>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
