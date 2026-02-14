import { z } from 'zod';
import { braveSearchApi, formatSearchResults } from '../brave-api.js';

const MAX_LOCAL_RESULTS = 20;

export const localSearchSchema = z.object({
  q: z.string().describe('The search query for local businesses'),
  count: z.number().min(1).max(MAX_LOCAL_RESULTS).optional().describe('Number of results (1-20)'),
});

export async function localSearch(args: z.infer<typeof localSearchSchema>, apiKey: string) {
  const data = await braveSearchApi('web/search', { ...args, search_type: 'local' }, apiKey);
  return {
    content: [
      {
        type: 'text',
        text: formatSearchResults(data, 'Local'),
      },
    ],
  };
}
