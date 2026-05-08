# 22803011 - Campus Notifications Platform

A campus notification system where students get real-time updates about Placements, Events, and Results. Built with Next.js and Material UI.

## What's in here

- **Stage 1** (`stage1/priority-inbox.js`) — A priority inbox that picks the top N most important notifications using a min-heap. Priority is based on notification type (Placement > Result > Event) and how recent it is. The design and approach is explained in `Notification_System_Design.md`.

- **Stage 2** (`campus-notifications/`) — A responsive React (Next.js) frontend with two pages:
  - `/` — All notifications with pagination and type filtering
  - `/priority` — Priority inbox showing top N notifications (configurable: 5, 10, 15, 20) with type filtering
  - Notifications you've already clicked on appear faded so you can tell what's new at a glance
  - Works on both desktop and mobile (drawer nav on small screens)

- **Logging Middleware** (`logging-middleware/logger.js`) — Custom logger used across the project instead of console.log. Logs are written in structured JSON format to `logs/app.log`.

## How to run

### Stage 1

```bash
node stage1/priority-inbox.js
```

This will fetch notifications, compute priority scores, and print the top 10 in the terminal. It also simulates new notifications coming in and shows the updated ranking.

### Stage 2 (Frontend)

```bash
cd campus-notifications
npm install
npm run dev
```

App runs on **http://localhost:3000**.

If you have an API auth token, create a `.env.local` file inside `campus-notifications/`:

```
NEXT_PUBLIC_API_URL=http://4.224.186.213/evaluation-service
NEXT_PUBLIC_AUTH_TOKEN=your-token-here
```

Without the token, the app falls back to sample data so you can still see everything working.

## Tech stack

- Next.js 14 (App Router)
- Material UI v5
- Node.js (for Stage 1 script)

## Note

`node_modules`, `.next`, `.DS_Store`, and log files are all in `.gitignore` — so after cloning you'll need to run `npm install` before anything else.