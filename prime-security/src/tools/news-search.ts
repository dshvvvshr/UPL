import { z } from 'zod';
import { braveSearchApi } from '../brave-api.js';

const MAX_NEWS_RESULTS = 20;

export const newsSearchSchema = z.object({
  q: z.string().describe('The search query for news'),
  count: z.number().min(1).max(MAX_NEWS_RESULTS).optional().describe('Number of results (1-20)'),
  freshness: z.string().optional().describe('Time filter (e.g., pd for past day, pw for past week)'),
  search_lang: z.string().optional().describe('Search language'),
  spellcheck: z.boolean().optional().describe('Enable spell checking'),
});

export async function newsSearch(args: z.infer<typeof newsSearchSchema>, apiKey: string) {
  const data = await braveSearchApi('news/search', args, apiKey);
  
  let output = '# News Search Results\n\n';
  
  if (data.results && data.results.length > 0) {
    data.results.forEach((result: any, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**URL:** ${result.url || 'N/A'}\n`;
      output += `**Description:** ${result.description || 'No description available'}\n`;
      if (result.age) output += `**Published:** ${result.age}\n`;
      if (result.source) output += `**Source:** ${result.source}\n`;
      output += '\n';
    });
  } else {
    output += 'No news found.\n';
  }
  
  return {
    content: [
      {
        type: 'text',
        text: output,
      },
    ],
  };
}
