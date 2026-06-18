import { describe, expect, it } from "vitest";

import {
  buildInitialProductImages,
  buildInitialProductVariants,
  getProductDeletionPlan,
  shouldShowPostCreationControls,
  parseProductDetails,
  parseInitialProductSetup,
  reorderFiles,
} from "./admin-product";

function imageFile(name: string) {
  return new File(["image"], name, { type: "image/jpeg" });
}

describe("initial product setup", () => {
  it("hides extra upload and size forms on the post-creation confirmation page", () => {
    expect(shouldShowPostCreationControls(true)).toBe(false);
    expect(shouldShowPostCreationControls(false)).toBe(true);
  });

  it("physically deletes unordered products after clearing cart items", () => {
    expect(getProductDeletionPlan({ orderItems: 0, cartItems: 2 })).toEqual({
      archive: false,
      clearCartItems: true,
    });
  });

  it("archives products that already appear in orders", () => {
    expect(getProductDeletionPlan({ orderItems: 1, cartItems: 2 })).toEqual({
      archive: true,
      clearCartItems: false,
    });
  });

  it("accepts a filled short product description", () => {
    const formData = new FormData();
    formData.set("title", "Test Shoe");
    formData.set("slug", "test-shoe");
    formData.set("description", "Кожа");
    formData.set("price", "1200");
    formData.set("discountPrice", "");
    formData.set("gender", "UNISEX");
    formData.set("brandId", "brand-1");
    formData.set("categoryId", "category-1");
    formData.set("isPublished", "on");

    expect(parseProductDetails(formData)).toMatchObject({
      ok: true,
      data: {
        description: "Кожа",
        price: 1200,
        discountPrice: null,
      },
    });
  });

  it("returns a field-specific message for missing required product details", () => {
    const formData = new FormData();
    formData.set("title", "A");
    formData.set("slug", "");
    formData.set("description", "");
    formData.set("price", "");
    formData.set("brandId", "");
    formData.set("categoryId", "");

    expect(parseProductDetails(formData)).toEqual({
      ok: false,
      message: "Название — минимум 2 символа",
    });
  });

  it("requires at least one image when creating a product", () => {
    const formData = new FormData();
    formData.set("colorId", "color-1");
    formData.append("sizes", "42");

    expect(parseInitialProductSetup(formData, 6)).toEqual({
      ok: false,
      message: "Добавьте хотя бы одно изображение товара",
    });
  });

  it("requires at least one size when creating a product", () => {
    const formData = new FormData();
    formData.append("images", imageFile("shoe.jpg"));
    formData.set("colorId", "color-1");

    expect(parseInitialProductSetup(formData, 6)).toEqual({
      ok: false,
      message: "Выберите хотя бы один размер",
    });
  });

  it("rejects more than the maximum number of images", () => {
    const formData = new FormData();
    formData.set("colorId", "color-1");
    formData.append("sizes", "42");
    formData.append("images", imageFile("1.jpg"));
    formData.append("images", imageFile("2.jpg"));
    formData.append("images", imageFile("3.jpg"));

    expect(parseInitialProductSetup(formData, 2)).toEqual({
      ok: false,
      message: "Можно загрузить максимум 2 изображений",
    });
  });

  it("reorders selected image files before upload", () => {
    const front = imageFile("front.jpg");
    const side = imageFile("side.jpg");
    const heel = imageFile("heel.jpg");

    expect(reorderFiles([front, side, heel], 2, 0).map((file) => file.name)).toEqual([
      "heel.jpg",
      "front.jpg",
      "side.jpg",
    ]);
  });

  it("builds images and variants for a complete one-step product creation", () => {
    const formData = new FormData();
    formData.append("images", imageFile("front.jpg"));
    formData.append("images", imageFile("side.jpg"));
    formData.set("colorId", "color-1");
    formData.append("sizes", "41");
    formData.append("sizes", "42");
    formData.set("inStock", "on");

    const parsed = parseInitialProductSetup(formData, 6);

    expect(parsed).toMatchObject({
      ok: true,
      colorId: "color-1",
      sizes: ["41", "42"],
      inStock: true,
    });
    if (!parsed.ok) throw new Error(parsed.message);

    expect(buildInitialProductImages("Кроссовки", ["/uploads/front.jpg", "/uploads/side.jpg"])).toEqual([
      { url: "/uploads/front.jpg", alt: "Кроссовки", position: 0 },
      { url: "/uploads/side.jpg", alt: "Кроссовки", position: 1 },
    ]);
    expect(buildInitialProductVariants("product-1", parsed.colorId, parsed.sizes, parsed.inStock)).toEqual([
      { colorId: "color-1", size: "41", inStock: true, sku: "PRODUCT-1-COLOR-1-41" },
      { colorId: "color-1", size: "42", inStock: true, sku: "PRODUCT-1-COLOR-1-42" },
    ]);
  });
});
