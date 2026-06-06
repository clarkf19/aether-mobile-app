# Aether

Aether is a multi-platform school campus management system that combines a modern web dashboard, mobile companion app, backend integrations, and AI-assisted workflows.

## Overview

This repository contains:

- A Next.js web application with student, faculty, and administrative workflows
- A React Native mobile app in `AetherMobile/`
- AI/copilot experimentation in `aether-copilot/`
- Backend and database support files for Supabase and custom APIs

## Key Features

- Leave request submission and approval flows
- Faculty role workflows for dean, HOD, HR, and teachers
- Issue reporting and tracking
- Room booking management
- Payment handling and receipts
- Student and teacher dashboards
- Certificate request support
- Real-time and offline-friendly data handling
- AI-assisted copilot UX for assisted interactions

## Repository Structure

- `app/` - Next.js App Router pages, layouts, and API endpoints
- `components/` - Shared UI components and application-specific widgets
- `components/ui/` - Design system primitives and reusable UI building blocks
- `hooks/` - Custom React hooks for mobile detection, realtime data, voice, and toast notifications
- `lib/` - Backend utilities, API handlers, Supabase helpers, PDF generation, room booking logic, and shared utilities
- `data/` - Static sample data used by the app
- `public/` - Static assets
- `styles/` - Global styles and CSS
- `AetherMobile/` - React Native mobile application sources
- `aether-copilot/` - Experimental AI copilot integration
- `BACKEND_README.md` / `BACKEND_COMPLETE_SETUP.md` / `BACKEND_FIXES_SUMMARY.md` - Backend-specific setup and implementation notes
- `SUPABASE_SCHEMA.sql` and SQL setup scripts - database schema and seed/setup scripts

## Getting Started

### Prerequisites

- Node.js (recommended current LTS)
- A package manager such as `npm` or `pnpm`
- Supabase account or compatible backend if the project uses Supabase

### Web App Setup

1. Clone the repository

```bash
git clone <repo-url>
cd aether_final
```

2. Install dependencies

```bash
npm install
# or
pnpm install
```

3. Configure environment variables

- Copy `.env.example` to `.env.local`
- Add any required Supabase, API, or app-specific variables

4. Start the development server

```bash
npm run dev
```

5. Open the application in your browser

- `http://localhost:3000`

### Mobile App Setup

The mobile app lives in `AetherMobile/`.

1. Change into the mobile folder

```bash
cd AetherMobile
```

2. Install mobile dependencies

```bash
npm install
# or
pnpm install
```

3. Run the mobile app using your preferred React Native workflow

```bash
npm run ios
# or
npm run android
```

> If your mobile app uses Expo or a custom React Native setup, follow the commands defined in `AetherMobile/package.json`.

## Backend and Database

- Database schema and setup scripts are available in `SUPABASE_SCHEMA.sql` and `lib/setup-*.sql`.
- Backend support files and server-side utilities are located in `lib/`.
- Use the backend docs in `BACKEND_README.md`, `BACKEND_COMPLETE_SETUP.md`, and `BACKEND_FIXES_SUMMARY.md` for detailed configuration guidance.

## Notes

- `next.config.mjs` and `postcss.config.mjs` configure the Next.js app and styling pipeline.
- `tsconfig.json` configures TypeScript for the repository.
- `components/ui/` contains reusable UI primitives used throughout the app.

## Contributing

- Review existing code in `app/`, `components/`, and `lib/` before adding features.
- Keep UI state and business logic separated where possible.
- Add or update environment documentation if new backend variables are required.

## License

- Add your project license here if applicable.
