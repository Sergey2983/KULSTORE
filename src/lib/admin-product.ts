import { productSchema } from "./validations";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const productFieldMessages: Record<string, string> = {
  title: "Название — минимум 2 символа",
  slug: "URL-адрес — минимум 2 символа латиницей",
  description: "Описание обязательно",
  price: "Цена должна быть больше 0",
  discountPrice: "Цена со скидкой должна быть больше 0 или пустой",
  gender: "Выберите пол",
  brandId: "Выберите бренд",
  categoryId: "Выберите категорию",
};

export type ProductDetailsParseResult =
  | {
      ok: true;
      data: ReturnType<typeof productSchema.parse>;
    }
  | {
      ok: false;
      message: string;
    };

export type InitialProductSetup =
  | {
      ok: true;
      files: File[];
      colorId: string;
      sizes: string[];
      inStock: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export function parseProductDetails(formData: FormData): ProductDetailsParseResult {
  const parsed = productSchema.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug"),
    description: formString(formData, "description"),
    price: formString(formData, "price"),
    discountPrice: formString(formData, "discountPrice") || null,
    gender: formString(formData, "gender") || "UNISEX",
    countryOfOrigin: formString(formData, "countryOfOrigin") || null,
    material: formString(formData, "material") || null,
    brandId: formString(formData, "brandId"),
    categoryId: formString(formData, "categoryId"),
    isPublished: formData.has("isPublished"),
    isFeatured: formData.has("isFeatured"),
    isRecommended: formData.has("isRecommended"),
  });

  if (parsed.success) return { ok: true, data: parsed.data };

  const firstIssue = parsed.error.issues[0];
  const field = firstIssue?.path[0];
  const message =
    typeof field === "string" ? productFieldMessages[field] : undefined;
  return { ok: false, message: message ?? "Проверьте поля товара" };
}

export function shouldShowPostCreationControls(isPostCreationPage: boolean) {
  return !isPostCreationPage;
}

export function getProductDeletionPlan({
  orderItems,
  cartItems,
}: {
  orderItems: number;
  cartItems: number;
}) {
  if (orderItems > 0) {
    return { archive: true, clearCartItems: false };
  }

  return { archive: false, clearCartItems: cartItems > 0 };
}

export function parseInitialProductSetup(formData: FormData, maxImages: number): InitialProductSetup {
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0 && entry.type.startsWith("image/"));
  if (!files.length) return { ok: false, message: "Добавьте хотя бы одно изображение товара" };
  if (files.length > maxImages) return { ok: false, message: `Можно загрузить максимум ${maxImages} изображений` };

  const colorId = formData.get("colorId");
  if (typeof colorId !== "string" || !colorId) return { ok: false, message: "Выберите цвет товара" };

  const sizes = [
    ...new Set(
      formData
        .getAll("sizes")
        .filter((entry): entry is string => typeof entry === "string" && entry.length > 0),
    ),
  ];
  if (!sizes.length) return { ok: false, message: "Выберите хотя бы один размер" };

  return {
    ok: true,
    files,
    colorId,
    sizes,
    inStock: formData.has("inStock"),
  };
}

export function buildInitialProductImages(title: string, urls: string[]) {
  return urls.map((url, position) => ({ url, alt: title, position }));
}

export function buildInitialProductVariants(productId: string, colorId: string, sizes: string[], inStock: boolean) {
  return sizes.map((size) => ({
    colorId,
    size,
    inStock,
    sku: `${productId}-${colorId}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
  }));
}

export function reorderFiles<T>(files: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return files;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= files.length || toIndex >= files.length) return files;

  const next = [...files];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
