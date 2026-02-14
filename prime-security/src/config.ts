import { z } from 'zod';

export const configSchema = z.object({
  braveApiKey: z.string().min(1, 'BRAVE_API_KEY is required'),
  transport: z.enum(['stdio', 'http']).default('stdio'),
  port: z.coerce.number().default(3000),
  host: z.string().default('localhost'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const config = {
    braveApiKey: process.env.BRAVE_API_KEY,
    transport: process.env.TRANSPORT || 'stdio',
    port: process.env.PORT || '3000',
    host: process.env.HOST || 'localhost',
  };

  return configSchema.parse(config);
}
