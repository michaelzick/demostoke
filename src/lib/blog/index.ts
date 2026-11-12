import type { BlogPost } from './types';
import { snowboardsPosts } from './snowboardsPosts.ts';
import { skisPosts } from './skisPosts.ts';
import { surfboardsPosts } from './surfboardsPosts.ts';
import { mountainBikesPosts } from './mountainBikesPosts.ts';
import { gearReviewsPosts } from './gearReviewsPosts.ts';
import { storiesThatStokePosts } from './storiesThatStokePosts.ts';

export type { BlogPost };

// Static blog posts - these will be combined with database posts
export const blogPosts: BlogPost[] = [
  ...surfboardsPosts,
  ...snowboardsPosts,
  ...skisPosts,
  ...mountainBikesPosts,
  ...gearReviewsPosts,
  ...storiesThatStokePosts,
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
