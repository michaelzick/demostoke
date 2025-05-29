import { BlogPost } from "@/lib/blog";

export const searchBlogPostsWithNLP = async (query: string, posts: BlogPost[]): Promise<BlogPost[]> => {
  console.log(`Processing blog search query: "${query}"`);
  
  // Convert query to lowercase for easier matching
  const lowerQuery = query.toLowerCase();
  
  // Score-based search algorithm
  const scoredPosts = posts.map(post => {
    let score = 0;
    
    // Title matching (highest weight)
    if (post.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }
    
    // Category matching
    if (post.category.toLowerCase().includes(lowerQuery)) {
      score += 8;
    }
    
    // Tags matching
    post.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        score += 6;
      }
    });
    
    // Content matching
    if (post.content.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
    
    // Excerpt matching
    if (post.excerpt.toLowerCase().includes(lowerQuery)) {
      score += 4;
    }
    
    // Author matching
    if (post.author.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }
    
    // Keyword-based scoring for specific terms
    const keywords = {
      'beginner': ['beginner', 'start', 'first', 'guide', 'basics'],
      'advanced': ['advanced', 'expert', 'pro', 'master', 'technique'],
      'gear': ['gear', 'equipment', 'setup', 'board', 'selection'],
      'technique': ['technique', 'tips', 'how to', 'method', 'skill'],
      'safety': ['safety', 'protection', 'avalanche', 'precaution'],
      'yoga': ['yoga', 'balance', 'mindfulness', 'meditation'],
      'powder': ['powder', 'deep snow', 'backcountry'],
      'wave': ['wave', 'surf', 'ocean', 'water'],
      'park': ['park', 'bowl', 'ramp', 'transition'],
      'street': ['street', 'urban', 'rail', 'ledge']
    };
    
    Object.values(keywords).flat().forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        score += 2;
      }
    });
    
    return { post, score };
  });
  
  // Filter posts with score > 0 and sort by score
  const filteredPosts = scoredPosts
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
  
  // Add a delay to simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return filteredPosts;
};
