import type { ProductConfig } from "./types";

export const product: ProductConfig = {
  id: "openslot",
  name: "Openslot",
  category: "Work & Delivery",
  tagline: "Booking links and lead routing you host yourself.",
  description:
    "A self-hosted scheduling and routing workspace for revenue, recruiting, and customer teams.",
  repositoryUrl: "https://github.com/ConseilTek-Tektons/openslot",
  nav: [
    { label: "Schedule" },
    { label: "Event types" },
    { label: "Routing", badge: "3" },
    { label: "Analytics" },
  ],
  demoUsers: [
    {
      id: "demo-admin",
      name: "Maya Chen",
      email: "maya@northstar.example",
      role: "admin",
      label: "Workspace admin",
    },
    {
      id: "demo-manager",
      name: "Jon Bell",
      email: "jon@northstar.example",
      role: "manager",
      label: "Revenue manager",
    },
    {
      id: "demo-host",
      name: "Priya Rao",
      email: "priya@northstar.example",
      role: "host",
      label: "Meeting host",
    },
  ],
  ai: {
    name: "Routing copilot",
    description:
      "Ask about booking volume, routing fairness, availability policy, or operating procedures.",
    systemPrompt:
      "You are Openslot's scheduling operations copilot. Answer only from the supplied workspace context and retrieved knowledge. Explain routing and availability decisions clearly. Never invent customer, calendar, or CRM data. If the answer is not supported, say what an administrator should inspect next.",
    suggestedQuestions: [
      "Which routing pool needs attention?",
      "How do we prevent double bookings?",
      "Explain the enterprise lead routing policy.",
    ],
  },
};
