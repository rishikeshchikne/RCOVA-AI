<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Plan prices, credit allowances, credit packs and per-tool credit costs live only in `src/config/plans.ts`; UI reads from there so plans stay configurable.
- Site nav, footer links and tool metadata live in `src/config/site.ts`; add new pages there so menus stay in sync.
- Anything not connected yet (currently payments) must show a labeled demo state, never a fake response, invented stat or fake success.
- Admin access is enforced in the database (`has_role` in RLS and `admin_overview`); the browser `isAdminQuery` only toggles UI.
- AI calls run only in `src/routes/api/chat.ts` and `src/routes/api/generate.ts`, which charge credits server-side before calling the model and refund on failure.
- AI Chat uses database-backed threads: each thread has its own page at `/chat/$threadId`; `/tools/chat` only starts a new thread.
- Contact submissions are saved through a server function into `contact_submissions` (admin-only read); owner email alerts need a verified email domain.
- Credit balances shown in the browser are display only; real calculation and deductions must happen on the server.
- Per-route SEO uses `seo()` from `src/lib/seo.ts`; signed-in and admin pages pass `noindex`.
