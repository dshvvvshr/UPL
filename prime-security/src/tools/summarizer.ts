import { z } from 'zod';
import { braveSearchApi, SummarizerEnrichment, MCPToolResponse } from '../brave-api';

export const summarizerSchema = z.object({
  key: z.string().describe('The summarizer key or search query'),
  entity_info: z.boolean().optional().describe('Include entity information'),
});

export async function summarizer(args: z.infer<typeof summarizerSchema>, apiKey: string): Promise<MCPToolResponse> {
  const data = await braveSearchApi('summarizer/search', args, apiKey);
  
  let output = '# AI Summary\n\n';
  
  if (data.summary) {
    output += data.summary + '\n\n';
    
    if (data.enrichments && data.enrichments.length > 0) {
      output += '## Related Topics\n\n';
      data.enrichments.forEach((enrichment: SummarizerEnrichment) => {
        output += `- ${enrichment.title || enrichment.text || 'Unknown'}\n`;
      });
    }
  } else {
    output += 'No summary available.\n';
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
