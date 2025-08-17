
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
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert outdoor gear and adventure sports content writer. 
            Create engaging, informative blog posts about ${category} topics.
            
            Guidelines:
            - Write in a conversational, engaging tone
            - Include practical tips and insights
            - Use personal experiences and storytelling where appropriate
            - Aim for 800-1200 words
            - Structure content with clear sections using proper HTML heading hierarchy
            - Include relevant keywords naturally
            - Make it SEO-friendly with good readability
            - Focus on value for readers interested in outdoor adventures
            - Use specific examples and actionable advice
            - Write for both beginners and experienced enthusiasts
            
            IMPORTANT FORMATTING RULES:
            - Use <h2> for main sections (2-4 sections recommended)
            - Use <h3> for subsections within main sections
            - Use <h4> for detailed points within subsections
            - Use <p> tags for paragraphs
            - Use <strong> for emphasis instead of **bold**
            - Use <em> for italics
            - Use <ul> and <li> for bullet points
            - Use <ol> and <li> for numbered lists
            - Use <blockquote> for quotes
            
            Structure should follow SEO best practices:
            - Start with an engaging introduction paragraph
            - Include 2-4 main <h2> sections
            - Use <h3> and <h4> as needed for detailed organization
            - End with a conclusion or call-to-action
            
            Return properly formatted HTML content that's ready to render safely.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
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

    // Generate title and excerpt based on the content and prompt
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a professional blog editor specializing in outdoor gear and sports equipment. Create compelling titles and excerpts for blog posts.

CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:
- Return ONLY a valid JSON object with exactly this structure: {"title": "Your Title Here", "excerpt": "Your excerpt here"}
- Do NOT include any other text, explanations, or markdown formatting
- The title should be catchy, SEO-friendly, and include relevant keywords for ${category}
- Keep the title under 60 characters for optimal SEO
- The excerpt should be 2-3 descriptive sentences that clearly explain what readers will learn and the main value/benefits of the post
- The excerpt should be 120-160 characters for optimal SEO
- Make the excerpt engaging and specific to the content, not generic
- Include relevant keywords naturally in both title and excerpt

SEO OPTIMIZATION REQUIREMENTS (TARGET: 90+ SEO SCORE):
- Include the main keyword from the prompt naturally in both title and excerpt
- Use action words and power words to increase click-through rate
- Make the excerpt specific and value-driven to entice readers
- Ensure title includes category-relevant keywords
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
        max_completion_tokens: 300,
      }),
    });

    let title = `${category.charAt(0).toUpperCase() + category.slice(1)} Guide: ${prompt.substring(0, 30)}...`;
    let excerpt = `Discover expert insights and tips in this comprehensive ${category} guide based on: ${prompt.substring(0, 80)}...`;

    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const metaContent = metaData.choices[0]?.message?.content;

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
      console.warn('Meta response not ok:', metaResponse.status, metaResponse.statusText);
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
