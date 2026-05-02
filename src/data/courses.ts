// src/data/courses.ts
export type Course = {
  id: string;
  title: string;
  platform: "Coursera" | "Udemy" | "edX" | "DeepLearning.AI" | "fast.ai" | "Kaggle" | "Other";
  provider?: string;      // ví dụ: DeepLearning.AI, Stanford, IBM
  level?: "Beginner" | "Intermediate" | "Advanced";
  price?: "Free" | "Paid";
  hours?: number;         // tổng thời lượng ước tính
  rating?: number;        // 0..5
  students?: number;      // số học viên
  url: string;
  image?: string;
  tagline?: string;
  tags?: string[];
};

export const COURSES: Course[] = [
  {
    id: "dlai-mlops",
    title: "Machine Learning Engineering for Production",
    platform: "Coursera",
    provider: "DeepLearning.AI",
    level: "Intermediate",
    price: "Paid",
    hours: 30,
    rating: 4.8,
    students: 120000,
    url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
    image: "https://images.coursera.org/social/mastr.png",
    tagline: "Ship reliable ML systems with real world MLOps",
    tags: ["MLOps", "Deployment", "Pipelines"]
  },
  {
    id: "udemy-pytorch-bootcamp",
    title: "PyTorch for Deep Learning Bootcamp",
    platform: "Udemy",
    provider: "Udemy",
    level: "Beginner",
    price: "Paid",
    hours: 22,
    rating: 4.6,
    students: 85000,
    url: "https://www.udemy.com/course/pytorch-for-deep-learning/",
    image: "https://img-c.udemycdn.com/course/480x270/mastr.jpg",
    tagline: "Hands on deep learning with PyTorch",
    tags: ["PyTorch", "CNN", "RNN"]
  },
  {
    id: "fastai-practical-dl",
    title: "Practical Deep Learning for Coders",
    platform: "fast.ai",
    provider: "fast.ai",
    level: "Intermediate",
    price: "Free",
    hours: 20,
    rating: 4.9,
    students: 200000,
    url: "https://course.fast.ai/",
    image: "https://course.fast.ai/images/ogimage.png",
    tagline: "Top down deep learning for builders",
    tags: ["fastai", "Vision", "NLP"]
  },
  {
    id: "coursera-llm-prompting",
    title: "Prompt Engineering for LLMs",
    platform: "Coursera",
    provider: "Vanderbilt University",
    level: "Beginner",
    price: "Free",
    hours: 8,
    rating: 4.7,
    students: 140000,
    url: "https://www.coursera.org/learn/prompt-engineering",
    image: "https://images.coursera.org/open-graph/mastr.png",
    tagline: "Design effective prompts for LLM applications",
    tags: ["LLM", "Prompt", "Generative AI"]
  },
  {
    id: "kaggle-intro-ml",
    title: "Intro to Machine Learning",
    platform: "Kaggle",
    provider: "Kaggle",
    level: "Beginner",
    price: "Free",
    hours: 6,
    rating: 4.6,
    students: 500000,
    url: "https://www.kaggle.com/learn/intro-to-machine-learning",
    image: "https://www.kaggle.com/static/images/learn/og.png",
    tagline: "Quick ML with hands on notebooks",
    tags: ["Kaggle", "Pandas", "Scikit Learn"]
  },
 { id: "dlai-mlops3",
    title: "Machine Learning Engineering for Production",
    platform: "Coursera",
    provider: "DeepLearning.AI",
    level: "Intermediate",
    price: "Paid",
    hours: 30,
    rating: 4.8,
    students: 120000,
    url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
    image: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/dbbd1f929548aa2b3b38c0e6b2887a0f.png?auto=format%2Ccompress&dpr=1&w=1344&h=548&q=30",
    tagline: "Ship reliable ML systems with real world MLOps",
    tags: ["MLOps", "Deployment", "Pipelines"]
  },
{
    id: "udemy-pytorch-bootcamp1",
    title: "PyTorch for Deep Learning Bootcamp",
    platform: "Udemy",
    provider: "Udemy",
    level: "Beginner",
    price: "Paid",
    hours: 22,
    rating: 4.6,
    students: 85000,
    url: "https://www.udemy.com/course/pytorch-for-deep-learning/",
    image: "https://img-c.udemycdn.com/course/480x270/mastr.jpg",
    tagline: "Hands on deep learning with PyTorch",
    tags: ["PyTorch", "CNN", "RNN"]
  },
{
    id: "udemy-pytorch-bootcamp2",
    title: "PyTorch for Deep Learning Bootcamp",
    platform: "Udemy",
    provider: "Udemy",
    level: "Beginner",
    price: "Paid",
    hours: 22,
    rating: 4.6,
    students: 85000,
    url: "https://www.udemy.com/course/pytorch-for-deep-learning/",
    image: "https://img-c.udemycdn.com/course/480x270/mastr.jpg",
    tagline: "Hands on deep learning with PyTorch",
    tags: ["PyTorch", "CNN", "RNN"]
  },
  {
    id: "udemy-pytorch-bootcamp3",
    title: "PyTorch for Deep Learning Bootcamp",
    platform: "Udemy",
    provider: "Udemy",
    level: "Beginner",
    price: "Paid",
    hours: 22,
    rating: 4.6,
    students: 85000,
    url: "https://www.udemy.com/course/pytorch-for-deep-learning/",
    image: "https://img-c.udemycdn.com/course/480x270/mastr.jpg",
    tagline: "Hands on deep learning with PyTorch",
    tags: ["PyTorch", "CNN", "RNN"]
  },
  {
    id: "udemy-pytorch-bootcamp5",
    title: "PyTorch for Deep Learning Bootcamp",
    platform: "Udemy",
    provider: "Udemy",
    level: "Beginner",
    price: "Paid",
    hours: 22,
    rating: 4.6,
    students: 85000,
    url: "https://www.udemy.com/course/pytorch-for-deep-learning/",
    image: "https://img-c.udemycdn.com/course/480x270/mastr.jpg",
    tagline: "Hands on deep learning with PyTorch",
    tags: ["PyTorch", "CNN", "RNN"]
  },
];
