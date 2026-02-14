import { z } from 'zod';

// Base search parameters
const MAX_WEB_RESULTS = 20;

export const baseSearchSchema = z.object({
  q: z.string().describe('The search query'),
  country: z.string().optional().describe('Country code (e.g., US, GB)'),
  search_lang: z.string().optional().describe('Search language (e.g., en, es)'),
  ui_lang: z.string().optional().describe('UI language'),
  count: z.number().min(1).max(MAX_WEB_RESULTS).optional().describe('Number of results (1-20)'),
  offset: z.number().min(0).optional().describe('Pagination offset'),
  safesearch: z.enum(['off', 'moderate', 'strict']).optional().describe('Safe search level'),
  freshness: z.string().optional().describe('Time filter (e.g., pd for past day, pw for past week)'),
  text_decorations: z.boolean().optional().describe('Include text decorations in results'),
  spellcheck: z.boolean().optional().describe('Enable spell checking'),
});

// Web search result interface
export interface WebSearchResult {
  type: string;
  title?: string;
  url?: string;
  description?: string;
  age?: string;
  page_age?: string;
  language?: string;
  family_friendly?: boolean;
}

// Make API call to Brave Search
export async function braveSearchApi(
  endpoint: string,
  params: Record<string, string | number | boolean>,
  apiKey: string
): Promise<any> {
  const url = new URL(`https://api.search.brave.com/res/v1/${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brave API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Format search results for MCP response
export function formatSearchResults(data: any, searchType: string): string {
  let output = `# ${searchType} Search Results\n\n`;

  if (data.web?.results && data.web.results.length > 0) {
    output += '## Web Results\n\n';
    data.web.results.forEach((result: WebSearchResult, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**URL:** ${result.url || 'N/A'}\n`;
      output += `**Description:** ${result.description || 'No description available'}\n`;
      if (result.age) output += `**Age:** ${result.age}\n`;
      output += '\n';
    });
  }

  if (data.news?.results && data.news.results.length > 0) {
    output += '## News Results\n\n';
    data.news.results.forEach((result: any, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**URL:** ${result.url || 'N/A'}\n`;
      output += `**Description:** ${result.description || 'No description available'}\n`;
      if (result.age) output += `**Age:** ${result.age}\n`;
      output += '\n';
    });
  }

  if (data.videos?.results && data.videos.results.length > 0) {
    output += '## Video Results\n\n';
    data.videos.results.forEach((result: any, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**URL:** ${result.url || 'N/A'}\n`;
      output += `**Description:** ${result.description || 'No description available'}\n`;
      if (result.age) output += `**Age:** ${result.age}\n`;
      output += '\n';
    });
  }

  if (data.locations?.results && data.locations.results.length > 0) {
    output += '## Local Results\n\n';
    data.locations.results.forEach((result: any, index: number) => {
      output += `### ${index + 1}. ${result.title || 'Untitled'}\n`;
      output += `**Address:** ${result.address || 'N/A'}\n`;
      if (result.phone) output += `**Phone:** ${result.phone}\n`;
      if (result.rating && typeof result.rating === 'number') {
        output += `**Rating:** ${result.rating.toFixed(1)} (${result.rating_count || 0} reviews)\n`;
      }
      output += '\n';
    });
  }

  if (data.summarizer?.summary) {
    output += '## AI Summary\n\n';
    output += data.summarizer.summary + '\n\n';
  }

  if (!data.web?.results && !data.news?.results && !data.videos?.results && !data.locations?.results) {
    output += 'No results found.\n';
  }

  return output;
}
