// Cloudflare Workers entry point for Next.js
import { fetch as fetch_ } from '@cloudflare/next-on-pages/fetch';

export default fetch_;

export const config = {
  runtime: 'nodejs_compat',
};
