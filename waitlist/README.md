# Coin Gift Waitlist

A React-based waitlist signup application for Coin Gift, built with Vite and TailwindCSS.

## Features

- 📧 Email waitlist signup with validation
- ⚡ Optional Lightning Network donations to support development
- 🎨 Responsive design matching the main Coin Gift app
- 💳 Real-time donation payment status monitoring
- 🔄 Automatic invoice expiration handling

## Development

```bash
# Install dependencies (from root)
bun install

# Start development server
bun run dev:waitlist

# Build for production
bun run build:waitlist
```

The waitlist app runs on http://localhost:5174 (different port from main client to avoid conflicts).

## API Integration

The waitlist app connects to the main server API endpoints:

- `POST /waitlist/signup` - Create waitlist signup with optional donation
- `GET /waitlist/donation/:paymentHash` - Check donation payment status

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS v4** for styling
- **TanStack Router** for routing
- **TanStack Query** for API state management
- **Lightning Network** integration via Alby SDK
