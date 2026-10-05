# AI Studio Setup Guide

## What AI Studio Does
AI Studio is a premium SaaS-style content creation workspace for Lush Trade Corp. It automatically generates high-quality, 15-second vertical Reels (optimized for Instagram, Facebook, and YouTube Shorts) using AI and renders them server-side using Remotion.

## Required Dependencies
The following dependencies were installed to power AI Studio:
- `remotion`
- `@remotion/cli`
- `@remotion/player`
- `@remotion/renderer`
- `zod`

## Environment Variables
Create a `.env` or `.env.local` file in the root of your project with the following secrets:

```env
# AI Provider (Gemini/OpenAI)
AI_PROVIDER_API_KEY=your_google_gemini_or_openai_key

# Webhooks (for Make.com)
MAKE_WEBHOOK_SECRET=your_secure_webhook_secret

# Security
CONTENT_STUDIO_SECRET=your_secure_app_secret
```

*Note: Never expose these secrets in client-side code (`NEXT_PUBLIC_`).*

## How to Start the Application
```powershell
npm run dev
```

## How to Start Remotion Studio (for Template Design)
If you want to edit or preview the Remotion templates visually in the browser without running the full Next.js app:
```powershell
npx remotion studio remotion/Root.tsx
```

## How to Render a Video (Production)
In a production environment, you should use AWS Lambda (`@remotion/lambda`) to render videos because serverless functions (like Vercel) have a 10s timeout and lack the FFMPEG binaries required by `@remotion/renderer`.

For local testing, the `/api/ai-studio/render` endpoint currently simulates a 5-second render and returns a sample MP4. To enable real local rendering, you must bundle the project and call `renderMedia()`.

## How to Add Product Images
Upload your product images to the centralized asset configuration directory:
`/public/content-studio/products/`
(e.g., `/public/content-studio/products/cashews.jpg`)

## How to Add Templates
1. Create a new Remotion composition in `/remotion/compositions/`
2. Register the composition in `/remotion/Root.tsx`
3. Add the template name to the dropdown in `src/app/(dashboard)/ai-studio/page.tsx`

## The AI API
The endpoint `POST /api/ai-studio/generate` takes the user's form parameters, builds a prompt, and uses the `getAIProvider()` abstraction to generate structured JSON mapping out scenes by seconds.

## Make.com Webhook
The endpoint `POST /api/ai-studio/webhook` is ready to receive requests from Make.com. It requires the `Authorization: Bearer <MAKE_WEBHOOK_SECRET>` header. 
You can check job status at `GET /api/ai-studio/jobs/[jobId]`.

## Troubleshooting Rendering
If you attempt to use `@remotion/renderer` locally and it fails:
- Ensure you have Chrome/Chromium installed.
- Ensure your Next.js API route isn't timing out (Next.js default is often 15s or 60s).
- Use `@remotion/lambda` for reliable serverless rendering.
