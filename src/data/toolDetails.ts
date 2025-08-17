import { ToolDetail } from '../types/tool';

export const TOOL_DETAILS: Partial<ToolDetail>[] = [
  {
    id: 1,                      // match với id trong data/tools.ts
    name: "Spellbook-ai",
    longDescription:
      "Unlock the full potential of legal drafting with Spellbook, the AI-powered contract assistant designed to streamline the work of lawyers and legal teams. Built on advanced language models, Spellbook integrates directly into Microsoft Word, enabling professionals to draft, review, and edit contracts faster and with greater confidence",
    features: [
      "Inline writing assistant",
      "Context aware summarization",
      "Database insights",
      "Multi language support"
    ],
    pros: [
      "Deep integration with Notion",
      "Fast onboarding",
      "Good summaries for long docs"
    ],
    cons: [
      "Quality varies on niche topics",
      "Works best when data is inside Notion"
    ],
    screenshots: [
      "/screens/notion-1.png",
      "/screens/notion-2.png"
    ],
    videoReviews: [
      {
        title: "Bioptimus overview and demo",
        url: "https://www.youtube.com/watch?v=nk-8pYW7xh0",
        channel: "AI Reviews",
        publishedAt: "2025-06-01"
      },
      {
        title: "Hands-on with Bioptimus",
        url: "https://www.youtube.com/watch?v=Wdc2iLwFNWY",
        channel: "Tech Lab",
        publishedAt: "2025-05-12"
      }
    ],
    useCases: ["Meeting notes", "Blog draft", "PRD outline"],
    idealFor: ["Content team", "PM", "Solo creator"],
    integrations: ["Notion DB", "Zapier"],
    metrics: { users: "3M+", founded: "2016", lastUpdated: "2025-07-20" },
    pricingTiers: [
      { name: "Plus", price: "10 USD", billing: "monthly", features: ["Basic AI writing", "Summaries"] },
      { name: "Business", price: "18 USD", billing: "monthly", features: ["Team features", "Admin controls"] }
    ],
    seo: {
      title: "Notion AI review, pricing, features",
      description: "Hands on review of Notion AI with pricing and best use cases.",
      canonical: "https://digitaltoolshub.app/tools/notion-ai"
    }
  },
  {
    id: 2,
    name: "AgentVerse",
    longDescription:
      "AgentVerse is more than a framework. It is a launchpad for innovation, a playground for experimentation, and a reliable partner for scaling multi agent intelligence into impactful applications that redefine the limits of AI.",
    features: [
      "High quality image generation",
      "Style presets",
      "Community prompts"
    ],
    pros: ["Great quality", "Rich styles"],
    cons: ["Requires learning prompt skills"],
    screenshots: [
      "/screens/mj-1.jpg",
      "/screens/mj-2.jpg"
    ],
    videoReviews: [
      {
        title: "Bioptimus overview and demo",
        url: "https://www.youtube.com/watch?v=FflyAPU5Ih4",
        channel: "AI Reviews",
        publishedAt: "2025-06-01"
      },
      {
        title: "Hands-on with Bioptimus",
        url: "https://www.youtube.com/watch?v=Dut5lRfPBMM",
        channel: "Tech Lab",
        publishedAt: "2025-05-12"
      }
    ],
    metrics: { users: "15M+", founded: "2022", lastUpdated: "2025-06-10" },
    seo: {
      title: "Midjourney use cases and pricing",
      description: "Guide to Midjourney strengths, limits and pricing options.",
      canonical: "https://digitaltoolshub.app/tools/midjourney"
    }
  }
];
