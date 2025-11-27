
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  publishedAt: string;
  readTime: number;
  heroImage: string;
  thumbnail: string;
  videoEmbed?: string;
  tags: string[];
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  userId?: string;
  scheduledFor?: string;
  lastAutoSavedAt?: string;
  createdFromPostId?: string;
}
