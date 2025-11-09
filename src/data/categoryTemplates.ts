import { ToolDetail } from '../types/tool';

type CategoryTemplateMap = Record<string, Partial<ToolDetail>>;

export const CATEGORY_TEMPLATES: CategoryTemplateMap = {
  ai: {
    features: [
      "Prompt library",
      "Model selection",
      "Export to PDF"
    ],
    pros: ["Time saving", "Easy prompt reuse"],
    cons: ["Token limit on free plan"],
    screenshots: ["/images/placeholders/ai-1.jpg"]
  },
  marketing: {
    features: ["Campaign builder", "A/B testing", "Lead scoring"],
    pros: ["Improved conversion"],
    cons: ["Needs data setup"],
    screenshots: ["/images/placeholders/mkt-1.jpg"]
  },
  saas: {
    features: ["SSO", "Role based access", "Audit logs"],
    pros: ["Good security baseline"],
    cons: ["Setup time required"],
    screenshots: ["/images/placeholders/saas-1.jpg"]
  }
  // thêm category khác nếu cần
};

// Human-friendly industry descriptions used on homepage
export const INDUSTRY_DESCRIPTIONS: Record<string, string> = {
  'e-commerce': 'Online selling platforms, dropshipping solutions, product description optimization, store management, and conversion rate optimization tools.',
  'marketing': 'Ad content creation tools, automated marketing campaign management, SEO optimization solutions, and customer behavior analytics platforms.',
  'education': 'E-learning platforms, course creation and LMS tools to build and deliver online training at scale.',
  'finance': 'Financial planning, analytics and fintech tools for investment, trading, and business finance automation.',
  'healthcare': 'Medical image analysis, telehealth platforms and AI-driven clinical decision support tools.',
  'hr': 'Recruiting and HR tools including applicant screening, interview automation, and workforce management.',
  'creative': 'Design and creative tooling for image/video generation, templates, and visual content workflows.',
  'software': 'Developer tools and devops platforms to speed coding, testing, and deployment workflows.',
  'productivity': 'Automation, task management, and workflow tools that boost individual and team productivity.'
};

// Short descriptions for functions/feature groups
export const FUNCTIONS_DESCRIPTIONS: Record<string, string> = {
  'ai-text': 'Generate high-quality text for articles, emails, ads, and scripts using AI text generators.',
  'ai-image-video': 'Create or edit images and videos from text prompts to speed up visual content production.',
  'chatbot': 'Automate customer interactions and support with AI chatbots and virtual agents.',
  'automation': 'Automate repetitive tasks and workflows to save time and reduce manual work.',
  'design': 'Tools for interface design, visual templates, and creative assets powered by AI.',
  'analytics': 'Data visualization and reporting tools to track performance and generate insights.',
  'content-management': 'Systems to organize, publish, and distribute digital content effectively.',
  'lead-gen': 'Tools for capturing leads, running forms, chatbots, and managing the sales funnel.',
  'seo-ads': 'SEO and ad optimization tools for keyword analysis and campaign performance.'
};
