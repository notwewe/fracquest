<p align="center"><img src="https://socialify.git.ci/notwewe/fracquest/image?custom_language=Next.js&amp;language=1&amp;name=1&amp;pattern=Circuit+Board&amp;theme=Light" alt="project-image"></p>

<p id="description">FracQuest is an educational game designed to strengthen students’ understanding of fractions with a strong emphasis on mastering the Least Common Denominator (LCD). The game blends narrative-driven instruction with interactive practice to help Grade 6 students learn progressively and confidently. Players journey through a story-based world where each challenge reinforces core fraction concepts—identifying LCDs comparing fractions converting to equivalent fractions and applying these skills to solve problems.</p>
<br>
<h2>🚀 Demo</h2>

[https://fracquest.vercel.app/auth/login](https://fracquest.vercel.app/auth/login)

<br>
<h2>🧐 Features</h2>

Here're some of the project's best features:

*   Gamified Learning - Engages students through interactive challenges rewards and real-time feedback
*   Story Mode - Narrative-driven tutorials that introduce and reinforce fraction concepts
*   Game Mode - Interactive game that allow learners to practice applying the Least Common Denominator (LCD) and other fraction operations.
*   Leaderboards & Progress Tracking - Tracks individual performance and learning progress.
<br>

<h2>💻 Tech Stack</h2>
Frontend Framework

*   Next.js: 15.2.4
*   React: ^19.0.0
*   React DOM: ^19.0.0
*   TypeScript: ^5
  
Styling
*   TailwindCSS: ^3.4.1
*   tailwindcss-animate: ^1.0.7
*   PostCSS: ^8
  
Backend / Database
*   Supabase:
*   @supabase/ssr: ^0.6.1
*   @supabase/supabase-js: ^2.49.4
  
Deployment
*   Vercel


<br>
<h2>🛠️ Installation Steps:</h2>

---

# FracQuest Deployment Guide

This guide provides step-by-step instructions for setting up, running, and deploying **FracQuest**, including the backend (Supabase) and frontend (Next.js).

---

## Prerequisites

Before getting started, ensure you have:

* **Node.js** 18.x or higher
* **pnpm** package manager (`npm install -g pnpm`)
* **Supabase account**
* **Vercel account** (recommended) or any Node.js hosting platform

---

## Environment Variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Backend (Supabase)

### 1. Create a Supabase Project

* Go to [Supabase](https://supabase.com) and create a new project
* Note your **project URL** and **anon key** from Settings → API

### 2. Set Up Database Schema

* Navigate to the **SQL Editor** in your Supabase dashboard
* Run the migration files located in `/supabase/migrations/` **in order**

### 3. Configure Authentication

* Go to Authentication → Settings in Supabase Dashboard
* Configure preferred auth providers (Email, Google, etc.)
* Set up redirect URLs for your production domain

### 4. Set Up Row Level Security (RLS)

* Ensure **RLS policies** are enabled for all tables
* Review and apply policies from migration files

---

## Frontend (Next.js)

### Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

---

### Deploy to Vercel (Recommended)

1. **Connect Repository**

```bash
git push origin main
```

2. **Import to Vercel**

* Go to [Vercel](https://vercel.com)
* Click **New Project** and import your repository
* Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   In **Vercel project settings → Environment Variables**, add:

| Variable                        | Value                     |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key    |

4. **Deploy**

* Click **Deploy**
* Subsequent pushes to `main` automatically trigger deployments

---

### Deploy to Other Platforms

#### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Manual Deployment

```bash
# Build the application
pnpm build

# The output will be in the .next folder
# Upload to your hosting provider and run:
pnpm start
```

<br>

<h2>Dummy/Test Accounts</h2>
<table>
  <thead>
    <tr>
      <th>Email</th>
      <th>Password</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>test1@example.com</td>
      <td>password123</td>
    </tr>
    <tr>
      <td>test2@example.com</td>
      <td>password123</td>
    </tr>
    <tr>
      <td>test3@example.com</td>
      <td>password123</td>
    </tr>
  </tbody>
</table>


