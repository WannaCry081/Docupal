"use client";

import { useState } from "react";

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
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { SUGGESTED_TOPIC_CONTENT } from "../constants/suggested-topic-content";
import { getSuggestions } from "../constants/tutorialspoint-topics";
import { useAddTopic } from "../hooks/use-add-topic";
import { useQueueUrlSync } from "../hooks/use-queue-url-sync";

export const TopicSelector = () => {
  const [input, setInput] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { addAndVerify } = useAddTopic();

  useQueueUrlSync();

  const suggestions = getSuggestions(input);

  const submit = (name?: string) => {
    const topic = (name ?? input).trim();
    if (!topic) return;
    setPopoverOpen(false);
    setInput("");
    addAndVerify(topic);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") {
      setInput("");
      setPopoverOpen(false);
    }
  };

  return (
    <section className="relative z-10 px-5 sm:px-10 pb-24">
      <div className="w-full sm:max-w-xl mx-auto">
        <Popover
          open={popoverOpen && suggestions.length > 0}
          onOpenChange={setPopoverOpen}
        >
          <PopoverAnchor asChild>
            <InputGroup className="bg-white dark:bg-muted shadow-xs px-2 h-12 rounded-full">
              <InputGroupInput
                placeholder="Tutorialspoint topic"
                value={input}
                autoComplete="off"
                onFocus={() => setPopoverOpen(true)}
                onChange={(e) => {
                  setInput(e.target.value);
                  setPopoverOpen(true);
                }}
                onKeyDown={onKeyDown}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="default"
                  className="p-4 rounded-full text-xs"
                  onClick={() => submit()}
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
            <Command shouldFilter={false}>
              <CommandList>
                <CommandGroup>
                  {suggestions.map((s) => (
                    <CommandItem key={s} value={s} className="cursor-pointer" onPointerDown={(e) => { e.preventDefault(); submit(s); }}>
                      {s}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap justify-center gap-1.5 mt-4">
          {SUGGESTED_TOPIC_CONTENT.map(({ id, title, body }) => (
            <button
              key={id}
              onClick={() => setInput(body ?? title.toLowerCase())}
            >
              <Badge variant="secondary">{title}</Badge>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
