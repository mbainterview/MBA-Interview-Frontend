"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSchools } from "@/services/schools.service";
import type { School } from "@/types/domain";
import { cn } from "@/lib/utils";
import { SchoolLogo } from "./school-logo";

interface SchoolPickerProps {
  value: string;
  onChange: (schoolId: string, school?: School) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function SchoolPicker({
  value,
  onChange,
  placeholder = "Select a school…",
  className,
  triggerClassName,
}: SchoolPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSchools({ limit: 100 });
  const schools = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return schools;
    const q = search.toLowerCase();
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.abbreviation?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q),
    );
  }, [schools, search]);

  const selected = schools.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-12 min-w-[280px] items-center justify-between gap-3 rounded-[12px] border border-[#bebebe] bg-white px-3 text-left text-[14px] text-[#272727]",
          triggerClassName,
        )}
      >
        {selected ? (
          <span className="flex items-center gap-2 truncate">
            <SchoolLogo school={selected} size={28} />
            <span className="truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="text-[#9ea1c5]">{placeholder}</span>
        )}
        <ChevronDown size={16} className="shrink-0 text-[#868686]" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "w-[min(480px,calc(100vw-32px))] rounded-[12px] border-[0.4px] border-[#b3b3b3] bg-white px-5 py-4 shadow-[0_20px_60px_rgba(15,11,56,0.12)]",
          className,
        )}
      >
        {/* Search bar — matches Figma node 875:2214 */}
        <div className="flex h-[60px] items-center gap-2 rounded-[16px] bg-[#f9fafb] py-0.5 pl-6 pr-8">
          <Search size={20} className="text-[#9ea1c5]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search here..."
            className="h-full flex-1 bg-transparent text-[18px] text-[#272727] placeholder:text-[#868686] focus:outline-none"
            autoFocus
          />
        </div>

        {/* List — gap-4 between rows to match Figma */}
        <div className="mt-4 max-h-[480px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[14px] text-[#9ea1c5]">
              <Loader2 size={16} className="animate-spin" /> Loading schools…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-[14px] text-[#9ea1c5]">
              No schools match &ldquo;{search}&rdquo;
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {filtered.map((school) => {
                const isSelected = school.id === value;
                return (
                  <li key={school.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(school.id, school);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-[8px] py-1 text-left transition-colors hover:bg-[#f4f4fe]",
                        isSelected && "bg-[#eeeefe]",
                      )}
                    >
                      <SchoolLogo school={school} size={40} />
                      <span className="truncate text-[16px] font-medium leading-[1.3] text-[#272727]">
                        {school.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
