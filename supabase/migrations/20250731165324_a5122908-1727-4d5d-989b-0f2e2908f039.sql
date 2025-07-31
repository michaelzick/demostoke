-- Create Chad G. profile
INSERT INTO public.profiles (
  id, 
  name, 
  about, 
  avatar_url, 
  created_at, 
  member_since
) VALUES (
  'chad-g'::uuid, 
  'Chad G.', 
  'Chad G. is really just AI (Chad G. = ChatGPT). He writes based off prompts because Michael is either too lazy or too busy to write, and ChatGPT is good at summarizing data and putting it in written form.

Any post that''s written by Michael Zick or anyone else is, in fact, written by a human. Btw, this About section was written by Michael Zick and not ChatGTP.', 
  'https://api.dicebear.com/6.x/avataaars/svg?seed=chad-g',
  now(),
  now()
);