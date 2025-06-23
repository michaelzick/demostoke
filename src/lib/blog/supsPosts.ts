
import { BlogPost } from './types';

// SUPs category has been removed from the system
// This file is kept for reference but exports an empty array
export const supsPosts: Omit<BlogPost, 'author' | 'authorId'>[] = [];
