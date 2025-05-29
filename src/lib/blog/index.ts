import { BlogPost } from './types';
import { snowboardsPosts } from './snowboardsPosts';
import { skisPosts } from './skisPosts';
import { surfboardsPosts } from './surfboardsPosts';
import { supsPosts } from './supsPosts';
import { skateboardsPosts } from './skateboardsPosts';

export type { BlogPost };

export const blogPosts: BlogPost[] = [
  ...snowboardsPosts,
  ...skisPosts,
  ...surfboardsPosts,
  ...supsPosts,
  ...skateboardsPosts
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
