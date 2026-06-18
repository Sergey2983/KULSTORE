# KULSTORE

Рабочий MVP интернет-магазина обуви на Next.js App Router, TypeScript, Prisma/PostgreSQL, Auth.js Credentials и тестовой ЮKassa.

## Запуск

1. Создайте `.env` по примеру `.env.example`.
2. Укажите внешний PostgreSQL в `DATABASE_URL`.
3. Выполните:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

По умолчанию seed создаёт администратора:

- email: `admin@kulstore.local`
- пароль: `Admin12345`

Значения можно поменять через `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD`.

## Основные маршруты

- `/` — главная Street editorial витрина KULSTORE
- `/catalog` и `/catalog/[categorySlug]` — каталог с query-фильтрами
- `/product/[slug]` — карточка товара
- `/cart`, `/checkout` — корзина и оформление заказа
- `/login`, `/register` — Auth.js Credentials
- `/profile/orders` — история заказов покупателя
- `/admin` — админ-панель для роли `ADMIN`

## Проверки

```bash
npm test
npm run lint
npm run build
```

Приложение целиком рендерится динамически (`force-dynamic` в корневом layout), поэтому
`npm run build` не подключается к базе. `DATABASE_URL` нужен только как валидная строка
для `prisma generate`:

```powershell
$env:DATABASE_URL='postgresql://user:password@localhost:5432/kulstore'; npm run build
```

## Деплой

Готовый Docker-деплой (приложение + PostgreSQL) с пошаговой инструкцией под TimeWeb
(Ubuntu) — в [DEPLOY.md](DEPLOY.md). Кратко:

```bash
cp .env.production.example .env.production   # заполнить пароли/секреты/домен
docker compose up -d --build                 # миграции и сид применятся автоматически
```

## ЮKassa

Checkout создаёт реальный тестовый платёж через API ЮKassa. Нужны:

- `YOOKASSA_SHOP_ID`
- `YOOKASSA_SECRET_KEY`
- `NEXT_PUBLIC_BASE_URL`

Если ключей нет, форма checkout вернёт русскоязычную ошибку конфигурации. Webhook принимает `payment.succeeded` и `payment.canceled`, повторно проверяет платёж через API ЮKassa и идемпотентно списывает остатки только при первом успешном статусе.
