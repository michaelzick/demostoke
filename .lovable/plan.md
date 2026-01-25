

## Fix: Blog Text Generation Empty Response

### Problem Analysis
The `generate-blog-text` edge function is failing because:
1. It uses OpenAI's `gpt-5-mini` model directly via `api.openai.com`
2. GPT-5-mini consumes ALL completion tokens (4000) for internal "reasoning", leaving 0 tokens for actual output
3. This results in `content: ""` with `finish_reason: "length"`

### Solution
Switch to **Lovable AI Gateway** using `google/gemini-3-flash-preview` (the recommended default model), which doesn't have this reasoning token issue.

### Technical Changes

**File: `supabase/functions/generate-blog-text/index.ts`**

1. Replace OpenAI API endpoint with Lovable AI Gateway:
   - Change `https://api.openai.com/v1/chat/completions` → `https://ai.gateway.lovable.dev/v1/chat/completions`

2. Replace API key:
   - Change `OPENAI_API_KEY` → `LOVABLE_API_KEY` (auto-provisioned)

3. Update model:
   - Change `gpt-5-mini` → `google/gemini-3-flash-preview`

4. Update token parameters:
   - Replace `max_completion_tokens` with `max_tokens` for Gemini compatibility
   - Increase to 8000 tokens for content generation (blog posts need more space)
   - Keep 1500 tokens for meta generation

### Code Changes Summary

```typescript
// Before
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
// ...
const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${openAIApiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-5-mini',
    max_completion_tokens: 4000,
  }),
});

// After  
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
// ...
const contentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${lovableApiKey}`,
  },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview',
    max_tokens: 8000,
  }),
});
```

### Impact
- Blog text generation will work reliably
- Uses Google Gemini which is faster and doesn't have the reasoning token issue
- `LOVABLE_API_KEY` is auto-provisioned (no configuration needed)
- Both content generation and meta (title/excerpt) generation calls will be updated

