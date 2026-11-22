import { notFound, permanentRedirect } from 'next/navigation';
import BlogPost from '@/screens/BlogPostPage';
import { SsrPageDataProvider } from '@/contexts/SsrPageDataContext';
import { loadBlogPost } from '@/lib/server/public-catalog';
import { addQuery, type SearchValues } from '@/lib/seo/redirect-query';
import { JsonLd, toNextMetadata } from '@/lib/seo/next-metadata';
import { PUBLIC_SITE_URL, buildBlogPostTitle } from '@/lib/seo/publicMetadata';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchValues> };
const path = (id: string) => `/blog/${encodeURIComponent(id)}`;

export async function generateMetadata({ params }: Props) {
  const post = await loadBlogPost((await params).slug);
  if (!post) notFound();
  return toNextMetadata({
    title: buildBlogPostTitle(post.title),
    description: post.excerpt,
    image: post.thumbnail || post.heroImage || undefined,
    type: 'article',
    canonicalUrl: PUBLIC_SITE_URL + path(post.id),
  });
}

export default async function BlogPostRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  const post = await loadBlogPost(slug);
  if (!post) notFound();
  if (post.id !== slug) permanentRedirect(addQuery(path(post.id), await searchParams));
  return (
    <SsrPageDataProvider value={{ blog: { slug, post } }}>
      <JsonLd value={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.heroImage || post.thumbnail,
        datePublished: post.publishedAt,
        mainEntityOfPage: PUBLIC_SITE_URL + path(post.id),
        author: { '@type': 'Person', name: post.author },
      }} />
      <BlogPost />
    </SsrPageDataProvider>
  );
}
