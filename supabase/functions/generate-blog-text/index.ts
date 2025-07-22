
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional blog writer specializing in outdoor gear and sports equipment. Write engaging, informative blog content in markdown format. The content should be well-structured with headings, subheadings, and appropriate formatting. Focus on providing valuable information while maintaining an engaging tone. The category is: ${category}.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!contentResponse.ok) {
      const errorData = await contentResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate content' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const contentData = await contentResponse.json();
    const content = contentData.choices[0].message.content;

    // Generate title and excerpt based on the content
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional blog editor. Create compelling titles and excerpts for blog posts. Return your response in JSON format with "title" and "excerpt" fields. The title should be catchy and SEO-friendly. The excerpt should be 1-2 sentences that summarize the main value of the post.'
          },
          {
            role: 'user',
            content: `Create a title and excerpt for this ${category} blog post:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    let title = `${category.charAt(0).toUpperCase() + category.slice(1)} Guide`;
    let excerpt = 'Discover expert insights and tips in this comprehensive guide.';

    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const metaContent = metaData.choices[0]?.message?.content;
      
      if (metaContent) {
        try {
          const parsedMeta = JSON.parse(metaContent);
          title = parsedMeta.title || title;
          excerpt = parsedMeta.excerpt || excerpt;
        } catch (error) {
          console.warn('Failed to parse meta content as JSON, using fallback');
        }
      }
    }

    console.log('Blog content, title, and excerpt generated successfully');

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
