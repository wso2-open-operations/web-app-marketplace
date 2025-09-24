-- ---------------
-- Seed: tags
-- ---------------
INSERT INTO tags (name, color) VALUES
  ('Web',       '#3B82F6'),
  ('Mobile',    '#22C55E'),
  ('Analytics', '#F59E0B'),
  ('Security',  '#EF4444');

-- ---------------
-- Seed: roles
-- ---------------
-- access_ids is an example JSON array; adjust to your permission model.
INSERT INTO roles (name, access_ids) VALUES
  ('Admin',  JSON_ARRAY('apps:read', 'apps:write', 'apps:publish', 'roles:manage')),
  ('Editor', JSON_ARRAY('apps:read', 'apps:write')),
  ('Viewer', JSON_ARRAY('apps:read'));

-- ---------------
-- Seed: collection
-- ---------------
-- Use role_ids as JSON array of role IDs (lookup from roles table).
-- For simplicity, we assume Admin=1, Editor=2, Viewer=3 from inserts above.
INSERT INTO collection
  (header, description, version_name, tag, icon, role_ids, added_by, developed_by)
VALUES
  ('Sales Dashboard',
   'A web dashboard for tracking key sales KPIs and trends.',
   'v1.0.0',
   (SELECT id FROM tags WHERE name='Analytics'),
   'https://cdn.example.com/icons/sales-dashboard.svg',
   JSON_ARRAY(1,2,3),
   'dineth@wso2.com',
   JSON_ARRAY('sales-team@wso2.com', 'analytics-squad@wso2.com')
  ),
  ('Customer Portal',
   'Self-service portal for customers to view and manage subscriptions.',
   'v2.3.1',
   (SELECT id FROM tags WHERE name='Web'),
   'https://cdn.example.com/icons/customer-portal.svg',
   JSON_ARRAY(2,3),
   'chanuka@wso2.com',
   JSON_ARRAY('portal-team@wso2.com')
  ),
  ('Incident Responder',
   'Mobile app for on-call engineers to triage and resolve incidents.',
   'v0.9.5',
   (SELECT id FROM tags WHERE name='Mobile'),
   'https://cdn.example.com/icons/incident-responder.svg',
   JSON_ARRAY(1,2),
   'ops@wso2.com',
   JSON_ARRAY('oncall@wso2.com', 'sre@wso2.com')
  ),
  ('Vulnerability Scanner',
   'Security tool to scan web apps and generate reports.',
   'v1.4.2',
   (SELECT id FROM tags WHERE name='Security'),
   'https://cdn.example.com/icons/vuln-scanner.svg',
   JSON_ARRAY(1),
   'security@wso2.com',
   JSON_ARRAY('appsec@wso2.com')
  );

-- ---------------
-- Seed: favourites
-- ---------------
-- favourite_collection: JSON array of collection IDs
INSERT INTO favourites (user_email, favourite_collection) VALUES
  ('dineth@wso2.com',   JSON_ARRAY(1, 3)),  -- Sales Dashboard, Incident Responder
  ('maheshoka@wso2.com',JSON_ARRAY(2)),     -- Customer Portal
  ('chanuka@wso2.com',  JSON_ARRAY(1, 4));  -- Sales Dashboard, Vulnerability Scanner