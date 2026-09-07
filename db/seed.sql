insert into organisation (id, name, slug) values ('00000000-0000-4000-8000-000000000001', 'Northstar', 'northstar') on conflict do nothing;

insert into app_user (id, organisation_id, identity_subject, email, display_name, timezone) values
('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'demo-admin', 'maya@northstar.example', 'Maya Chen', 'America/New_York'),
('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'demo-manager', 'jon@northstar.example', 'Jon Bell', 'Europe/London'),
('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'demo-host', 'priya@northstar.example', 'Priya Rao', 'America/New_York')
on conflict do nothing;

insert into event_type (id, organisation_id, name, slug, duration_minutes, mode) values
('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Enterprise discovery', 'enterprise-discovery', 30, 'round_robin'),
('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Technical deep dive', 'technical-deep-dive', 45, 'collective')
on conflict do nothing;

insert into event_type_host (event_type_id, host_id, weight, priority) values
('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 40, 10),
('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 35, 10),
('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 25, 10)
on conflict do nothing;

insert into routing_rule (organisation_id, name, priority, conditions, destination) values
('00000000-0000-4000-8000-000000000001', 'Named account owner', 10, '{"crmOwnerPresent": true}', '{"type": "crm_owner"}'),
('00000000-0000-4000-8000-000000000001', 'Enterprise Americas', 20, '{"employeeCount": {"gte": 1000}, "region": ["US", "CA"]}', '{"type": "event_type", "id": "20000000-0000-4000-8000-000000000001"}')
on conflict do nothing;
