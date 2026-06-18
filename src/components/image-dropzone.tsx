"use client";

import { useEffect, useRef, useState } from "react";

import { reorderFiles } from "@/lib/admin-product";

type ImageDropzoneProps = {
  name: string;
  label: string;
  multiple?: boolean;
  accept?: string;
  helperText?: string;
};

type PreviewFile = {
  file: File;
  url: string;
};

export function ImageDropzone({
  name,
  label,
  multiple = false,
  accept = "image/*",
  helperText,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncInputFiles(files: File[]) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    for (const file of files) dt.items.add(file);
    inputRef.current.files = dt.files;
  }

  function showPreviews(files: FileList | File[] | null) {
    setPreviews((old) => {
      old.forEach((preview) => URL.revokeObjectURL(preview.url));
      if (!files) return [];
      return Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => ({ file, url: URL.createObjectURL(file) }));
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files;
    if (!dropped.length || !inputRef.current) return;

    const dt = new DataTransfer();
    const files = multiple ? Array.from(dropped) : [dropped[0]];
    for (const file of files) {
      if (file.type.startsWith("image/")) dt.items.add(file);
    }
    inputRef.current.files = dt.files;
    showPreviews(dt.files);
  }

  function handlePreviewDrop(targetIndex: number) {
    const fromIndex = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (fromIndex === null) return;

    movePreview(fromIndex, targetIndex);
  }

  function movePreview(fromIndex: number, targetIndex: number) {
    setPreviews((current) => {
      const next = reorderFiles(current, fromIndex, targetIndex);
      syncInputFiles(next.map((preview) => preview.file));
      return next;
    });
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-black uppercase">{label}</span>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed p-4 text-center text-sm transition-colors duration-150 ${
          dragActive ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-black bg-white hover:bg-zinc-50"
        }`}
      >
        <span className="font-bold">Перетащите {multiple ? "файлы" : "файл"} сюда</span>
        <span className="text-zinc-500">или нажмите, чтобы выбрать</span>
        {helperText ? <span className="text-xs text-zinc-500">{helperText}</span> : null}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={(event) => showPreviews(event.target.files)}
          className="hidden"
        />
      </div>
      {previews.length ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {previews.map((preview, index) => (
            <div
              key={preview.url}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOverIndex(index);
              }}
              onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handlePreviewDrop(index);
              }}
              className={`group relative aspect-square cursor-grab overflow-hidden border active:cursor-grabbing ${
                overIndex === index ? "border-[var(--accent)] ring-2 ring-[var(--accent)]" : "border-black"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt="" draggable={false} className="h-full w-full object-cover" />
              {index === 0 ? (
                <span className="absolute left-1 top-1 bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-black uppercase">
                  Главное
                </span>
              ) : null}
              <span className="absolute right-1 top-1 bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-white">
                {index + 1}
              </span>
              <div className="absolute inset-y-0 left-1 right-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    movePreview(index, index - 1);
                  }}
                  disabled={index === 0}
                  className="flex h-7 w-7 items-center justify-center border border-black bg-white text-xs font-black disabled:opacity-40"
                  aria-label="Сдвинуть изображение левее"
                  title="Сдвинуть левее"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    movePreview(index, index + 1);
                  }}
                  disabled={index === previews.length - 1}
                  className="flex h-7 w-7 items-center justify-center border border-black bg-white text-xs font-black disabled:opacity-40"
                  aria-label="Сдвинуть изображение правее"
                  title="Сдвинуть правее"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
