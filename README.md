# 🚀 SUPPORT LINK BOX — Submit • Support • Grow

Professional Community Support Link Tracking, Daily Tasks, Automated Leaderboards, Streaks, and Monetization Management Platform.

Designed to replace manual Messenger group operations with a modern, mobile-first Web Application for 2,000+ members and 200+ daily link submissions.

---

## 🏗️ Architecture Overview

```
GitHub Repository (Static SPA)
        │
        ▼
GitHub Pages / Custom Domain (supportlinkbox.com)
        │
        ▼
React 18 + Tailwind CSS + Lucide Icons + Recharts
        │
        ▼
Supabase Cloud (Auth + PostgreSQL + Storage + Realtime)
  ├── Row Level Security (RLS) Enabled
  ├── Public Anon Key only on Client
  └── Zero Secret / Service Keys on Frontend
```

---

## 🌟 Core Features & Modules

### 👤 Member Workflow
1. **Instant Member Dashboard**: Real-time personal support tracker, daily deadline timer (12:00 AM BST), 4-tier color progress (Critical 0–49%, In Progress 50–79%, Almost Done 80–99%, Complete 100%), and streak badges (3, 7, 15, 30 days).
2. **Daily Link Submission**:
   - Single daily submission constraint with duplicate prevention.
   - Submitter instruction system (*"React + Comment"*, *"React Only"*, etc.).
3. **Today's Links Hub**:
   - One-click native Facebook post opening via `window.open(url, '_blank')`.
   - Idempotent `"Mark as Supported"` tracking with instant progress updates.
   - Filter by All, Pending, and Supported links with search by member name.
4. **Leaderboard & Streaks**:
   - Today, This Week (59th Week), This Month, and All Time leaderboards.
   - Top 3 podium highlighting with gold, silver, and bronze trophies.
5. **Notice & Announcements**:
   - High-priority banner broadcasts (General, Warning, Important, Emergency).
   - Read/Unread tracking.
6. **Profile & History**:
   - Cumulative stats: total links submitted, total supports given, completion rate %, current rank, and join date.
   - Chronological daily support history.
7. **Report a Problem**:
   - Form with categories (Wrong Link, Wrong Instruction, Member Problem, Technical Problem, Other).
8. **Free Creator Tools Suite**:
   - Facebook Link Checker, Caption Generator, Hashtag Generator, Text Formatter, Character Counter, Image Resizer, and Engagement Calculator to drive organic SEO traffic.

---

### 🛡️ Admin Suite (`/admin`)
1. **Executive Dashboard**: Real-time KPI counters (Total Members, Active, Today's Submitters, Completed, Pending, Inactive, Frozen) with charts for daily active users and support completion rates.
2. **Member Management**: Filter by status (Active, Inactive, Frozen, Suspended, Removed), search by name/username, bulk actions (Freeze, Suspend, Restore, Remove), point adjustments, and streak resets.
3. **Bulk Member Import**: Paste lists of usernames/names with automatic parsing, duplicate detection dialog (Keep Existing, Register New, Rename, Skip), and batch ID generation.
4. **Today's Links Oversight**: Live supporter matrix audit, link modifier, and status toggles.
5. **Inactive & Frozen Isolation**: Filter inactivity thresholds (1+, 3+, 5+, 7+, 11+ days) with one-click freeze/unfreeze actions.
6. **Notices & Warnings Dispatcher**: Issue direct warnings (Simple, Alert, Kickout) to member profiles and publish system announcements.
7. **Problem Reports Center**: Review submitted issues, inspect screenshots, and mark reports as resolved or dismissed.
8. **Weekly Session Finalization**: Archive the current week (59th Week), calculate champions, award leaderboard points, and initiate new weekly sessions.
9. **Monetization Engine**:
   - **Direct Brand Sponsors**: Manage banner campaigns, leaderboard sponsors, logo assets, target URLs, and impressions/clicks counters.
   - **Display Ad Slots**: Switchboard for Google AdSense / banner ad positions (Top Banner, Dashboard, Today's Links, Leaderboard, Footer).
   - **Affiliate Partner Hub**: Track creator tool affiliate links (Canva, Bluehost, Boya Mic, CapCut Pro) with clicks, conversions, and BDT revenue ledger.
   - **Revenue Ledger**: Historical financial tracking across direct sponsors, ad networks, and affiliate payouts with CSV export.
10. **System Audit Logs**: Immutable chronological record of every administrative action, timestamp, admin name, and target details.
11. **System Settings**: Configurable daily deadlines, duplicate URL toggles, inactivity threshold days, and monetization switches.
12. **CSV Export Center**: Universal one-click data downloads for Members, Daily Links, Support Logs, Leaderboards, Inactive lists, and Financial records.

---

## 🚀 GitHub Pages Deployment Guide

### Step 1: Create Repository & Push Code
1. Initialize Git in the project root:
   ```bash
   git init
   git add .
   git commit -m "feat: Support Link Box master release"
   ```
2. Create a repository on GitHub (e.g. `support-link-box`) and push:
   ```bash
   git remote add origin https://github.com/your-username/support-link-box.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Configure Supabase Database
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and paste the entire content of `supabase_schema.sql` into the editor and click **Run**.
4. Retrieve your **Project URL** and **Public `anon` Key** from **Project Settings > API**.

### Step 3: GitHub Actions Automated Static Build
Create `.github/workflows/deploy.yml` in your repo:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build static site
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 4: Custom Domain Setup (`supportlinkbox.com`)
1. In your GitHub repository, navigate to **Settings > Pages**.
2. Under **Custom domain**, enter `supportlinkbox.com` or `www.supportlinkbox.com` and click **Save**.
3. In your DNS provider (Cloudflare, Namecheap, GoDaddy):
   - Add **4 A Records** pointing `@` to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Add a **CNAME Record** pointing `www` to `your-username.github.io`.
4. Check **Enforce HTTPS** in repository settings once certificate is issued.

---

## 🔒 Security & Privacy Architecture
- **No Private Credentials**: Never collects or stores Facebook passwords or access tokens.
- **Native Browser Handling**: All Facebook links open directly in the user's browser or official Facebook app via standard OS intents.
- **Row Level Security (RLS)**: Enforced on all tables in Supabase so members can only modify their own daily link and support logs, while administrative capabilities require verified `is_admin = TRUE` claims.
- **No Secret Keys in Frontend**: Uses only Supabase `anon` public key; all privileged queries are gated behind PostgreSQL RLS functions.

---

## 📄 License
MIT License. Built for community growth and creator success.
