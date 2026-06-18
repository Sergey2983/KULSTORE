# Деплой KULSTORE на TimeWeb (Ubuntu + Docker)

Самый быстрый путь поднять магазин: VPS TimeWeb на Ubuntu, приложение и PostgreSQL —
в Docker, оплата в режиме **mock** (работает сразу, без договора с банком). Всё приложение
рендерится динамически, поэтому образ собирается без доступа к БД, а миграции и стартовые
данные применяются автоматически при первом запуске.

## Что уже готово в репозитории

- `Dockerfile` — сборка Next.js + Prisma.
- `docker-compose.yml` — два сервиса: `web` (приложение) и `db` (PostgreSQL 16) с томом данных.
- `docker-entrypoint.sh` — при старте применяет `prisma migrate deploy` и сид (идемпотентно).
- `.env.production.example` — шаблон переменных окружения.
- `deploy/nginx.conf.example` — конфиг обратного прокси + подсказка по HTTPS.

---

## 1. Создать сервер и привязать домен

1. В панели TimeWeb создайте **облачный сервер (VPS)**: Ubuntu 22.04/24.04, от 2 ГБ RAM.
2. В DNS домена создайте **A-запись** на IP сервера (`@` и при желании `www`).

## 2. Установить Docker (по SSH)

```bash
ssh root@IP_СЕРВЕРА
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

## 3. Получить код на сервер

```bash
# вариант с git:
git clone <URL_вашего_репозитория> kulstore
cd kulstore
```
(или загрузите файлы через `scp`).

## 4. Заполнить переменные окружения

```bash
cp .env.production.example .env.production
openssl rand -base64 32      # скопируйте результат в AUTH_SECRET
nano .env.production
```

Обязательно задайте:
- `POSTGRES_PASSWORD` — сложный пароль БД;
- `DATABASE_URL` — **тот же** пароль, хост остаётся `db` (имя сервиса), напр.
  `postgresql://postgres:ВАШ_ПАРОЛЬ@db:5432/kulstore_shop`;
- `AUTH_SECRET` — из `openssl rand`;
- `AUTH_URL` и `NEXT_PUBLIC_BASE_URL` — `https://ваш-домен.ru`;
- `AUTH_TRUST_HOST=true` (уже в шаблоне — нужно за Nginx);
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — смените пароль администратора.

## 5. Запустить

```bash
docker compose up -d --build
docker compose logs -f web      # видно: prisma migrate deploy → seeding → ready
```

Контейнер сам применит миграции и создаст: администратора, бренды, категории, цвета и
12 демо-товаров. Приложение слушает `127.0.0.1:3000` (наружу — только через Nginx, шаг 6).

Проверка до Nginx (с самого сервера): `curl -I http://127.0.0.1:3000` → `200 OK`.

## 6. Nginx + HTTPS

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/kulstore
sudo nano /etc/nginx/sites-available/kulstore     # впишите свой домен
sudo ln -s /etc/nginx/sites-available/kulstore /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Откройте `https://ваш-домен.ru` — магазин работает.

## 7. Проверить магазин

- Главная, каталог, карточка товара открываются.
- Регистрация → товар в корзину → оформление заказа → mock-оплата → «успешно».
- Вход в `/admin` под `SEED_ADMIN_EMAIL` — товары, заказы, hero-слайды.

---

## Эксплуатация

```bash
# Обновить версию (после git pull):
docker compose up -d --build

# Логи / статус:
docker compose logs -f web
docker compose ps

# Бэкап БД:
docker compose exec db pg_dump -U postgres kulstore_shop > backup_$(date +%F).sql

# Восстановление:
cat backup.sql | docker compose exec -T db psql -U postgres -d kulstore_shop
```

- Загруженные фото лежат в томе `./public/uploads` на хосте и переживают пересборку.
- После первого успешного сида можно выставить `SKIP_SEED=1` в `.env.production`, чтобы не
  переинициализировать демо-данные при каждом рестарте (upsert безопасен, но так быстрее).

## Подключить реальную ЮKassa (позже)

1. В `.env.production`: `PAYMENT_PROVIDER=yookassa`, заполнить `YOOKASSA_SHOP_ID` и
   `YOOKASSA_SECRET_KEY` боевыми значениями.
2. В кабинете ЮKassa указать webhook на
   `https://ваш-домен.ru/api/payments/yookassa/webhook` (события `payment.succeeded`,
   `payment.canceled`).
3. `docker compose up -d` (пересборка не требуется — меняются только переменные).

## Частые проблемы

- **`UntrustedHost` при входе** — не задан `AUTH_TRUST_HOST=true` или `AUTH_URL` не совпадает
  с доменом.
- **`web` падает с ошибкой подключения к БД** — пароль в `DATABASE_URL` не совпадает с
  `POSTGRES_PASSWORD`, либо при смене пароля остался старый том: `docker compose down -v`
  (внимание: удаляет данные) и заново `up`.
- **413 Request Entity Too Large при загрузке фото** — проверьте `client_max_body_size 12m`
  в конфиге Nginx.
