"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

function getPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total - 1, total];
  if (current >= total - 2) return [1, 2, "...", total - 2, total - 1, total];
  return [1, 2, "...", current, "...", total - 1, total];
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AdminPaginationProps) {
  const pages = getPages(currentPage, totalPages);

  return (
    <div className="flex w-full items-center justify-between px-6 pb-4 pt-3">
      <button
        type="button"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-1 rounded-lg border border-[#bebebe] bg-white px-3 py-2 font-body text-[14px] font-semibold text-[#272727] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon icon="mdi:arrow-left" width={20} height={20} />
        <span className="px-0.5">Previous</span>
      </button>

      <div className="flex items-start gap-0.5">
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="grid size-10 place-items-center font-body text-[14px] font-medium text-[#868686]"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange?.(p)}
              className={cn(
                "grid size-10 place-items-center rounded-lg font-body text-[14px] font-medium transition-colors",
                p === currentPage
                  ? "bg-[#fafafa] text-[#272727]"
                  : "text-[#868686] hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 rounded-lg border border-[#bebebe] bg-white px-3 py-2 font-body text-[14px] font-semibold text-[#272727] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="px-0.5">Next</span>
        <Icon icon="mdi:arrow-right" width={20} height={20} />
      </button>
    </div>
  );
}
