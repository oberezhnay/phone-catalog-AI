// Vercel serverless entry: every request is rewritten here (see vercel.json)
// and handled by the compiled Express app from `npm run vercel-build`.
import { createApp } from '../dist/app.js';

export default createApp();
