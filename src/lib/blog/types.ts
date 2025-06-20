
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
  tags: string[];
}
