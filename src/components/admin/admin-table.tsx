"use client";

import { ReactNode, useState } from "react";
import { AdminPagination } from "./admin-pagination";
import { cn } from "@/lib/utils";

export interface AdminColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Tailwind class for column width control */
  className?: string;
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  data: T[];
  pageSize?: number;
  rowKey: (row: T) => string;
  className?: string;
}

/**
 * Pixel-perfect admin table — 70px header, 72px rows, hairline borders.
 * For tables that need TanStack features, wrap shared/data-table.tsx instead.
 */
export function AdminTable<T>({
  columns,
  data,
  pageSize = 13,
  rowKey,
  className,
}: AdminTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = data.slice(start, start + pageSize);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] bg-white",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-17.5 border-b border-[#e6e6e6] bg-[#fafafa] px-6 py-3 text-left font-heading text-[16px] leading-5 text-[#272727]",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "h-18 border-b border-[#e6e6e6] px-6 py-4 align-middle font-body text-[16px] leading-5 text-[#272727]",
                      col.className
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center font-body text-[16px] text-[#868686]"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
