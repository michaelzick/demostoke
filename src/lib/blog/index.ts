
import { BlogPost } from './types';
import { snowboardsPosts } from './snowboardsPosts';
import { skisPosts } from './skisPosts';
import { surfboardsPosts } from './surfboardsPosts';
import { supsPosts } from './supsPosts';
import { mountainBikesPosts } from './mountainBikesPosts';
import { gearReviewsPosts } from './gearReviewsPosts';

export type { BlogPost };

// Your user ID - replace this with your actual user ID
const MICHAEL_ZICK_USER_ID = "98f914a6-2a72-455d-aa4b-41b081f4014d";

// Update all blog posts to have Michael Zick as author
const updatePostsWithAuthor = (posts: Omit<BlogPost, 'author' | 'authorId'>[]): BlogPost[] => {
  return posts.map(post => ({
    ...post,
    author: "Michael Zick",
    authorId: MICHAEL_ZICK_USER_ID
  }));
};

export const blogPosts: BlogPost[] = [
  ...updatePostsWithAuthor(snowboardsPosts as Omit<BlogPost, 'author' | 'authorId'>[]),
  ...updatePostsWithAuthor(skisPosts as Omit<BlogPost, 'author' | 'authorId'>[]),
  ...updatePostsWithAuthor(surfboardsPosts as Omit<BlogPost, 'author' | 'authorId'>[]),
  ...updatePostsWithAuthor(supsPosts as Omit<BlogPost, 'author' | 'authorId'>[]),
  ...updatePostsWithAuthor(mountainBikesPosts as Omit<BlogPost, 'author' | 'authorId'>[]),
  ...updatePostsWithAuthor(gearReviewsPosts as Omit<BlogPost, 'author' | 'authorId'>[])
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
