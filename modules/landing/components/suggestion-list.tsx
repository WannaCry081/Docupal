import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SuggestionListProps {
  suggestions: string[];
  activeIndex: number;
  onSelect: (topic: string) => void;
}

export function SuggestionList({ suggestions, activeIndex, onSelect }: SuggestionListProps) {
  return (
    <Command shouldFilter={false}>
      <CommandList>
        <CommandGroup>
          {suggestions.map((topic, index) => (
            <CommandItem
              key={topic}
              value={topic}
              className={cn(index === activeIndex && "bg-muted text-foreground")}
              onSelect={() => onSelect(topic)}
            >
              {topic}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
