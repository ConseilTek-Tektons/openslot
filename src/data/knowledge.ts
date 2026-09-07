import type { KnowledgeArticle } from "@/lib/assistant";

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "routing-fairness",
    title: "Routing fairness",
    summary:
      "Weighted round-robin considers eligible hosts, live availability, priority, and the trailing 30-day assignment share. A pool is unhealthy when actual share differs from configured share by more than eight points.",
    content:
      "The evaluator removes unavailable hosts, applies territory and segment rules, and selects the host with the largest fairness deficit. Every decision records the rule version and candidate set in the audit trail.",
    tags: ["routing", "round robin", "fairness", "lead"],
  },
  {
    id: "double-booking",
    title: "Double-booking prevention",
    summary:
      "Calendar free/busy is checked immediately before confirmation, and PostgreSQL uses a timestamp-range exclusion constraint as the final guard against overlapping bookings.",
    content:
      "Cached availability accelerates slot discovery but is never the source of truth at commit time. A collision returns a new slot selection response instead of silently overwriting an event.",
    tags: ["calendar", "availability", "double booking", "postgres"],
  },
  {
    id: "enterprise-policy",
    title: "Enterprise lead routing policy",
    summary:
      "Enterprise leads with 1,000 or more employees route by territory to the strategic accounts pool. Named accounts override territory, and account-owner matches override round-robin.",
    content:
      "The order is named account, existing CRM owner, region, segment, and then weighted pool selection. Changes require routing.manage and create a versioned audit event.",
    tags: ["enterprise", "qualification", "crm", "territory", "policy"],
  },
  {
    id: "subscription-renewal",
    title: "Calendar subscription renewal",
    summary:
      "Google and Microsoft webhook subscriptions are renewed before expiry and monitored as a first-class reliability signal. Stale calendar data never produces a confirmed slot.",
    content:
      "Renewals run six hours before expiry with an hourly recovery sweep. A failed renewal marks the connection degraded and removes the host from collective event types until recovery.",
    tags: ["google", "microsoft", "webhook", "renewal", "reliability"],
  },
];
