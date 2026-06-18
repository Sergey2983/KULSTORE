import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

const ALL_ASSETS = [
  "/products/lime-runner.svg",
  "/products/mono-court.svg",
  "/products/red-drop.svg",
  "/products/placeholder.svg",
] as const;

const products = [
  ["Lime Runner 90", "lime-runner-90", "Лёгкие кроссовки для города с ярким лаймовым акцентом.", "Nike", "sneakers", "UNISEX", "/products/lime-runner.svg", 12990, 9990, "Вьетнам", "Текстиль, синтетика, резина"],
  ["Mono Court Low", "mono-court-low", "Минималистичные кеды для повседневных образов.", "Adidas", "sneakers", "UNISEX", "/products/mono-court.svg", 8990, null, "Камбоджа", "Натуральная кожа, резина"],
  ["Red Drop High", "red-drop-high", "Высокие кеды с контрастной подошвой и street-посадкой.", "Puma", "sneakers", "UNISEX", "/products/red-drop.svg", 10990, 8490, "Вьетнам", "Текстиль, резина"],
  ["Night Walk Boot", "night-walk-boot", "Городские ботинки для прохладной погоды.", "New Balance", "boots", "MALE", "/products/placeholder.svg", 14990, null, "Китай", "Нубук, текстиль, резина"],
  ["Soft Sandal Flux", "soft-sandal-flux", "Летние сандалии с мягкой анатомической стелькой.", "Crocs", "sandals", "UNISEX", "/products/placeholder.svg", 5990, 4990, "Вьетнам", "ЭВА (этиленвинилацетат)"],
  ["White Campus", "white-campus", "Белые кеды с плотным верхом и цепкой подошвой.", "Adidas", "sneakers", "FEMALE", "/products/mono-court.svg", 7990, null, "Индонезия", "Текстиль, резина"],
  ["Black Pulse", "black-pulse", "Чёрные кроссовки для активного дня и вечернего города.", "Nike", "sneakers", "MALE", "/products/lime-runner.svg", 11990, null, "Вьетнам", "Текстиль, синтетика, резина"],
  ["Retro 530", "retro-530", "Ретро-силуэт с современной амортизацией.", "New Balance", "sneakers", "UNISEX", "/products/placeholder.svg", 13990, 11990, "Китай", "Замша, текстиль, резина"],
  ["Slide Acid", "slide-acid", "Яркие шлёпанцы для лета, бассейна и быстрых выходов.", "Puma", "slides", "UNISEX", "/products/red-drop.svg", 3990, null, "Вьетнам", "ЭВА, резина"],
  ["Trail City", "trail-city", "Пара на стыке трейла и городского стиля.", "Salomon", "boots", "UNISEX", "/products/placeholder.svg", 15990, 12990, "Франция", "Текстиль, синтетика, резина"],
  ["Court Grey", "court-grey", "Серые кеды с лаконичным профилем.", "Adidas", "sneakers", "MALE", "/products/mono-court.svg", 8490, null, "Камбоджа", "Текстиль, резина"],
  ["Neon Step", "neon-step", "Акцентная пара для тех, кто любит заметные детали.", "Vans", "sneakers", "UNISEX", "/products/lime-runner.svg", 9990, 7990, "Китай", "Текстиль, резина"],
] as const;

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@kulstore.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Администратор KULSTORE",
      role: "ADMIN",
      passwordHash: await hash(adminPassword, 12),
      cart: { create: {} },
    },
  });

  const sportBrands = [
    "Nike",
    "Air Jordan / Jordan",
    "Adidas",
    "Yeezy",
    "New Balance",
    "ASICS",
    "Onitsuka Tiger",
    "Puma",
    "Vans",
    "Converse",
    "Under Armour",
    "Reebok",
    "Mizuno",
    "FILA",
    "Hoka One One",
    "Salomon",
    "Crocs",
    "Dr. Martens",
    "Li-Ning",
    "ANTA",
    "361°",
  ];
  const luxuryBrands = [
    "Balenciaga",
    "Gucci",
    "Louis Vuitton",
    "Alexander McQueen",
    "Prada",
    "Dior",
    "Maison Margiela",
    "Bottega Veneta",
    "Versace",
    "Burberry",
  ];
  // Бренды, для которых в public/brands есть стартовый логотип (карусель на главной).
  const brandsWithLogo = new Set([
    "nike",
    "adidas",
    "puma",
    "new-balance",
    "vans",
    "converse",
    "reebok",
    "asics",
    "under-armour",
    "fila",
    "salomon",
    "crocs",
    "air-jordan-jordan",
    "gucci",
    "balenciaga",
    "prada",
    "dior",
    "versace",
    "burberry",
    "louis-vuitton",
  ]);
  for (const [tier, names] of [["SPORT", sportBrands], ["LUXURY", luxuryBrands]] as const) {
    for (const name of names) {
      const slug = slugify(name);
      const logoUrl = brandsWithLogo.has(slug) ? `/brands/${slug}.svg` : null;
      await prisma.brand.upsert({
        where: { slug },
        update: { name, tier, logoUrl },
        create: { name, slug, tier, logoUrl },
      });
    }
  }

  const categories = [
    ["Кроссовки", "sneakers"],
    ["Ботинки", "boots"],
    ["Сандалии", "sandals"],
    ["Шлёпанцы", "slides"],
  ];
  for (const [name, slug] of categories) {
    await prisma.category.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  }

  const colors = [
    ["Чёрный", "#101010"],
    ["Белый", "#ffffff"],
    ["Лайм", "#dfff3f"],
    ["Красный", "#ff4d3d"],
    ["Синий", "#1d4ed8"],
    ["Голубой", "#38bdf8"],
    ["Зелёный", "#16a34a"],
    ["Серый", "#9ca3af"],
    ["Бежевый", "#e7d8b1"],
    ["Коричневый", "#7c4a1e"],
    ["Жёлтый", "#facc15"],
    ["Оранжевый", "#fb923c"],
    ["Розовый", "#f472b6"],
    ["Фиолетовый", "#7c3aed"],
    ["Бордовый", "#7f1d1d"],
    ["Тёмно-синий", "#1e293b"],
    ["Золотой", "#d4af37"],
    ["Серебряный", "#c0c0c0"],
    ["Хаки", "#78716c"],
    ["Бирюзовый", "#14b8a6"],
    ["Мятный", "#a7f3d0"],
    ["Индиго", "#4f46e5"],
    ["Лавандовый", "#c4b5fd"],
    ["Коралловый", "#ff7f50"],
    ["Персиковый", "#ffd7ba"],
    ["Олива", "#808000"],
    ["Изумрудный", "#10b981"],
    ["Небесный", "#7dd3fc"],
    ["Графитовый", "#374151"],
    ["Шоколадный", "#5c4033"],
    ["Песочный", "#f5deb3"],
    ["Малиновый", "#be123c"],
    ["Сливовый", "#6b21a8"],
    ["Лимонный", "#fde047"],
    ["Антрацит", "#1f2937"],
    ["Слоновая кость", "#fffff0"],
    ["Кирпичный", "#b45309"],
  ];
  for (const [name, hex] of colors) {
    await prisma.color.upsert({ where: { name }, update: { hex }, create: { name, hex } });
  }

  const allColors = await prisma.color.findMany();
  for (const [
    title,
    slug,
    description,
    brandName,
    categorySlug,
    gender,
    image,
    price,
    discountPrice,
    countryOfOrigin,
    material,
  ] of products) {
    const brand = await prisma.brand.findFirstOrThrow({ where: { name: brandName } });
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    const product = await prisma.product.upsert({
      where: { slug },
      update: { title, description, price, discountPrice, gender, countryOfOrigin, material, brandId: brand.id, categoryId: category.id, isPublished: true, isFeatured: discountPrice !== null },
      create: { title, slug, description, price, discountPrice, gender, countryOfOrigin, material, brandId: brand.id, categoryId: category.id, isPublished: true, isFeatured: discountPrice !== null },
    });

    const gallery = [image, ...ALL_ASSETS.filter((asset) => asset !== image)];
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: gallery.map((url, position) => ({ productId: product.id, url, alt: title, position })),
    });

    const colorA = allColors[title.length % allColors.length];
    const colorB = allColors[(title.length + 1) % allColors.length];
    for (const color of [colorA, colorB]) {
      for (const size of ["39", "40", "41", "42", "43"]) {
        const inStock = size !== "43";
        await prisma.productVariant.upsert({
          where: { productId_colorId_size: { productId: product.id, colorId: color.id, size } },
          update: { inStock },
          create: { productId: product.id, colorId: color.id, size, inStock, sku: `${slug}-${size}-${color.name}`.toUpperCase() },
        });
      }
    }
  }

  await prisma.brand.deleteMany({ where: { slug: "kulstore" } });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
