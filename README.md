# Nodebase 🚧

> **⚠️ Work in Progress** — This project is actively under development. Features, APIs, and structure may change at any time.

Nodebase is a modern full-stack web application built with **Next.js 15**, **tRPC**, **Prisma**, and **PostgreSQL** — designed as a production-ready base for building scalable Node-powered applications with AI capabilities, background jobs, authentication, and real-time data.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router + Turbopack) |
| **Language** | TypeScript |
| **API Layer** | [tRPC v11](https://trpc.io) + [TanStack React Query](https://tanstack.com/query) |
| **Database ORM** | [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| **Database** | PostgreSQL (via `pg`) |
| **Authentication** | [better-auth](https://better-auth.com) |
| **AI** | [Vercel AI SDK](https://sdk.vercel.ai) + [Google AI](https://ai.google.dev) (`@ai-sdk/google`) |
| **Background Jobs** | [Inngest](https://www.inngest.com) |
| **Error Tracking** | [Sentry](https://sentry.io) (server + edge) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) + [Base UI](https://base-ui.com) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Linting/Formatting** | [Biome](https://biomejs.dev) |
| **Process Manager** | [mprocs](https://github.com/pvolok/mprocs) |

---

## 📁 Project Structure

```
nodebase/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── public/                 # Static assets
├── src/                    # Application source code
├── sentry.server.config.ts # Sentry server-side config
├── sentry.edge.config.ts   # Sentry edge runtime config
├── prisma.config.ts        # Prisma datasource config
├── next.config.ts          # Next.js configuration
├── biome.json              # Biome linter/formatter config
├── mprocs.yaml             # Multi-process runner config
└── components.json         # shadcn/ui components config
```

---

## ⚙️ Prerequisites

- **Node.js** >= 20
- **npm** (or pnpm / yarn / bun)
- **PostgreSQL** database

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/aarthi-kumari/nodebase.git
cd nodebase
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nodebase

# Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
```

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate dev

# Or push schema directly (dev only)
npx prisma db push
```

### 5. Start the development server

```bash
# Next.js only
npm run dev

# All services (Next.js + Inngest) via mprocs
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Auto-format with Biome |
| `npm run inngest:dev` | Start Inngest dev server |
| `npm run dev:all` | Run all services with mprocs |

---

## 🔑 Key Features (In Progress)

- [x] Next.js 15 App Router setup
- [x] tRPC API layer with TanStack Query
- [x] Prisma ORM with PostgreSQL
- [x] Authentication via better-auth
- [x] AI integration with Google AI (Vercel AI SDK)
- [x] Background job processing with Inngest
- [x] Error tracking with Sentry (server + edge)
- [x] Component library (shadcn/ui + Radix UI)
- [x] Form handling with React Hook Form + Zod
- [ ] Full UI implementation *(in progress)*
- [ ] API routes and data models *(in progress)*
- [ ] Deployment configuration *(planned)*

---

## 🗄️ Database

Prisma is configured with PostgreSQL via `pg` and `@prisma/adapter-pg`. The schema and migrations live in the `prisma/` directory.

```bash
# Open Prisma Studio (visual DB browser)
npx prisma studio

# Regenerate Prisma client after schema changes
npx prisma generate
```

---

## 🤖 AI Integration

This project uses the [Vercel AI SDK](https://sdk.vercel.ai) with the Google Generative AI provider (`@ai-sdk/google`). AI features are intended to be server-side, accessed via tRPC or Next.js Server Actions.

---

## ⚡ Background Jobs

[Inngest](https://www.inngest.com) handles background and scheduled tasks. Run the Inngest dev server alongside Next.js:

```bash
npm run dev:all   # uses mprocs to run both simultaneously
# or separately:
npm run dev
npm run inngest:dev
```

---

## 🐛 Error Monitoring

[Sentry](https://sentry.io) is configured for both server and edge runtime error tracking via `sentry.server.config.ts` and `sentry.edge.config.ts`. Set your `SENTRY_DSN` in `.env` to enable it.

---

## 📄 License

This project is currently private and under active development. License to be determined.

---

## 👩‍💻 Author

**Aarthi Kumari** — [@aarthi-kumari](https://github.com/aarthi-kumari)

---

> 🚧 **This README will be updated as the project progresses.**
