import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GenerateBlogPostRequest {
  prompt: string;
  category: string;
  author: string;
  authorId: string;
  tags: string[];
  thumbnail: string;
  heroImage: string;
  youtubeUrl: string;
  useYoutubeThumbnail: boolean;
  useYoutubeHero: boolean;
  publishedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GenerateBlogPostRequest = await req.json();
    console.log('📝 Generate blog post request:', JSON.stringify(requestData, null, 2));

    if (!requestData.prompt) {
      return new Response(
        JSON.stringify({ error: 'prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional content writer specializing in outdoor gear and adventure sports. Create engaging blog posts that are informative, well-structured, and appeal to outdoor enthusiasts.`;

    const userPrompt = `Write a comprehensive blog post based on this prompt: "${requestData.prompt}"

Category: ${requestData.category}
Target tags: ${requestData.tags.join(', ')}

Please create:
1. A compelling title
2. A brief excerpt/summary (2-3 sentences)
3. Well-structured content with headers and paragraphs
4. Make it engaging and informative for outdoor enthusiasts
5. Include practical tips or insights where relevant

Format the response as a JSON object with the following structure:
{
  "title": "Blog post title",
  "excerpt": "Brief summary of the post",
  "content": "Full blog post content with markdown formatting"
}`;

    console.log('🤖 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate blog post' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('✅ OpenAI API response received');
    
    const generatedContent = data.choices[0].message.content;
    console.log('📄 Generated content length:', generatedContent.length);

    // Parse the JSON response from OpenAI
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback: treat as plain text
      parsedContent = {
        title: `Blog Post - ${requestData.category}`,
        excerpt: 'Generated blog post content',
        content: generatedContent
      };
    }

    // Save the blog post to the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const readTime = Math.ceil(parsedContent.content.split(' ').length / 200);
    
    // Generate slug from title
    const slug = parsedContent.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data: blogPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert([{
        title: parsedContent.title,
        slug: slug,
        excerpt: parsedContent.excerpt,
        content: parsedContent.content,
        category: requestData.category,
        author: requestData.author,
        author_id: requestData.authorId,
        tags: requestData.tags,
        thumbnail: requestData.thumbnail,
        hero_image: requestData.heroImage,
        video_embed: requestData.youtubeUrl || null,
        published_at: requestData.publishedAt,
        read_time: readTime,
        is_featured: false
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error saving blog post to database:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save blog post to database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Blog post saved to database successfully');
    return new Response(
      JSON.stringify({ 
        success: true,
        post: {
          id: blogPost.id,
          slug: blogPost.slug,
          title: blogPost.title,
          excerpt: blogPost.excerpt,
          content: blogPost.content,
          category: blogPost.category,
          author: blogPost.author,
          authorId: blogPost.author_id,
          tags: blogPost.tags,
          thumbnail: blogPost.thumbnail,
          heroImage: blogPost.hero_image,
          videoEmbed: blogPost.video_embed,
          publishedAt: blogPost.published_at,
          readTime: blogPost.read_time
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in generate-blog-post function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});