import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Введите имя"),
  email: z.email("Введите корректный email").toLowerCase(),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .regex(/[A-Za-zА-Яа-я]/, "Добавьте букву")
    .regex(/\d/, "Добавьте цифру"),
});

export const loginSchema = z.object({
  email: z.email("Введите корректный email").toLowerCase(),
  password: z.string().min(1, "Введите пароль"),
});

export const addressSchema = z.object({
  city: z.string().trim().min(2, "Укажите город"),
  street: z.string().trim().min(2, "Укажите улицу"),
  house: z.string().trim().min(1, "Укажите дом"),
  apartment: z.string().trim().optional(),
  zipCode: z.string().trim().min(4, "Укажите индекс"),
});

export const productSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]),
  countryOfOrigin: z.string().trim().optional().nullable(),
  material: z.string().trim().optional().nullable(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  isPublished: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isRecommended: z.coerce.boolean().default(false),
});

export const heroSlideSchema = z.object({
  eyebrow: z.string().trim().optional().default(""),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().min(1),
  image: z.string().trim().min(1),
  background: z.string().trim().min(1),
  ctaHref: z.string().trim().min(1),
  ctaLabel: z.string().trim().min(1),
  isActive: z.coerce.boolean().default(true),
});
