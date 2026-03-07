import { z } from 'zod';
import { braveSearchApi } from '../brave-api.js';

const MAX_IMAGE_RESULTS = 150;

export const imageSearchSchema = z.object({
  q: z.string().describe('The search query for images'),
  count: z.number().min(1).max(MAX_IMAGE_RESULTS).optional().describe('Number of results (1-150)'),
  safesearch: z.enum(['off', 'moderate', 'strict']).optional().describe('Safe search level'),
  spellcheck: z.boolean().optional().describe('Enable spell checking'),
});

export async function imageSearch(args: z.infer<typeof imageSearchSchema>, apiKey: string) {
  const data = await braveSearchApi('images/search', args, apiKey);
  
  let output = '# Image Search Results\n\n';
  
  if (data.results && data.results.length > 0) {
    data.results.forEach((result: any, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**Image URL:** ${result.url || 'N/A'}\n`;
      output += `**Thumbnail:** ${result.thumbnail?.src || 'N/A'}\n`;
      output += `**Source:** ${result.source || 'N/A'}\n`;
      if (result.properties) {
        const width = result.properties.width || 'N/A';
        const height = result.properties.height || 'N/A';
        output += `**Dimensions:** ${width}x${height}\n`;
      }
      output += '\n';
    });
  } else {
    output += 'No images found.\n';
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
