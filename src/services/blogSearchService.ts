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
      'safety': ['safety', 'protection', 'avalanche', 'precaution']
    };

    // Add keyword matching scores
    Object.entries(keywords).forEach(([category, synonyms]) => {
      if (synonyms.some(word => lowerQuery.includes(word))) {
        score += 2;
      }
    });

    return {
      post,
      score
    };
  });

  // Filter out posts with no score and sort by score descending
  const results = scoredPosts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.post);

  return results;
};
