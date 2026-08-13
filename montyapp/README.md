# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Sign in with Google

The client sets `detectSessionInUrl: false`, so the OAuth code is redeemed by
exactly one page — `/auth/callback` — rather than by whichever route the browser
happens to land on. That page sends the visitor to the product app, or back to
the `?next=` path when they were part-way through a purchase.

Enabling it takes config in two places:

**Google Cloud Console** — APIs & Services → Credentials → OAuth client ID (type
"Web application"):

| Field | Value |
| --- | --- |
| Authorized JavaScript origins | `https://citepark.com`, `http://localhost:5173` |
| Authorized redirect URI | `https://oumzszymeewcyyklkpsl.supabase.co/auth/v1/callback` |

The redirect URI is Supabase's, not ours — Google returns to Supabase, which
then returns to `/auth/callback` here.

**Supabase dashboard** — Authentication → Providers → Google: enable it and
paste the client ID and secret. Then under URL Configuration add both
`https://citepark.com/auth/callback` and `http://localhost:5173/auth/callback`
to the redirect allow list, or the callback is refused.

No new environment variables: the client id lives on the Supabase project, not
in the bundle.

## Payments (Razorpay)

The site is static, so the two calls that need the Razorpay key secret run as
Supabase Edge Functions on the project that already backs auth:

| Function | What it does |
| --- | --- |
| `supabase/functions/create-order` | Prices the plan server-side and creates a Razorpay order stamped with the payer's user id |
| `supabase/functions/verify-payment` | Checks the HMAC-SHA256 signature, re-reads the order from Razorpay, then marks the account Premium |

Premium is sold to an account, never to an anonymous visitor, so **Get Premium**
opens a sign-in dialog first and resumes checkout once there's a session. Both
functions run with `verify_jwt = true` and refuse a caller they can't identify.

The upgrade is written to the columns the product app already reads —
`user_usage.is_pro`, `subscription_status`, `current_period_start` /
`_end`, `cancel_at_period_end` — for a 30-day period. The Razorpay references go
on the user's `app_metadata` (`razorpay_order_id`, `razorpay_payment_id`,
`premium_until`), which is server-writable only and travels in the JWT; the
`stripe_*` columns are left alone. No schema change was needed. After a
successful payment the visitor is handed off to `app.citepark.com`.

The browser only ever sees `VITE_RAZORPAY_KEY_ID` (`.env`). The secret lives in
`supabase/.env.local`, which is gitignored and never bundled.

First-time setup:

```sh
supabase login
supabase link --project-ref oumzszymeewcyyklkpsl
supabase secrets set --env-file supabase/.env.local
supabase functions deploy create-order verify-payment
```

Then `npm run dev` and press **Get Premium** in the pricing section. You'll be
asked to sign in if you aren't already. Test-mode cards are listed at
https://razorpay.com/docs/payments/payments/test-card-details/ (UPI
`success@razorpay` is the quickest). Prices live in the `PLANS` map inside
`create-order/index.ts` — change them there, not in the browser.

To confirm the upgrade landed:

```sh
supabase functions logs verify-payment
# then check user_usage.is_pro for that user_id
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
