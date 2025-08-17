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
