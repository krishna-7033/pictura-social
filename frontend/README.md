# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Vercel Deployment

To deploy this frontend to Vercel (serving the Vite build):

1. Ensure your backend is deployed and reachable (e.g. `https://pictura-social.onrender.com`).
2. Commit this repo and push to your Git provider (GitHub/GitLab/Bitbucket).
3. In Vercel, create a new project and import your repository.
   - Set the **Root Directory** to `frontend` so Vercel builds this folder.
   - Vercel will use the `vercel.json` in this folder to detect the build.
4. If you prefer to manage secrets in the Vercel dashboard, add these Environment Variables there (recommended):
   - `VITE_API_BASE_URL` = `https://pictura-social.onrender.com`
   - `VITE_DEFAULT_TENANT_SLUG` = `demo`
5. Deploy and verify the site. The frontend will make API calls to the backend URL set in `VITE_API_BASE_URL`.

Note: Vite environment variables prefixed with `VITE_` are injected at build time. If you change them in Vercel, trigger a redeploy to pick up new values.
