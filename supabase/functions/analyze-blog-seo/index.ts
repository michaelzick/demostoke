import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  title: string;
  excerpt: string;
  content: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { title, excerpt, content, category }: AnalyzeRequest = await req.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing SEO for blog post:', { title: title.substring(0, 50), category });

    const systemPrompt = `You are an expert SEO analyst specializing in 2024-2025 search optimization trends, including traditional SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) for AI search results.

Analyze blog content and provide scores (0-100) and specific feedback for:

1. TITLE ANALYSIS (0-100):
- Length optimization (50-60 characters ideal)
- Primary keyword placement (preferably at beginning)
- Emotional/power words inclusion
- Click-through rate potential
- Search intent alignment

2. EXCERPT ANALYSIS (0-100):
- Length optimization (150-160 characters ideal)
- Call-to-action presence
- Primary keyword inclusion
- Snippet optimization potential
- Compelling value proposition

3. CONTENT ANALYSIS (0-100):
- Word count (1500+ ideal for authority)
- Keyword density and semantic keywords
- Header structure (H1, H2, H3 hierarchy)
- Readability and user experience
- Topic depth and expertise demonstration
- Answer Engine Optimization (AEO) elements:
  * Direct answers to common questions
  * Structured data potential
  * Featured snippet optimization
- Generative Engine Optimization (GEO):
  * AI-friendly content structure
  * Comprehensive topic coverage
  * Authoritative source citations
  * Entity recognition optimization

4. OVERALL SCORE: Weighted average considering current ranking factors

Return JSON with this exact structure:
{
  "success": true,
  "overall_score": number,
  "title_score": number,
  "excerpt_score": number,
  "content_score": number,
  "title_analysis": "specific feedback for title",
  "excerpt_analysis": "specific feedback for excerpt", 
  "content_analysis": "specific feedback for content",
  "suggestions": ["actionable improvement 1", "actionable improvement 2", ...]
}

Consider current SEO trends:
- E-A-T (Expertise, Authoritativeness, Trustworthiness)
- Core Web Vitals and user experience
- Mobile-first indexing
- Voice search optimization
- AI search engine optimization
- Semantic search and entity optimization`;

    const userPrompt = `Analyze this blog post for SEO optimization:

CATEGORY: ${category}

TITLE: ${title}

EXCERPT: ${excerpt}

CONTENT: ${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

Provide detailed SEO analysis with actionable suggestions for 2024-2025 search optimization.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('OpenAI response:', analysisText.substring(0, 200));

    // Parse the JSON response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      
      // Fallback: create basic analysis
      analysisResult = {
        success: true,
        overall_score: 60,
        title_score: title.length >= 50 && title.length <= 60 ? 80 : 50,
        excerpt_score: excerpt.length >= 150 && excerpt.length <= 160 ? 80 : 50,
        content_score: content.split(' ').length >= 1500 ? 70 : 40,
        title_analysis: `Title is ${title.length} characters. ${title.length < 50 ? 'Consider making it longer.' : title.length > 60 ? 'Consider shortening it.' : 'Good length!'}`,
        excerpt_analysis: `Excerpt is ${excerpt.length} characters. ${excerpt.length < 150 ? 'Consider making it longer.' : excerpt.length > 160 ? 'Consider shortening it.' : 'Good length!'}`,
        content_analysis: `Content has ${content.split(' ').length} words. ${content.split(' ').length < 1500 ? 'Consider adding more comprehensive coverage.' : 'Good length for authority content.'}`,
        suggestions: [
          'Include target keywords in the first paragraph',
          'Add relevant subheadings (H2, H3) to structure content',
          'Include internal and external links',
          'Optimize for featured snippets with direct answers'
        ]
      };
    }

    // Ensure scores are within valid range
    analysisResult.overall_score = Math.max(0, Math.min(100, analysisResult.overall_score || 0));
    analysisResult.title_score = Math.max(0, Math.min(100, analysisResult.title_score || 0));
    analysisResult.excerpt_score = Math.max(0, Math.min(100, analysisResult.excerpt_score || 0));
    analysisResult.content_score = Math.max(0, Math.min(100, analysisResult.content_score || 0));

    console.log('Final analysis result:', JSON.stringify(analysisResult, null, 2));

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-blog-seo function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to analyze SEO'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});