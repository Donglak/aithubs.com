export type Author = {
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  image?: string;
  twitter?: string;
  website?: string;
};

export const AUTHORS: Author[] = [
  {
    slug: 'sarah-johnson',
    name: 'Sarah Johnson',
    role: 'Content Strategist',
    bio: 'Sarah is a content strategist and AI enthusiast with over 8 years of experience in digital marketing. She helps businesses leverage AI tools to scale their content operations.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    twitter: 'https://twitter.com/sarah_johnson'
  },
  {
    slug: 'mike-chen',
    name: 'Mike Chen',
    role: 'AI Researcher',
    bio: 'Mike writes comparisons and deep dives on AI assistants and their applications in product teams.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    slug: 'emily-rodriguez',
    name: 'Emily Rodriguez',
    role: 'Affiliate Marketing Expert',
    bio: 'Emily focuses on growth strategies and affiliate systems that scale.',
  },
  {
    slug: 'david-kim',
    name: 'David Kim',
    role: 'Product Marketer',
    bio: 'David covers marketing automation and tooling for SMBs.',
  },
  {
    slug: 'lisa-wang',
    name: 'Lisa Wang',
    role: 'No-Code Advocate',
    bio: 'Lisa explores the no-code ecosystem and shares practical how-tos.',
  },
  {
    slug: 'alex-thompson',
    name: 'Alex Thompson',
    role: 'E-commerce Specialist',
    bio: 'Alex writes about e-commerce platforms and store operations.',
  }
];

export function getAuthorBySlug(slug?: string) {
  if (!slug) return undefined;
  return AUTHORS.find(a => a.slug === slug);
}

export function getAuthorByName(name?: string) {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return AUTHORS.find(a => a.name.toLowerCase() === normalized)?.slug;
}
