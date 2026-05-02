import { useParams } from 'react-router-dom';
import BlogPostLayout from '../components/BlogPostLayout';
import { BLOG_POSTS, getPostBySlug } from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug || BLOG_POSTS[0].slug) || BLOG_POSTS[0];
  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 3);

  return <BlogPostLayout post={post} relatedPosts={relatedPosts} />;
}