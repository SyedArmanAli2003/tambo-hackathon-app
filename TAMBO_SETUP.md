# Tambo React App - Setup & Configuration Guide

## Overview

This is a **React 19 + Tailwind CSS 4** application integrated with **Tambo AI**, an open-source generative UI framework. The app features a modern chat interface that dynamically renders React components based on AI-powered conversations.

## What is Tambo?

Tambo is an AI orchestration framework for React that enables:
- **Generative UI**: AI dynamically decides which components to render based on conversations
- **Interactive Components**: Real React components, not just markdown
- **Natural Language Control**: Describe what you want, and Tambo renders it
- **Component Registration**: Register your custom components for AI to use

## Getting Started

### 1. Get a Tambo API Key

1. Visit [Tambo Dashboard](https://dashboard.tambo.co/)
2. Sign up for a free account
3. Create a new API key
4. Copy your API key

### 2. Configure the API Key

Copy `.env.example` to `.env.local` and add your key:

```bash
cp .env.example .env.local
```

Then update `.env.local` in the project root:

> Note: `.env.local` is for your private keys and should not be committed to git.

```env
VITE_TAMBO_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   └── ChatInterface.tsx    # Main chat UI with Tambo integration
│   ├── pages/
│   │   └── Home.tsx             # Home page (uses ChatInterface)
│   ├── App.tsx                  # Root component with TamboProvider
│   ├── index.css                # Global styles & theme
│   └── main.tsx                 # React entry point
├── index.html                   # HTML template with fonts
└── public/                      # Static assets
```

## Design Philosophy

The app follows a **Modern Minimalist with AI Accent** design:

- **Color Scheme**: 
  - Primary: Deep Indigo (`#4F46E5`)
  - Accent: Vibrant Cyan (`#06B6D4`)
  - Background: Clean White with subtle gradients

- **Typography**:
  - Headers: Poppins (bold, modern)
  - Body: Inter (clean, readable)
  - Code: Fira Code (monospace)

- **Interactions**:
  - Smooth message animations (fade-in, slide-up)
  - Thinking indicator with animated dots
  - Responsive hover states
  - Keyboard-friendly navigation

## Key Components

### ChatInterface Component

Located in `client/src/components/ChatInterface.tsx`

Features:
- Message threading with user/assistant roles
- Auto-scrolling to latest messages
- Thinking indicator animation
- Responsive input area
- Timestamp display for messages

### TamboProvider

Wraps the entire app in `App.tsx` to enable AI orchestration:

```tsx
<TamboProvider apiKey={tamboApiKey}>
  {/* Your app content */}
</TamboProvider>
```

## Customization

### Adding Custom Components

To register custom components with Tambo:

1. Create your component in `client/src/components/`
2. Register it in the Tambo configuration (see Tambo docs)
3. Reference it in your chat prompts

Example:
```tsx
// client/src/components/CustomChart.tsx
export function CustomChart({ data }) {
  return <div>Your chart here</div>;
}
```

### Styling

- Global styles: `client/src/index.css`
- Component styles: Use Tailwind classes directly in JSX
- Theme colors: Defined as CSS variables in `index.css`

### Connecting to Real AI

Replace the placeholder AI response in `ChatInterface.tsx`:

```tsx
// Current placeholder (line ~60):
setTimeout(() => {
  const aiMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: "This is a placeholder response...",
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, aiMessage]);
  setIsLoading(false);
}, 1000);

// Replace with actual Tambo API call:
// Use @tambo-ai/react hooks to interact with Tambo
```

## Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm check        # Type check with TypeScript

# Production
pnpm build        # Build for production
pnpm start        # Run production build
pnpm preview      # Preview production build

# Code Quality
pnpm format       # Format code with Prettier
```

## Dependencies

- **React 19**: UI framework
- **Tailwind CSS 4**: Utility-first CSS
- **shadcn/ui**: Pre-built UI components
- **@tambo-ai/react**: AI orchestration
- **Framer Motion**: Smooth animations
- **Wouter**: Client-side routing
- **Lucide React**: Icons

## Troubleshooting

### API Key Not Working

1. Verify the API key is correct in `.env.local`
2. Check that the file is named `.env.local` (not `.env`)
3. Restart the dev server after updating `.env.local`

### Components Not Rendering

1. Ensure TamboProvider is wrapping your app
2. Check browser console for errors
3. Verify API key is set correctly

### Styling Issues

1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
2. Restart dev server
3. Check that Tailwind classes are being applied

## Next Steps

1. **Connect Real AI**: Implement actual Tambo API calls
2. **Register Components**: Add custom components for Tambo to render
3. **Add Features**: Implement conversation history, user profiles, etc.
4. **Deploy**: Deploy to production using Manus hosting or your preferred platform

## Resources

- [Tambo Documentation](https://docs.tambo.co/)
- [Tambo GitHub](https://github.com/tambo-ai/tambo)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Support

For issues with Tambo, visit the [Tambo Discord](https://discord.gg/tambo) or check the [GitHub Issues](https://github.com/tambo-ai/tambo/issues).

---

**Built with ❤️ using React, Tambo, and Tailwind CSS**
