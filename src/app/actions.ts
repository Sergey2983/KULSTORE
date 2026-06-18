"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "../../auth";
import {
  buildInitialProductImages,
  buildInitialProductVariants,
  getProductDeletionPlan,
  parseProductDetails,
  parseInitialProductSetup,
} from "@/lib/admin-product";
import { requireAdmin, requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { addressSchema, heroSlideSchema, loginSchema, registerSchema } from "@/lib/validations";
import {
  assertEnoughStock,
  generateOrderNumber,
  getEffectivePrice,
  ORDER_STATUS_LABELS,
  type AppOrderStatus,
} from "@/lib/order";
import { createPayment } from "@/lib/payments";
import { applyPaymentStatus } from "@/lib/payments/finalize";
import { calculateCheckoutTotals } from "@/lib/payments/totals";

export type ActionState = {
  ok?: boolean;
  message?: string;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Проверьте форму" };
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { message: "Пользователь с таким email уже существует" };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
      cart: { create: {} },
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/catalog",
  });

  return { ok: true };
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });

  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Проверьте форму" };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: formString(formData, "callbackUrl") || "/catalog",
    });
  } catch (error) {
    if (error instanceof AuthError) return { message: "Неверный email или пароль" };
    throw error;
  }

  return { ok: true };
}

export async function addToCartAction(formData: FormData) {
  const user = await requireUser();
  const variantId = formString(formData, "variantId");
  const quantity = Math.max(1, Number(formString(formData, "quantity") || 1));

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant || !variant.inStock) {
    throw new Error("Выбранного размера нет в наличии");
  }

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId, quantity },
  });

  revalidatePath("/cart");
  redirect("/cart?added=1");
}

export async function addToCartQuickAction(variantId: string): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant || !variant.inStock) {
    return { ok: false, message: "Выбранного размера нет в наличии" };
  }

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: 1 } },
    create: { cartId: cart.id, variantId, quantity: 1 },
  });

  revalidatePath("/cart");
  return { ok: true, message: `«${variant.product.title}» (${variant.size}) добавлен в корзину` };
}

export async function updateCartItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = formString(formData, "itemId");
  const quantity = Number(formString(formData, "quantity"));
  // Меняем только позицию из корзины текущего пользователя (защита от чужих itemId).
  if (quantity < 1) {
    await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { userId: user.id } } });
  } else {
    await prisma.cartItem.updateMany({
      where: { id: itemId, cart: { userId: user.id } },
      data: { quantity },
    });
  }
  revalidatePath("/cart");
}

export async function checkoutAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsedAddress = addressSchema.safeParse({
    city: formString(formData, "city"),
    street: formString(formData, "street"),
    house: formString(formData, "house"),
    apartment: formString(formData, "apartment"),
    zipCode: formString(formData, "zipCode"),
  });
  if (!parsedAddress.success) return { message: parsedAddress.error.issues[0]?.message ?? "Проверьте адрес" };

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: { color: true, product: true },
          },
        },
      },
    },
  });

  if (!cart?.items.length) return { message: "Корзина пуста" };
  assertEnoughStock(
    cart.items.map((item) => ({
      title: item.variant.product.title,
      size: item.variant.size,
      inStock: item.variant.inStock,
      quantity: item.quantity,
    })),
  );

  const totals = calculateCheckoutTotals(
    cart.items.map((item) => ({
      price: getEffectivePrice(item.variant.product),
      quantity: item.quantity,
    })),
  );

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      ...parsedAddress.data,
    },
  });

  const orderNumber = generateOrderNumber(new Date(), Math.floor(Date.now() % 10000));
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      addressId: address.id,
      totalAmount: totals.total,
      items: {
        create: cart.items.map((item) => ({
          productId: item.variant.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: getEffectivePrice(item.variant.product),
        })),
      },
    },
  });

  let payment;
  try {
    payment = await createPayment({ orderId: order.id, orderNumber, amount: totals.total });
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Не удалось создать платёж" };
  }

  if (!payment.confirmationUrl) {
    return { message: "Платёжный провайдер не вернул ссылку на оплату" };
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      amount: totals.total,
      confirmationUrl: payment.confirmationUrl,
      rawPayload: payment.rawPayload as never,
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  redirect(payment.confirmationUrl);
}

async function getOwnedMockPayment(providerPaymentId: string) {
  const user = await requireUser();
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId },
    include: { order: true },
  });

  if (!payment || payment.provider !== "mock" || payment.order.userId !== user.id) {
    throw new Error("Тестовый платёж не найден");
  }

  return payment;
}

