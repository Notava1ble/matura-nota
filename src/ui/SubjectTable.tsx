import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDownUp } from "lucide-react";
import { useMemo, useState } from "react";
import { formatNumber } from "../lib/stats";
import type { SubjectMetric } from "../types/data";

export function SubjectTable({ subjects }: { subjects: SubjectMetric[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "averageGrade", desc: true }]);

  const columns = useMemo<ColumnDef<SubjectMetric>[]>(
    () => [
      {
        accessorKey: "subject",
        header: "Lenda",
        cell: (info) => <span className="font-semibold text-[#16201d]">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: "averageGrade",
        header: "Nota mes.",
        cell: (info) => formatNumber(info.getValue<number>()),
      },
      {
        accessorKey: "medianGrade",
        header: "Mediana",
        cell: (info) => formatNumber(info.getValue<number>()),
      },
      {
        accessorKey: "passRate",
        header: "Kalueshmeria",
        cell: (info) => `${formatNumber(info.getValue<number>())}%`,
      },
      {
        accessorKey: "topGradeShare",
        header: "Nota 10",
        cell: (info) => `${formatNumber(info.getValue<number>())}%`,
      },
      {
        accessorKey: "trend",
        header: "Trend",
        cell: (info) => {
          const value = info.getValue<number>();
          return <span className={value >= 0 ? "text-[#1c7c74]" : "text-[#b44b35]"}>{value >= 0 ? "+" : ""}{formatNumber(value)}%</span>;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: subjects,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-[#e4dece] text-[#68746f]">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="inline-flex items-center gap-2 hover:text-[#16201d]"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <ArrowDownUp size={14} aria-hidden="true" />
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-[#eee8da] last:border-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="number-font px-3 py-3 text-[#30423d]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
