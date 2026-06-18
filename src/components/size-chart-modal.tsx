"use client";

import { useEffect, useState } from "react";
import { Ruler, X } from "lucide-react";

import { SIZE_CHART } from "@/lib/sizes";

export function SizeChartModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-black uppercase underline-offset-4 hover:underline"
      >
        <Ruler size={16} /> Таблица размеров
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Таблица размеров"
            className="animate-fade-in flex max-h-[85vh] w-full max-w-lg flex-col border border-black bg-white street-shadow"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black p-4">
              <h2 className="text-2xl font-black">Таблица размеров</h2>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
                className="border border-black p-1.5 transition-colors duration-150 hover:bg-black hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-black text-white">
                  <tr>
                    <th className="p-3">RU</th>
                    <th className="p-3">US</th>
                    <th className="p-3">UK</th>
                    <th className="p-3">См</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row.ru} className="border-t border-zinc-200">
                      <td className="p-3 font-black">{row.ru}</td>
                      <td className="p-3">{row.us}</td>
                      <td className="p-3">{row.uk}</td>
                      <td className="p-3">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-black p-3 text-xs text-zinc-500">
              Длина стопы (см) — самый точный ориентир. Измерьте стопу и выберите ближайший больший размер.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
