"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Image from "next/image";

import {
  deleteProductImageAction,
  reorderProductImagesAction,
  uploadProductImagesAction,
  type ActionState,
} from "@/app/actions";
import { Button } from "./button";
import { ImageDropzone } from "./image-dropzone";

const initialState: ActionState = {};

type ProductImage = { id: string; url: string; alt?: string | null };

export function AdminProductImages({
  productId,
  images,
  maxImages,
  allowUpload = true,
}: {
  productId: string;
  images: ProductImage[];
  maxImages: number;
  allowUpload?: boolean;
}) {
  const [state, action, pending] = useActionState(uploadProductImagesAction, initialState);
  const remaining = maxImages - images.length;

  const [items, setItems] = useState<ProductImage[]>(images);
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isSaving, startTransition] = useTransition();

  // Синхронизируемся с сервером после загрузки/удаления/ревалидации
  // (паттерн «корректировки состояния во время рендера» вместо эффекта).
  const signature = images.map((image) => image.id).join(",");
  const [prevSignature, setPrevSignature] = useState(signature);
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setItems(images);
  }

  function handleDrop(targetIndex: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from === null || from === targetIndex) return;

    moveImage(from, targetIndex);
  }

  function moveImage(from: number, targetIndex: number) {
    if (from === targetIndex || targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setItems(next);
    startTransition(() => reorderProductImagesAction(productId, next.map((image) => image.id)));
  }

  return (
    <div className="grid gap-4 border border-black bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Изображения товара</h2>
        {isSaving ? <span className="text-xs font-black uppercase text-zinc-500">Сохраняем порядок…</span> : null}
      </div>
      {items.length ? (
        <>
          <p className="text-sm text-zinc-600">Перетащите изображение, чтобы изменить порядок. Первое — главное.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOverIndex(index);
                }}
                onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
                onDrop={() => handleDrop(index)}
                className={`group relative aspect-square cursor-grab overflow-hidden border active:cursor-grabbing ${
                  overIndex === index ? "border-[var(--accent)] ring-2 ring-[var(--accent)]" : "border-black"
                }`}
              >
                <Image src={image.url} alt={image.alt ?? ""} fill draggable={false} className="object-cover" />
                {index === 0 ? (
                  <span className="absolute left-1 top-1 bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-black uppercase">
                    Главное
                  </span>
                ) : null}
                <span className="absolute right-1 top-1 bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-white">
                  {index + 1}
                </span>
                <div className="absolute inset-y-0 left-1 right-1 z-10 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center border border-black bg-white text-xs font-black disabled:opacity-40"
                    aria-label="Сдвинуть изображение левее"
                    title="Сдвинуть левее"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === items.length - 1}
                    className="flex h-7 w-7 items-center justify-center border border-black bg-white text-xs font-black disabled:opacity-40"
                    aria-label="Сдвинуть изображение правее"
                    title="Сдвинуть правее"
                  >
                    →
                  </button>
                </div>
                <form
                  action={deleteProductImageAction}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/0 p-1 opacity-0 transition duration-150 group-hover:bg-black/40 group-hover:opacity-100"
                >
                  <input type="hidden" name="id" value={image.id} />
                  <Button variant="danger" className="px-3 py-1 text-xs">
                    Удалить
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-zinc-600">Изображений пока нет — товар будет показан с заглушкой.</p>
      )}
      {allowUpload && remaining > 0 ? (
        <form action={action} className="grid gap-2 border-t border-black pt-4">
          <input type="hidden" name="productId" value={productId} />
          <ImageDropzone
            name="images"
            multiple
            label={`Загрузить с компьютера (осталось ${remaining} из ${maxImages})`}
          />
          {state.message ? <p className="text-sm font-bold">{state.message}</p> : null}
          <Button disabled={pending} variant="secondary" className="w-fit">
            {pending ? "Загружаем…" : "Загрузить"}
          </Button>
        </form>
      ) : allowUpload ? (
        <p className="border-t border-black pt-4 text-sm text-zinc-600">Достигнут лимит в {maxImages} изображений.</p>
      ) : null}
    </div>
  );
}
