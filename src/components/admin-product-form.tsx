"use client";

import { useActionState, useState } from "react";

import { saveProductAction, type ActionState } from "@/app/actions";
import { SIZE_OPTIONS } from "@/lib/sizes";
import { Button } from "./button";
import { ImageDropzone } from "./image-dropzone";

const initialState: ActionState = {};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string | number | { toString(): string };
  discountPrice?: string | number | { toString(): string } | null;
  brandId: string;
  categoryId: string;
  gender: string;
  countryOfOrigin?: string | null;
  material?: string | null;
  isFeatured: boolean;
  isRecommended: boolean;
  isPublished: boolean;
};

type Color = {
  id: string;
  name: string;
};

export function AdminProductForm({
  product,
  brands,
  categories,
  colors = [],
}: {
  product?: Product;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  colors?: Color[];
}) {
  const [state, action, pending] = useActionState(saveProductAction, initialState);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());

  function toggleSize(size: string) {
    setSelectedSizes((current) => {
      const next = new Set(current);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  return (
    <form action={action} className="grid gap-3 border border-black bg-white p-5 transition-shadow duration-200 focus-within:shadow-[6px_6px_0_#101010]">
      <h2 className="text-2xl font-black">{product ? "Редактировать товар" : "Создать товар"}</h2>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <Input label="Название" name="title" defaultValue={product?.title} />
      <Input label="URL-адрес (латиницей)" name="slug" placeholder="napr-nike-air-max" defaultValue={product?.slug} />
      <label className="grid gap-1 text-sm font-black uppercase">
        Описание
        <textarea
          name="description"
          defaultValue={product?.description}
          className="min-h-28 border border-black p-3 text-base font-normal normal-case transition-colors duration-150 focus:border-[var(--accent)]"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Цена" name="price" type="number" step="0.01" defaultValue={product?.price?.toString()} />
        <Input label="Цена со скидкой" name="discountPrice" type="number" step="0.01" defaultValue={product?.discountPrice?.toString() ?? ""} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Select label="Бренд" name="brandId" items={brands} defaultValue={product?.brandId} />
        <Select label="Категория" name="categoryId" items={categories} defaultValue={product?.categoryId} />
        <label className="grid gap-1 text-sm font-black uppercase">
          Пол
          <select
            name="gender"
            defaultValue={product?.gender ?? "UNISEX"}
            className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]"
          >
            <option value="UNISEX">Унисекс</option>
            <option value="MALE">Мужская</option>
            <option value="FEMALE">Женская</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Страна" name="countryOfOrigin" defaultValue={product?.countryOfOrigin ?? ""} />
        <Input label="Состав" name="material" defaultValue={product?.material ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm font-black uppercase">
        <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured} /> Хит продаж
      </label>
      <label className="flex items-center gap-2 text-sm font-black uppercase">
        <input name="isRecommended" type="checkbox" defaultChecked={product?.isRecommended} /> Рекомендуемое
      </label>
      <label className="flex items-center gap-2 text-sm font-black uppercase">
        <input name="isPublished" type="checkbox" defaultChecked={product?.isPublished ?? true} /> Опубликован
      </label>
      {!product ? (
        <section className="grid gap-4 border-t border-black pt-4">
          <ImageDropzone
            name="images"
            multiple
            label="Изображения товара"
            helperText="Обязательно: от 1 до 6 изображений. Первое станет главным."
          />

          <label className="grid gap-1 text-sm font-black uppercase">
            Цвет
            <select
              name="colorId"
              defaultValue={colors[0]?.id ?? ""}
              className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]"
            >
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-sm font-black uppercase">Размеры (RU) — выберите нужные</p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {SIZE_OPTIONS.map((size) => {
                const active = selectedSizes.has(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    aria-pressed={active}
                    className={`flex h-11 items-center justify-center border text-sm font-black transition duration-150 ${
                      active ? "border-black bg-[var(--accent)]" : "border-zinc-300 bg-white hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {[...selectedSizes].map((size) => (
              <input key={size} type="hidden" name="sizes" value={size} />
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm font-black uppercase">
            <input type="checkbox" name="inStock" defaultChecked className="h-5 w-5 accent-[var(--accent)]" />
            В наличии
          </label>
        </section>
      ) : null}
      {state.message ? (
        <p role="alert" className="border border-red-600 bg-red-50 p-3 text-sm font-bold text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending}>{product ? "Сохранить изменения" : "Создать товар"}</Button>
    </form>
  );
}

function Input(props: React.ComponentProps<"input"> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="grid gap-1 text-sm font-black uppercase">
      {label}
      <input
        className="min-h-11 border border-black px-3 text-base font-normal normal-case transition-colors duration-150 focus:border-[var(--accent)]"
        {...inputProps}
      />
    </label>
  );
}

function Select({ label, name, items, defaultValue }: { label: string; name: string; items: { id: string; name: string }[]; defaultValue?: string }) {
  return (
    <label className="grid gap-1 text-sm font-black uppercase">
      {label}
      <select name={name} defaultValue={defaultValue} className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]">
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
    </label>
  );
}
