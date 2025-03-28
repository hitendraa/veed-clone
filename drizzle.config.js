import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

console.log('Database URL:', process.env.NEXT_PUBLIC_DATABASE_URL);

export default defineConfig({
  out: './drizzle',
  schema: './src/config/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL || '',
  },
});
