# Openslot routing operations

## Fair routing

Round-robin assignment should consider only active hosts who are eligible for the route, within working hours, not excluded by calendar conflicts, and below any configured capacity limit. The selected host and the evaluated rule version should be stored with the booking for later audit.

## Conflict protection

Confirmed and held bookings cannot overlap for the same host. The application checks availability for a useful error message, while PostgreSQL remains the final concurrency boundary through its exclusion constraint.

## Enterprise leads

Enterprise and regulated leads can be routed to dedicated pools. Pool membership is configured by administrators; managers can operate routing but cannot edit organization-wide access policy.

## Renewal review

Review route distributions and unused event types before renewal. Consolidate duplicate event types, archive unused links, and investigate sustained differences in assignment volume after adjusting for host availability.
