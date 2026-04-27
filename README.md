# Longqing Trade

Corporate website for ООО «Шаньдун Лунцин Интернэшнл Трейдинг».

## Stack

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS v4
- next-intl for `ru`, `zh`, `en`
- Static JSON/MDX content

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/en`.

## Useful Commands

```bash
npm run typecheck
npm run build
```

## Content

- Brands: `content/brands.json`
- Services: `content/services.json`
- Geography: `content/geography.json`
- News: `content/news/*.mdx`

## Legal Tone

Do not describe the company as an official, authorized, certified partner, dealer, or distributor of any manufacturer. Use neutral wording: compatible equipment, independent supply, and repair/service for equipment of named manufacturers.

## Deployment

Production target: Timeweb Cloud VPS with Docker, Nginx reverse proxy, and Let's Encrypt SSL.