export async function confirmMockPaymentAction(formData: FormData) {
  const payment = await getOwnedMockPayment(formString(formData, "providerPaymentId"));

  await applyPaymentStatus(payment.id, "succeeded", {
    id: payment.providerPaymentId,
    status: "succeeded",
    test: true,
    provider: "mock",
  });

  revalidatePath("/profile");
  revalidatePath("/profile/orders");
  revalidatePath("/admin/orders");
  redirect(`/checkout/success?order=${payment.order.orderNumber}`);
}

export async function cancelMockPaymentAction(formData: FormData) {
  const payment = await getOwnedMockPayment(formString(formData, "providerPaymentId"));

  await applyPaymentStatus(payment.id, "canceled", {
    id: payment.providerPaymentId,
    status: "canceled",
    test: true,
    provider: "mock",
  });

  revalidatePath("/profile");
  revalidatePath("/profile/orders");
  revalidatePath("/admin/orders");
  redirect(`/checkout/fail?order=${payment.order.orderNumber}`);
}

export async function saveProductAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseProductDetails(formData);
  if (!parsed.ok) return { message: parsed.message };

  const id = formString(formData, "id");
  const data = {
    ...parsed.data,
    discountPrice: parsed.data.discountPrice || null,
  };
  const initialSetup = id ? null : parseInitialProductSetup(formData, MAX_PRODUCT_IMAGES);
  if (initialSetup?.ok === false) return { message: initialSetup.message };

  let product;
  const savedImageUrls: string[] = [];
  try {
    if (id) {
      product = await prisma.product.update({ where: { id }, data });
    } else {
      if (!initialSetup?.ok) return { message: "Проверьте изображения и размеры товара" };
      for (const file of initialSetup.files) {
        savedImageUrls.push(await saveUploadedFile(file));
      }
      product = await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({ data });
        await tx.productImage.createMany({
          data: buildInitialProductImages(created.title, savedImageUrls).map((image) => ({
            ...image,
            productId: created.id,
          })),
        });
        await tx.productVariant.createMany({
          data: buildInitialProductVariants(created.id, initialSetup.colorId, initialSetup.sizes, initialSetup.inStock).map((variant) => ({
            ...variant,
            productId: created.id,
          })),
        });
        return created;
      });
    }
  } catch (error) {
    await deleteUploadedFiles(savedImageUrls);
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
      return { message: "Товар с таким URL-адресом (slug) уже существует — укажите другой" };
    }
    throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${product.id}`);
  revalidatePath("/catalog");
  revalidatePath(`/product/${product.slug}`);

  if (!id) redirect(`/admin/products/${product.id}?created=1`);
  return { ok: true, message: "Товар сохранён" };
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");

  // Товар, который уже встречается в заказах, нельзя удалить физически — иначе сломается
  // история заказов (FK RESTRICT на OrderItem). В этом случае снимаем его с публикации.
  const [orderedCount, cartItemCount] = await Promise.all([
    prisma.orderItem.count({ where: { productId: id } }),
    prisma.cartItem.count({ where: { variant: { productId: id } } }),
  ]);
  const deletionPlan = getProductDeletionPlan({ orderItems: orderedCount, cartItems: cartItemCount });
  if (deletionPlan.archive) {
    await prisma.product.update({ where: { id }, data: { isPublished: false } });
  } else {
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { variant: { productId: id } } }),
      prisma.product.delete({ where: { id } }),
    ]);
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect(deletionPlan.archive ? "/admin/products?archived=1" : "/admin/products?deleted=1");
}

export async function saveVariantAction(formData: FormData) {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const colorId = formString(formData, "colorId");
  const size = formString(formData, "size");
  const inStock = formData.has("inStock");
  const sku = formString(formData, "sku");

  await prisma.productVariant.upsert({
    where: { productId_colorId_size: { productId, colorId, size } },
    update: { inStock, sku },
    create: { productId, colorId, size, inStock, sku },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog");
}

export async function addProductSizesAction(formData: FormData) {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const colorId = formString(formData, "colorId");
  const inStock = formData.has("inStock");
  const sizes = formData
    .getAll("sizes")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!productId || !colorId || !sizes.length) {
    revalidatePath(`/admin/products/${productId}`);
    return;
  }

  for (const size of sizes) {
    // Тройка (productId, colorId, size) уникальна — производный SKU тоже гарантированно уникален.
    const sku = `${productId}-${colorId}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    await prisma.productVariant.upsert({
      where: { productId_colorId_size: { productId, colorId, size } },
      update: { inStock },
      create: { productId, colorId, size, inStock, sku },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog");
}

export async function toggleVariantStockAction(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const productId = formString(formData, "productId");
  const inStock = formData.has("inStock");
  await prisma.productVariant.update({ where: { id }, data: { inStock } });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog");
}

export async function deleteVariantAction(formData: FormData) {
  await requireAdmin();
  await prisma.productVariant.delete({ where: { id: formString(formData, "id") } });
  revalidatePath("/admin/products");
}

const MAX_PRODUCT_IMAGES = 6;
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function saveUploadedFile(file: File): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function deleteUploadedFiles(urls: string[]) {
  await Promise.all(
    urls.map(async (url) => {
      if (url.startsWith("/uploads/")) {
        await unlink(path.join(process.cwd(), "public", url)).catch(() => {});
      }
    }),
  );
}

export async function uploadProductImagesAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const existingCount = await prisma.productImage.count({ where: { productId } });
  const freeSlots = MAX_PRODUCT_IMAGES - existingCount;
  if (freeSlots <= 0) return { message: `Уже загружено максимум ${MAX_PRODUCT_IMAGES} изображений` };

  const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!files.length) return { message: "Выберите файлы изображений" };

  const toSave = files.slice(0, freeSlots);
  const created = [];
  for (const file of toSave) {
    const url = await saveUploadedFile(file);
    created.push({ productId, url, alt: product.title, position: existingCount + created.length });
  }
  await prisma.productImage.createMany({ data: created });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog");
  revalidatePath(`/product/${product.slug}`);
  return { ok: true, message: "Изображения загружены" };
}

