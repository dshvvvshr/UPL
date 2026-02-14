import { z } from 'zod';
import { braveSearchApi } from '../brave-api.js';

const MAX_VIDEO_RESULTS = 20;

export const videoSearchSchema = z.object({
  q: z.string().describe('The search query for videos'),
  count: z.number().min(1).max(MAX_VIDEO_RESULTS).optional().describe('Number of results (1-20)'),
  safesearch: z.enum(['off', 'moderate', 'strict']).optional().describe('Safe search level'),
  spellcheck: z.boolean().optional().describe('Enable spell checking'),
});

export async function videoSearch(args: z.infer<typeof videoSearchSchema>, apiKey: string) {
  const data = await braveSearchApi('videos/search', args, apiKey);
  
  let output = '# Video Search Results\n\n';
  
  if (data.results && data.results.length > 0) {
    data.results.forEach((result: any, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**URL:** ${result.url || 'N/A'}\n`;
      output += `**Description:** ${result.description || 'No description available'}\n`;
      if (result.age) output += `**Age:** ${result.age}\n`;
      if (result.thumbnail?.src) output += `**Thumbnail:** ${result.thumbnail.src}\n`;
      output += '\n';
    });
  } else {
    output += 'No videos found.\n';
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
