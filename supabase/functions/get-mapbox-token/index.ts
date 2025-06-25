
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Edge Function invoked with method:', req.method);
  console.log('🔍 Request URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Processing get-mapbox-token request');
    
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN');
    
    console.log('🔍 Environment check:');
    console.log('  - MAPBOX_TOKEN exists:', !!MAPBOX_TOKEN);
    console.log('  - MAPBOX_TOKEN length:', MAPBOX_TOKEN?.length || 0);
    
    if (!MAPBOX_TOKEN) {
      console.error('❌ MAPBOX_TOKEN environment variable is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          details: 'MAPBOX_TOKEN environment variable is not set'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('  - MAPBOX_TOKEN starts with pk.:', MAPBOX_TOKEN.startsWith('pk.'));
    
    if (!MAPBOX_TOKEN.startsWith('pk.')) {
      console.error('❌ MAPBOX_TOKEN does not appear to be a valid public token');
      console.error('❌ Token starts with:', MAPBOX_TOKEN.substring(0, 10) + '...');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Mapbox token format',
          details: 'Token should start with "pk."'
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
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
