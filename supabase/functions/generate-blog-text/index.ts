import { authenticate } from "../_shared/requestAuth.ts";
import { errorResponse, readJson } from "../_shared/http.ts";
import { validate, blogTextRequest } from "../_shared/requestValidation.ts";
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await authenticate(req);
    const { prompt, category } = validate(blogTextRequest, await readJson(req));

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // First, generate the main content
    const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(60_000),
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert outdoor gear and adventure sports content writer.
Write engaging, informative blog content with proper HTML formatting.
Use headings (<h2>, <h3>), paragraphs (<p>), lists (<ul>, <ol>), and emphasis (<strong>, <em>) appropriately.
Never use em dashes (—) anywhere in the output. Rewrite any sentence that would use one; if a stronger break than a comma is needed, use a semicolon (;) instead.
Return ONLY the content HTML - no full page structure.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!contentResponse.ok) {
      await contentResponse.body?.cancel();
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate content. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const contentData = await contentResponse.json();
    console.log('Content response status:', contentResponse.ok, contentResponse.status);
    
    const content = contentData.choices?.[0]?.message?.content;
    
    if (!content || content.trim().length === 0) {
      console.error('Content generation failed - empty or undefined content');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI returned empty content. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Generate title and excerpt based on the content and prompt
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(60_000),
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional blog editor specializing in outdoor gear and sports equipment. Create compelling titles and excerpts for blog posts.
Return a JSON object with "title" and "excerpt" fields.
- Title: 50-70 characters, catchy and SEO-friendly
- Excerpt: 120-160 characters, engaging summary
- Make both title and excerpt compelling for search engines and readers
- Never use em dashes (—) in the title or excerpt; use a semicolon (;) instead if a stronger break than a comma is needed`
          },
          {
            role: 'user',
            content: `Create a title and excerpt for this ${category} blog post about: ${prompt}

Content preview:
${content.substring(0, 800)}...

Please return ONLY the JSON object with title and excerpt fields.`
          }
        ],
        max_completion_tokens: 1500,
      }),
    });

    let title = `${category.charAt(0).toUpperCase() + category.slice(1)} Guide: ${prompt.substring(0, 30)}...`;
    let excerpt = `Discover expert insights and tips in this comprehensive ${category} guide based on: ${prompt.substring(0, 80)}...`;

    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      console.log('Meta response status:', metaResponse.ok, metaResponse.status);
      
      const metaContent = metaData.choices?.[0]?.message?.content;

      if (metaContent) {
        try {
          // Clean the content to extract just the JSON
          let cleanMetaContent = metaContent.trim();

          // Remove any markdown code blocks
          cleanMetaContent = cleanMetaContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
          cleanMetaContent = cleanMetaContent.replace(/```\s*/, '').replace(/```\s*$/, '');

          // Find JSON object boundaries
          const jsonStart = cleanMetaContent.indexOf('{');
          const jsonEnd = cleanMetaContent.lastIndexOf('}') + 1;

          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            cleanMetaContent = cleanMetaContent.substring(jsonStart, jsonEnd);
          }

          const parsedMeta = JSON.parse(cleanMetaContent);

          if (parsedMeta.title && typeof parsedMeta.title === 'string' && parsedMeta.title.trim()) {
            title = parsedMeta.title.trim();
          }
          if (parsedMeta.excerpt && typeof parsedMeta.excerpt === 'string' && parsedMeta.excerpt.trim()) {
            excerpt = parsedMeta.excerpt.trim();
          }

        } catch {
          console.warn('Invalid generated metadata; using fallback');
        }
      }
    } else {
      await metaResponse.body?.cancel();
    }

    console.log('Blog content, title, and excerpt generated successfully');
    console.log('Final content length:', content.length);

    return new Response(
      JSON.stringify({
        success: true,
        content,
        title,
        excerpt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: unknown) {
    return errorResponse(error, corsHeaders);
  }
});
