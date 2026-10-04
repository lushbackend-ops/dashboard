# Security Guidelines
Lush AI Marketing Platform

Security is mandatory. The platform handles sensitive B2B trade data, lead intelligence, and strategic marketing plans.

## Strict Rules
1. **No Hardcoded Secrets**: Never commit secrets, passwords, or API keys to the repository, including `README.md` or configuration files.
2. **Environment Variables**: Use `.env.local` for all secrets.
3. **No Browser Exposure**: Never expose Supabase service-role keys or AI provider API keys to the browser (client-side). They must remain on the server.
4. **Data Leakage**: Do not log sensitive lead information unnecessarily. Use safe error messages that do not expose stack traces or database schema details to the client.

## Implementation Details
- **Authentication**: Managed via Supabase Auth. All application routes (except public landing/auth pages) must be protected by middleware.
- **Authorization & RLS**: Supabase Row Level Security (RLS) must be enabled on all tables. Users should only access data belonging to their organization.
- **Server Actions**: Data mutation should occur via Next.js Server Actions or API routes, with strict validation (e.g., Zod) and authorization checks.
- **Rate Limiting**: Implement rate limiting on sensitive or expensive endpoints (e.g., AI generation, lead scraping).
- **Audit Logging**: Important actions (e.g., approving outward messages, changing organization settings) must be logged in an `audit_logs` table.
