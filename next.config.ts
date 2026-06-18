import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Пользовательские фото (товары, hero) загружаются в public/uploads уже ПОСЛЕ сборки,
    // а next start обслуживает только статику, существовавшую на момент build. Поэтому
    // отключаем встроенный оптимизатор: next/image отдаёт обычный <img> с исходным src,
    // а сами файлы из /uploads раздаёт Nginx напрямую с диска (см. deploy/nginx.conf.example).
    unoptimized: true,
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
