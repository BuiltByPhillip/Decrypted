# Decrypted

An extensible framework for creating interactive cryptographic protocol exercises, enabling users to learn by doing with real-time feedback.

**Live Demo:** [decrypted-chi.vercel.app](https://decrypted-chi.vercel.app)

## Overview

Decrypted allows educators to define cryptographic protocol exercises using a simple text-based Domain Specific Language (DSL). The framework parses these definitions into interactive UI components, supporting four exercise types:

- **Select** - Multiple choice questions
- **Construct** - Drag-and-drop expression building
- **Calculate** - Compute a numeric result from concrete values
- **Match** - Match protocol steps to their corresponding formulas

Educators write exercises in a built-in browser editor with live validation, and students work through them step by step.

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [Tailwind CSS 4](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - Type-safe API
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Neon](https://neon.tech) - Serverless Postgres
- [CodeMirror 6](https://codemirror.net) - In-browser DSL editor
- [dnd-kit](https://dndkit.com) - Drag-and-drop for construct exercises
- [Lucide React](https://lucide.dev/icons) - Icons

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Then fill in the values:
#   DATABASE_URL  — Postgres connection string (e.g. from Neon)
#   JWT_SECRET    — Secret key used to sign auth tokens

# Push database schema
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## DSL Example

```
protocol: Diffie-Hellman
define:
    type: select
    generator \elem {g, x, a, b}
    prime \elem {p, n, m, q}
    alice_secret \elem {a, s, x}
    bob_secret \elem {b, t, y}
step:
    description: Alice chooses secret {alice_secret}
    exercise:
        type: select
        prompt: Choose Alice's secret exponent
        options:
            - 1
            - 7
            - {prime}-1
            - {prime}-2
        answer: 7
step:
    description: Alice computes her public key A
    exercise:
        type: construct
        prompt: Construct the expression for Alice's public key A
        palette: ARITHMETIC_OPERATORS
        prefill: mod {prime}
        answer: {generator} ^ {alice_secret} mod {prime}
step:
    description: Alice computes the shared key
    exercise:
        type: calculate
        prompt: Compute the shared key when {alice_secret}=4, {bob_secret}=5, {prime}=23, {generator}=5
        answer: 12
```

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── editor/[slug]/          # DSL editor page
│   ├── exercise/[slug]/        # Student exercise page
│   ├── exercises/              # Exercise listing
│   ├── login/ register/        # Auth pages
│   ├── account/                # Account management
│   ├── survey/[exerciseId]/    # Post-exercise survey
│   ├── _components/
│   │   ├── exercises/          # Exercise type components
│   │   │   ├── construct/      # Drag-and-drop builder
│   │   │   ├── select/         # Multiple choice
│   │   │   ├── calculate/      # Numeric computation
│   │   │   └── match/          # Formula matching
│   │   ├── editor/             # CodeMirror DSL editor
│   │   ├── definition/         # Protocol definition display
│   │   └── landing/            # Landing page components
│   └── hooks/                  # DSL parser and expression utilities
├── server/                     # tRPC routers and database schema
├── components/                 # Reusable UI components
└── styles/                     # Global styles
```

## Commands

```bash
npm run dev          # Start dev server with Turbo
npm run build        # Production build
npm run check        # Lint + typecheck
npm run lint:fix     # Auto-fix lint issues
npm run format:write # Format with Prettier
npm run test         # Run tests
npm run db:studio    # Open Drizzle Studio
npm run db:push      # Push schema changes to DB
```

## Deployment

The application is deployed on [Vercel](https://vercel.com). Push to `main` to trigger automatic deployment.
