# Architecture

Openslot is a modular monolith: one independently deployable container owns the browser experience, authenticated server routes, policy enforcement, workflow transactions, and AI orchestration. This keeps deployment simple while maintaining strong internal boundaries. PostgreSQL is the durable system of record and Redis is an optional acceleration layer.

![Application flow](architecture/application-flow.svg)

## Request flow

1. App Runner or App Service terminates public HTTPS and forwards traffic to the container on port 3000.
2. NextAuth validates the signed session created by the enterprise OIDC provider. Direct OIDC works with Okta and Entra ID. SAML is translated by an identity broker such as Keycloak.
3. Group claims are mapped to a configured application role. The server re-evaluates permissions on every protected route; hiding a control in the browser is never the security boundary.
4. Zod validates request data. The booking API opens a database transaction and records a matching audit event.
5. PostgreSQL rejects overlapping confirmed/held bookings at the database layer through a `tstzrange` exclusion constraint.
6. AI questions pass through an assistant permission check and a Redis-backed distributed rate limiter. The response is grounded in the local approved corpus or an optional vector store.

## Runtime components

| Component | Responsibility | Failure behavior |
|---|---|---|
| Next.js application | UI, API, auth callbacks, RBAC, AI orchestration | Managed runtime restarts unhealthy instances |
| PostgreSQL 16 | tenants, users, availability, routing, bookings, audits | Durable; health endpoint reports unavailable |
| Redis 7+ | cross-instance assistant rate limits | In-memory fallback preserves local operation |
| Enterprise IdP | sign-in, MFA, group claims | Existing signed sessions remain valid until expiry |
| OpenAI (optional) | high-quality answer generation and vector retrieval | Local grounded answer remains available |

## Tenancy and consistency

Every domain table carries `organization_id`; APIs derive scope from the authenticated session rather than accepting arbitrary tenant IDs. Critical booking work is transactional. Unique keys, foreign keys, check constraints, and the overlap exclusion protect invariants even when multiple application instances race.

## Deployment position

The application requires server-side execution and is not suitable for static website hosting. AWS App Runner and Azure App Service Web App for Containers are the reference compute services because they remove routine VM/Kubernetes maintenance while preserving a standard OCI container and a straightforward migration path.
