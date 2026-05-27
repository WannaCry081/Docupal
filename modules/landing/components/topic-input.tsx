"use client";

import { useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

import { SUGGESTED_TOPIC_CONTENT } from "../constants/suggested-topic-content";
import { getSuggestions } from "../constants/tutorialspoint-topics";
import { useAddTopic } from "../hooks/use-add-topic";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useQueueUrlSync } from "../hooks/use-queue-url-sync";
import { SuggestionList } from "./suggestion-list";

export const TopicSelector = () => {
  const [input, setInput] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const drawerInputRef = useRef<HTMLInputElement>(null);
  const { addAndVerify } = useAddTopic();
  const isMobile = useIsMobile();

  useQueueUrlSync();

  const suggestions = getSuggestions(input);
  const hasSuggestions = suggestions.length > 0;

  const handleSubmit = (name?: string) => {
    const topic = name ?? input;
    setOpen(false);
    setInput("");
    setActiveIndex(-1);
    addAndVerify(topic);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(hasSuggestions && activeIndex >= 0 ? suggestions[activeIndex] : undefined);
    } else if (e.key === "Escape") {
      setOpen(false);
      setInput("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    }
  };

  const baseInputProps = {
    placeholder: "Tutorialspoint topic",
    value: input,
    autoComplete: "off" as const,
    onKeyDown: handleKeyDown,
  };

  return (
    <section className="relative z-10 px-5 sm:px-10 pb-24">
      <div className="w-full sm:max-w-xl mx-auto">
        {isMobile ? (
          <>
            <InputGroup className="bg-white dark:bg-muted shadow-xs px-2 h-12 rounded-full">
              <InputGroupInput
                {...baseInputProps}
                readOnly
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="default"
                  className="p-4 rounded-full text-xs"
                  onClick={() => setOpen(true)}
                >
                  Add & Verify
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <Drawer
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  setInput("");
                  setActiveIndex(-1);
                }
              }}
            >
              <DrawerContent>
                <div className="px-4 pb-4">
                  <InputGroup className="bg-white dark:bg-muted shadow-xs px-2 h-12 rounded-full mb-3">
                    <InputGroupInput
                      {...baseInputProps}
                      ref={drawerInputRef}
                      autoFocus
                      onChange={(e) => {
                        setInput(e.target.value);
                        setActiveIndex(-1);
                      }}
                    />
                  </InputGroup>

                  {hasSuggestions && (
                    <ul className="flex flex-col">
                      {suggestions.map((topic, index) => (
                        <li key={topic}>
                          <button
                            className={cn(
                              "w-full text-left px-3 py-2.5 text-sm rounded-lg",
                              index === activeIndex
                                ? "bg-muted text-foreground"
                                : "hover:bg-muted/60",
                            )}
                            onPointerDown={(e) => e.preventDefault()}
                            onClick={() => handleSubmit(topic)}
                          >
                            {topic}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <Popover open={open && hasSuggestions} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
              <InputGroup className="bg-white dark:bg-muted shadow-xs px-2 h-12 rounded-full">
                <InputGroupInput
                  {...baseInputProps}
                  onFocus={() => {
                    if (hasSuggestions) setOpen(true);
                  }}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setActiveIndex(-1);
                    setOpen(true);
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant="default"
                    className="p-4 rounded-full text-xs"
                    onClick={() => handleSubmit()}
                  >
                    Add & Verify
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </PopoverAnchor>

            <PopoverContent
              align="start"
              sideOffset={8}
              className="p-0 w-(--radix-popper-anchor-width)"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SuggestionList
                suggestions={suggestions}
                activeIndex={activeIndex}
                onSelect={handleSubmit}
              />
            </PopoverContent>
          </Popover>
        )}

        <div className="flex flex-wrap justify-center gap-1.5 mt-4">
          {SUGGESTED_TOPIC_CONTENT.map(({ id, title, body }) => (
            <button
              key={id}
              onClick={() => {
                setInput(body ?? title.toLowerCase());
                if (isMobile) setOpen(true);
              }}
            >
              <Badge variant="secondary">{title}</Badge>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
