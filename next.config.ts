import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Разрешаем внешние https-картинки (логотипы брендов / hero по URL из админки).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: {
      // Загрузка изображений (слайды + фон, до 6 фото товара) превышает дефолтный лимит 1 МБ.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
