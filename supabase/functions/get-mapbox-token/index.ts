
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  console.log('🚀 Edge Function invoked with method:', req.method);
  console.log('🔍 Request URL:', req.url);

  // Handle CORS preflight requests IMMEDIATELY
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('🔑 Processing get-mapbox-token request');
    
    // Try multiple environment variable names
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN') || 
                        Deno.env.get('VITE_MAPBOX_TOKEN') || 
                        Deno.env.get('REACT_APP_MAPBOX_TOKEN');
    
    console.log('🔍 Environment check:');
    console.log('  - MAPBOX_TOKEN exists:', !!MAPBOX_TOKEN);
    
    if (!MAPBOX_TOKEN) {
      console.error('❌ No Mapbox token found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          details: 'No MAPBOX_TOKEN environment variable found. Please set MAPBOX_TOKEN in your Supabase Edge Function secrets.',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('  - MAPBOX_TOKEN length:', MAPBOX_TOKEN.length);
    console.log('  - MAPBOX_TOKEN starts with pk.:', MAPBOX_TOKEN.startsWith('pk.'));
    
    if (!MAPBOX_TOKEN.startsWith('pk.')) {
      console.error('❌ MAPBOX_TOKEN does not appear to be a valid public token');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Mapbox token format',
          details: 'Token should be a public token starting with "pk."',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Returning valid Mapbox token');
    const response = {
      token: MAPBOX_TOKEN,
      timestamp: new Date().toISOString(),
      success: true
    };
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Unexpected error in get-mapbox-token function:', error);
    
    // Always return CORS headers, even in error cases
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
