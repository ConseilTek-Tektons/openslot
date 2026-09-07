# Role-based access control

Bootstrap permissions are defined in `src/config/rbac.ts`. In a database-backed deployment, the Access control page loads and saves reviewed overrides in PostgreSQL. The same effective-policy evaluator protects server-side API routes; adding a button without its server permission never grants access.

| Role | Intended user | Key access |
|---|---|---|
| `owner` | Product owner | All application and access-management features |
| `admin` | Scheduling administrator | Events, bookings, routing, analytics, access configuration |
| `manager` | Team manager | Manage bookings/routing and view analytics |
| `host` | Bookable team member | View/create bookings and manage own availability |
| `analyst` | Operations analyst | Read dashboards, bookings, routing, and analytics |
| `viewer` | Read-only stakeholder | Dashboard and approved assistant questions |

Default external groups are `openslot-owners`, `openslot-admins`, `revenue-managers`, `booking-hosts`, and `revenue-analytics`. Change group mappings without changing authorization logic by editing `groupRoleMappings`.

## Adding a permission

1. Add the permission string to the `Permission` union.
2. Grant it only to the required roles in `roleDefinitions`.
3. Enforce it in every corresponding server route.
4. Use `can(session, permission)` to adjust the UI.
5. Add positive and negative tests in `src/lib/rbac.test.ts`.

The owner role is immutable in the admin screen to prevent accidental lockout. Every save replaces the complete tenant policy in one transaction and emits `rbac.policy.updated` to the audit log. Without PostgreSQL the screen remains useful as a policy-as-code editor and JSON exporter; `src/config/rbac.ts` is the safe bootstrap policy.
