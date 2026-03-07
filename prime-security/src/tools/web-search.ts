import { z } from 'zod';
import { braveSearchApi, formatSearchResults, baseSearchSchema } from '../brave-api.js';

export const webSearchSchema = baseSearchSchema.extend({
  goggles_id: z.string().optional().describe('Goggles ID for custom ranking'),
  result_filter: z.string().optional().describe('Filter results by type'),
  extra_snippets: z.boolean().optional().describe('Include extra snippets in results'),
});

export async function webSearch(args: z.infer<typeof webSearchSchema>, apiKey: string) {
  const data = await braveSearchApi('web/search', args, apiKey);
  return {
    content: [
      {
        type: 'text',
        text: formatSearchResults(data, 'Web'),
      },
    ],
  };
}
