// Stack công cụ theo use-case kiếm tiền online (ngách mà các directory lớn bỏ qua).
// toolId = id trong src/data/json/tools.json. Tiêu đề nhắm từ khóa dài, cạnh tranh thấp.

export type StackStep = {
  /** Vai trò của tool trong quy trình, ví dụ "Voiceover" */
  role: string;
  toolId: number;
  why: string;
};

export type UseCaseStack = {
  slug: string;
  title: string;
  /** Từ khóa SEO chính */
  keyword: string;
  description: string;
  intro: string;
  steps: StackStep[];
};

export const USE_CASES: UseCaseStack[] = [
  {
    slug: "faceless-youtube",
    title: "AI Tool Stack for a Faceless YouTube Channel",
    keyword: "faceless YouTube AI tools",
    description: "The AI tools you need to script, voice, edit and repurpose videos for a faceless YouTube channel.",
    intro:
      "A faceless channel lives or dies on how fast you can turn a script into a finished video. This stack covers voiceover, editing and repurposing so one person can publish several videos a week.",
    steps: [
      { role: "Voiceover", toolId: 1, why: "Realistic narration in many languages, so you never record your own voice." },
      { role: "Alternative voiceover", toolId: 3, why: "Studio-style voices with simple timing controls for explainer videos." },
      { role: "Editing", toolId: 4, why: "Edit the video by editing the transcript and remove filler words automatically." },
      { role: "Repurposing", toolId: 79, why: "Turn each video into show notes, social posts and newsletter copy." },
    ],
  },
  {
    slug: "etsy-print-on-demand",
    title: "AI Tools for Etsy Sellers and Print on Demand",
    keyword: "AI tools for Etsy sellers",
    description: "AI tools to design, photograph, list and market print-on-demand products on Etsy and Shopify.",
    intro:
      "Print on demand is a volume game: more designs, better listings and repeat buyers. These tools help a solo seller cover branding, product images, listings and email follow-ups.",
    steps: [
      { role: "Production & fulfilment", toolId: 12, why: "Print-on-demand catalog with mockups and automatic order routing." },
      { role: "Branding", toolId: 2, why: "Generate a logo and brand kit for your shop in minutes." },
      { role: "Product photos", toolId: 8, why: "Product photography and video without running your own studio." },
      { role: "Listing copy", toolId: 18, why: "SEO-friendly product titles and descriptions at scale." },
      { role: "Email & SMS", toolId: 17, why: "Abandoned-cart and win-back flows built for e-commerce." },
    ],
  },
  {
    slug: "affiliate-blogging",
    title: "AI Tools for Affiliate Blogs",
    keyword: "AI writing tools for affiliate blogs",
    description: "The AI tools affiliate bloggers use to write, build landing pages and grow an email list.",
    intro:
      "Affiliate income comes from search traffic and an email list you own. This stack helps you publish faster, capture readers and send them the offers that pay.",
    steps: [
      { role: "Email list", toolId: 50, why: "Creator-focused email marketing with landing pages and automations." },
      { role: "Landing pages", toolId: 61, why: "Build and A/B test review and bonus pages without a developer." },
      { role: "Copywriting", toolId: 18, why: "Draft product roundups and comparison copy faster." },
      { role: "Email design", toolId: 71, why: "Drag-and-drop email templates for deal and roundup newsletters." },
    ],
  },
  {
    slug: "freelancers",
    title: "AI Tools for Freelancers",
    keyword: "AI tools for freelancers",
    description: "AI tools that help freelancers plan work, run client calls, and get paid on time.",
    intro:
      "Freelancers sell hours, so every hour saved on admin is profit. These tools handle scheduling, meeting notes, project tracking and invoicing.",
    steps: [
      { role: "Projects & clients", toolId: 73, why: "One workspace for tasks, docs and client deliverables." },
      { role: "Scheduling", toolId: 77, why: "Auto-plans your day around deadlines and meetings." },
      { role: "Calendar defense", toolId: 76, why: "Protects focus time and habits on a busy calendar." },
      { role: "Meeting notes", toolId: 74, why: "Records client calls and writes the summary and action items." },
      { role: "Invoicing", toolId: 23, why: "Invoices, expenses and bank reconciliation in one place." },
    ],
  },
  {
    slug: "side-hustle-starter",
    title: "AI Side Hustle Starter Stack",
    keyword: "AI tools for side hustles",
    description: "A low-cost AI stack to launch a side hustle: brand, website, audience and lifetime deals.",
    intro:
      "Starting a side hustle should not cost a fortune in subscriptions. Start lean with these tools, then upgrade only what earns its keep.",
    steps: [
      { role: "Lifetime deals", toolId: 68, why: "Buy software once instead of paying monthly while you validate the idea." },
      { role: "Branding", toolId: 2, why: "A professional logo and brand kit without hiring a designer." },
      { role: "Website / app", toolId: 81, why: "Build a client portal or simple web app without code." },
      { role: "Audience", toolId: 50, why: "Start your email list on day one." },
      { role: "Content repurposing", toolId: 79, why: "Turn one recording into a week of content." },
    ],
  },
];
