
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateBlogTextRequest {
  prompt: string;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, category }: GenerateBlogTextRequest = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Generating blog text for prompt:', prompt);

    // First, generate the main content
    const contentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert outdoor gear and adventure sports content writer. 
Write engaging, informative blog content with proper HTML formatting.
Use headings (<h2>, <h3>), paragraphs (<p>), lists (<ul>, <ol>), and emphasis (<strong>, <em>) appropriately.
Return ONLY the content HTML - no full page structure.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000,
      }),
    });

    if (!contentResponse.ok) {
      const errorData = await contentResponse.json();
      console.error('OpenAI API error for content generation:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to generate content: ${errorData.error?.message || 'Unknown error'}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const contentData = await contentResponse.json();
    console.log('Content response status:', contentResponse.ok, contentResponse.status);
    console.log('Full contentData response:', JSON.stringify(contentData, null, 2));
    
    const content = contentData.choices?.[0]?.message?.content;
    console.log('Extracted content (first 200 chars):', content?.substring(0, 200));
    
    if (!content || content.trim().length === 0) {
      console.error('Content generation failed - empty or undefined content');
      return new Response(
        JSON.stringify({ success: false, error: 'GPT-5 returned empty content. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Generate title and excerpt based on the content and prompt
    const metaResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional blog editor specializing in outdoor gear and sports equipment. Create compelling titles and excerpts for blog posts.
Return a JSON object with "title" and "excerpt" fields.
- Title: 50-70 characters, catchy and SEO-friendly
- Excerpt: 120-160 characters, engaging summary
- Make both title and excerpt compelling for search engines and readers`
          },
          {
            role: 'user',
            content: `Create a title and excerpt for this ${category} blog post about: ${prompt}

Content preview:
${content.substring(0, 800)}...

Please return ONLY the JSON object with title and excerpt fields.`
          }
        ],
        max_tokens: 1500,
      }),
    });

    let title = `${category.charAt(0).toUpperCase() + category.slice(1)} Guide: ${prompt.substring(0, 30)}...`;
    let excerpt = `Discover expert insights and tips in this comprehensive ${category} guide based on: ${prompt.substring(0, 80)}...`;

    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      console.log('Meta response status:', metaResponse.ok, metaResponse.status);
      console.log('Full metaData response:', JSON.stringify(metaData, null, 2));
      
      const metaContent = metaData.choices?.[0]?.message?.content;
      console.log('Raw meta content from OpenAI:', metaContent);

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

          console.log('Successfully parsed meta content - Title:', title, 'Excerpt:', excerpt);
        } catch (error) {
          console.warn('Failed to parse meta content as JSON, using fallback. Error:', error);
          console.warn('Content that failed to parse:', metaContent);
        }
      }
    } else {
      const metaErrorData = await metaResponse.json().catch(() => ({}));
      console.warn('Meta response not ok:', metaResponse.status, metaResponse.statusText, metaErrorData);
    }

    console.log('Blog content, title, and excerpt generated successfully');
    console.log('Final content length:', content.length);
    console.log('Final title:', title);
    console.log('Final excerpt:', excerpt);

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

  } catch (error) {
    console.error('Error in generate-blog-text function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
