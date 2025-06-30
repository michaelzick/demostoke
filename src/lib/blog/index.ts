import { BlogPost } from './types';
import { snowboardsPosts } from './snowboardsPosts';
import { skisPosts } from './skisPosts';
import { surfboardsPosts } from './surfboardsPosts';
import { mountainBikesPosts } from './mountainBikesPosts';
import { gearReviewsPosts } from './gearReviewsPosts';
import { storiesThatStokePosts } from './storiesThatStokePosts';

export type { BlogPost };

export const blogPosts: BlogPost[] = [
  ...snowboardsPosts,
  ...skisPosts,
  ...surfboardsPosts,
  ...mountainBikesPosts,
  ...gearReviewsPosts,
  ...storiesThatStokePosts
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