export async function reorderProductImagesAction(productId: string, orderedIds: string[]) {
  await requireAdmin();
  if (!productId || !orderedIds.length) return;

  await prisma.$transaction(
    orderedIds.map((id, position) =>
      prisma.productImage.update({ where: { id }, data: { position } }),
    ),
  );

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog");
  if (product) revalidatePath(`/product/${product.slug}`);
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const image = await prisma.productImage.findUnique({ where: { id }, include: { product: true } });
  if (!image) return;
  await prisma.productImage.delete({ where: { id } });
  if (image.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", image.url)).catch(() => {});
  }
  revalidatePath(`/admin/products/${image.productId}`);
  revalidatePath("/catalog");
  revalidatePath(`/product/${image.product.slug}`);
}

export async function saveDictionaryAction(formData: FormData) {
  await requireAdmin();
  const type = formString(formData, "type");
  const name = formString(formData, "name");
  const slug = formString(formData, "slug");
  if (type === "brand") {
    const logoFile = formData.get("logoFile");
    const logoUrl =
      logoFile instanceof File && logoFile.size > 0
        ? await saveUploadedFile(logoFile)
        : formString(formData, "logoUrl") || undefined;
    await prisma.brand.upsert({
      where: { slug },
      update: { name, ...(logoUrl ? { logoUrl } : {}) },
      create: { name, slug, ...(logoUrl ? { logoUrl } : {}) },
    });
  }
  if (type === "category") {
    await prisma.category.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  }
  revalidatePath("/admin");
  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function saveHeroSlideAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const imageFile = formData.get("imageFile");
  const backgroundFile = formData.get("backgroundFile");
  const image =
    imageFile instanceof File && imageFile.size > 0
      ? await saveUploadedFile(imageFile)
      : formString(formData, "image");
  const background =
    backgroundFile instanceof File && backgroundFile.size > 0
      ? await saveUploadedFile(backgroundFile)
      : formString(formData, "background");

  const parsed = heroSlideSchema.safeParse({
    eyebrow: formString(formData, "eyebrow"),
    title: formString(formData, "title"),
    subtitle: formString(formData, "subtitle"),
    image,
    background,
    ctaHref: formString(formData, "ctaHref"),
    ctaLabel: formString(formData, "ctaLabel"),
    isActive: formData.has("isActive"),
  });
  if (!parsed.success) return { message: "Проверьте поля слайда" };

  const id = formString(formData, "id");
  if (id) {
    await prisma.heroSlide.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.heroSlide.create({ data: parsed.data });
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
  return { ok: true, message: "Слайд сохранён" };
}

export async function deleteHeroSlideAction(formData: FormData) {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id: formString(formData, "id") } });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  const status = formString(formData, "status") as AppOrderStatus;

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as never },
  });

  await prisma.notification.create({
    data: {
      userId: order.userId,
      orderId: order.id,
      message: `Статус заказа ${order.orderNumber}: ${ORDER_STATUS_LABELS[status] ?? status}`,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/profile");
  revalidatePath("/profile/notifications");
}

export async function deleteOrderAction(formData: FormData) {
  await requireAdmin();
  await prisma.order.delete({ where: { id: formString(formData, "id") } });
  revalidatePath("/admin/orders");
  revalidatePath("/profile/orders");
  redirect("/admin/orders");
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/notifications");
}
