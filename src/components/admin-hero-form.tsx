"use client";

import { useActionState } from "react";
import Image from "next/image";

import { saveHeroSlideAction, type ActionState } from "@/app/actions";
import { Button } from "./button";
import { ImageDropzone } from "./image-dropzone";

const initialState: ActionState = {};

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  background: string;
  ctaHref: string;
  ctaLabel: string;
  isActive: boolean;
};

function isImagePath(value?: string) {
  return !!value && (value.startsWith("/") || value.startsWith("http"));
}

export function AdminHeroForm({ slide }: { slide?: Slide }) {
  const [state, action, pending] = useActionState(saveHeroSlideAction, initialState);

  return (
    <form action={action} className="grid gap-3 border border-black bg-white p-5">
      <h2 className="text-2xl font-black">{slide ? `Слайд: ${slide.title}` : "Новый слайд"}</h2>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <Input label="Над заголовком" name="eyebrow" defaultValue={slide?.eyebrow} />
      <Input label="Заголовок" name="title" defaultValue={slide?.title} />
      <label className="grid gap-1 text-sm font-black uppercase">
        Подзаголовок
        <textarea
          name="subtitle"
          defaultValue={slide?.subtitle}
          className="min-h-20 border border-black p-3 text-base font-normal normal-case"
        />
      </label>

      <fieldset className="grid gap-2 border border-black p-3">
        <legend className="px-1 text-sm font-black uppercase">Изображение (анимированный объект)</legend>
        {isImagePath(slide?.image) ? (
          <div className="relative aspect-square w-24 overflow-hidden border border-black">
            <Image src={slide!.image} alt="" fill className="object-contain p-2" sizes="96px" />
          </div>
        ) : null}
        <Input label="URL изображения" name="image" defaultValue={slide?.image ?? "/products/placeholder.svg"} />
        <ImageDropzone name="imageFile" label="…или перетащите файл" helperText="Заменит URL выше при сохранении" />
      </fieldset>

      <fieldset className="grid gap-2 border border-black p-3">
        <legend className="px-1 text-sm font-black uppercase">Фон слайда</legend>
        <Input
          label="CSS-фон или путь к картинке"
          name="background"
          defaultValue={slide?.background ?? "linear-gradient(135deg, #101010, #2a2a2a)"}
        />
        <ImageDropzone name="backgroundFile" label="…или перетащите фон" helperText="Заменит фон выше при сохранении" />
      </fieldset>

      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Ссылка кнопки" name="ctaHref" defaultValue={slide?.ctaHref ?? "/catalog"} />
        <Input label="Текст кнопки" name="ctaLabel" defaultValue={slide?.ctaLabel ?? "Смотреть"} />
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm font-black uppercase">
        <input name="isActive" type="checkbox" defaultChecked={slide?.isActive ?? true} /> Активен
      </label>
      {state.message ? <p className="font-bold">{state.message}</p> : null}
      <Button disabled={pending}>{slide ? "Сохранить изменения" : "Создать слайд"}</Button>
    </form>
  );
}

function Input(props: React.ComponentProps<"input"> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="grid gap-1 text-sm font-black uppercase">
      {label}
      <input className="min-h-11 border border-black px-3 text-base font-normal normal-case" {...inputProps} />
    </label>
  );
}
