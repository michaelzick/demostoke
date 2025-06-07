
import { BlogPost } from './types';
import { snowboardsPosts } from './snowboardsPosts';
import { skisPosts } from './skisPosts';
import { surfboardsPosts } from './surfboardsPosts';
import { supsPosts } from './supsPosts';
import { mountainBikesPosts } from './mountainBikesPosts';
import { gearReviewsPosts } from './gearReviewsPosts';

export type { BlogPost };

export const blogPosts: BlogPost[] = [
  ...snowboardsPosts,
  ...skisPosts,
  ...surfboardsPosts,
  ...supsPosts,
  ...mountainBikesPosts,
  ...gearReviewsPosts
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
