export interface PreviewChapter {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface Ebook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  price: number;
  priceType: "free" | "basic" | "premium" | "vip";
  googleDriveLink: string;
  category: string;
  pages: number;
  fileSize: string;
  rating: number;
  publishedDate: string;
  downloads?: number;
  previewChapters?: PreviewChapter[];
  hasPreview?: boolean;
}

export const ebooks: Ebook[] = [
  {
    id: 1,
    title: "Complete Guide to AI Tools",
    author: "John Smith",
    description:
      "A comprehensive guide to using AI tools for productivity and creativity. Learn how to leverage ChatGPT, Midjourney, and other AI platforms.",
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop",
    price: 0,
    priceType: "free",
    googleDriveLink: "https://drive.google.com/file/d/example1/view",
    category: "AI & Technology",
    pages: 150,
    fileSize: "5.2 MB",
    rating: 4.8,
    publishedDate: "2024-01-15",
    downloads: 12450,
    hasPreview: true,
    previewChapters: [
      {
        chapterNumber: 1,
        title: "Introduction: The AI Revolution",
        wordCount: 2840,
        content: `
<p>We are living through one of the most transformative periods in human history. Artificial Intelligence, once the stuff of science fiction, has become an accessible tool that anyone with an internet connection can use. But with great power comes great responsibility — and great opportunity.</p>

<p>When I first started experimenting with AI tools in early 2022, I was overwhelmed. There were hundreds of tools, each claiming to revolutionize my workflow. Some were genuinely useful; others were expensive wrappers around free APIs. I wasted hundreds of dollars and countless hours before finding the tools that actually delivered results.</p>

<p>This book is the guide I wish I had. It's not a comprehensive directory of every AI tool — that would be obsolete by the time it's published. Instead, it's a framework for <strong>evaluating, selecting, and mastering</strong> the AI tools that matter for your specific work.</p>

<p>Whether you're a solo creator, a startup founder, a corporate knowledge worker, or a student — if you work with information, this book is for you. The principles apply regardless of your technical background.</p>

<blockquote><p><strong>Key Insight:</strong> The best AI tool isn't the most powerful one — it's the one you actually use consistently. Mastery of a few tools beats superficial knowledge of many.</p></blockquote>

<p>Each chapter includes practical exercises, real-world examples, and “Try This Now” boxes for immediate application. You don't need to read linearly — jump to the sections most relevant to your current challenges.</p>

<p><em>This is a preview of Chapter 1. The full chapter includes 3 additional sections, 5 practical exercises, and a curated list of 12 starter prompts for different use cases.</em></p>
        `,
      },
    ],
  },
  {
    id: 2,
    title: "Digital Marketing Mastery",
    author: "Sarah Johnson",
    description:
      "Master digital marketing strategies including SEO, social media marketing, and content creation for maximum ROI.",
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
    price: 9.99,
    priceType: "basic",
    googleDriveLink: "https://drive.google.com/file/d/example2/view",
    category: "Marketing",
    pages: 200,
    fileSize: "8.5 MB",
    rating: 4.6,
    publishedDate: "2024-02-20",
    downloads: 8930,
    hasPreview: true,
    previewChapters: [
      {
        chapterNumber: 1,
        title: "Introduction: The AI Revolution",
        wordCount: 2840,
        content: `
<p>We are living through one of the most transformative periods in human history. Artificial Intelligence, once the stuff of science fiction, has become an accessible tool that anyone with an internet connection can use. But with great power comes great responsibility — and great opportunity.</p>

<p>When I first started experimenting with AI tools in early 2022, I was overwhelmed. There were hundreds of tools, each claiming to revolutionize my workflow. Some were genuinely useful; others were expensive wrappers around free APIs. I wasted hundreds of dollars and countless hours before finding the tools that actually delivered results.</p>

<p>This book is the guide I wish I had. It's not a comprehensive directory of every AI tool — that would be obsolete by the time it's published. Instead, it's a framework for <strong>evaluating, selecting, and mastering</strong> the AI tools that matter for your specific work.</p>

<p>Whether you're a solo creator, a startup founder, a corporate knowledge worker, or a student — if you work with information, this book is for you. The principles apply regardless of your technical background.</p>

<blockquote><p><strong>Key Insight:</strong> The best AI tool isn't the most powerful one — it's the one you actually use consistently. Mastery of a few tools beats superficial knowledge of many.</p></blockquote>

<p>Each chapter includes practical exercises, real-world examples, and “Try This Now” boxes for immediate application. You don't need to read linearly — jump to the sections most relevant to your current challenges.</p>

<p><em>This is a preview of Chapter 1. The full chapter includes 3 additional sections, 5 practical exercises, and a curated list of 12 starter prompts for different use cases.</em></p>
        `,
      },
    ],
  },
  {
    id: 3,
    title: "Web Development Complete Course",
    author: "Mike Chen",
    description:
      "From HTML basics to advanced React and Node.js. Build modern web applications from scratch.",
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop",
    price: 19.99,
    priceType: "premium",
    googleDriveLink: "https://drive.google.com/file/d/example3/view",
    category: "Programming",
    pages: 350,
    fileSize: "15.3 MB",
    rating: 4.9,
    publishedDate: "2024-03-10",
    downloads: 15620,
  },
  {
    id: 4,
    title: "Business Strategy for Startups",
    author: "Emily Davis",
    description:
      "Essential strategies for launching and scaling your startup. Learn from real-world case studies and expert insights.",
    coverImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop",
    price: 29.99,
    priceType: "vip",
    googleDriveLink: "https://drive.google.com/file/d/example4/view",
    category: "Business",
    pages: 280,
    fileSize: "12.1 MB",
    rating: 4.7,
    publishedDate: "2024-04-05",
    downloads: 6780,
  },
  {
    id: 5,
    title: "Photography Fundamentals",
    author: "David Wilson",
    description:
      "Master the art of photography with this comprehensive guide covering composition, lighting, and post-processing techniques.",
    coverImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=600&fit=crop",
    price: 0,
    priceType: "free",
    googleDriveLink: "https://drive.google.com/file/d/example5/view",
    category: "Photography",
    pages: 120,
    fileSize: "25.8 MB",
    rating: 4.5,
    publishedDate: "2024-01-28",
    downloads: 23410,
  },
  {
    id: 6,
    title: "Data Science with Python",
    author: "Lisa Anderson",
    description:
      "Learn data science concepts and Python programming for data analysis, visualization, and machine learning.",
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop",
    price: 14.99,
    priceType: "basic",
    googleDriveLink: "https://drive.google.com/file/d/example6/view",
    category: "Data Science",
    pages: 300,
    fileSize: "18.7 MB",
    rating: 4.8,
    publishedDate: "2024-02-15",
    downloads: 11240,
  },
  {
    id: 7,
    title: "UX Design Principles",
    author: "Alex Turner",
    description:
      "Create user-centered designs with this guide to UX principles, wireframing, prototyping, and user testing.",
    coverImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=600&fit=crop",
    price: 24.99,
    priceType: "premium",
    googleDriveLink: "https://drive.google.com/file/d/example7/view",
    category: "Design",
    pages: 180,
    fileSize: "9.4 MB",
    rating: 4.6,
    publishedDate: "2024-03-22",
    downloads: 8920,
  },
  {
    id: 8,
    title: "Financial Planning Guide",
    author: "Robert Brown",
    description:
      "Take control of your finances with practical advice on budgeting, investing, and building wealth for the future.",
    coverImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    price: 39.99,
    priceType: "vip",
    googleDriveLink: "https://drive.google.com/file/d/example8/view",
    category: "Finance",
    pages: 220,
    fileSize: "7.2 MB",
    rating: 4.9,
    publishedDate: "2024-04-18",
    downloads: 5670,
  },
];

export const getPriceTypeLabel = (priceType: Ebook["priceType"]): string => {
  const labels: Record<Ebook["priceType"], string> = {
    free: "Free",
    basic: "Basic",
    premium: "Premium",
    vip: "VIP",
  };

  return labels[priceType];
};

export const getPriceTypeColor = (priceType: Ebook["priceType"]): string => {
  const colors: Record<Ebook["priceType"], string> = {
    free: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    premium:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    vip: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };

  return colors[priceType];
};
