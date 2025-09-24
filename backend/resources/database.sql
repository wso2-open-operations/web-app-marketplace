CREATE TABLE `visitor` (
  `nic_hash` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nic_number` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_by` varchar(60) NOT NULL,
  `created_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_by` varchar(60) DEFAULT NULL,
  `updated_on` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`nic_hash`)
);

CREATE TABLE `visit` (
  `visit_id` int NOT NULL AUTO_INCREMENT,
  `nic_hash` varchar(64) NOT NULL,
  `pass_number` varchar(50) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `whom_they_meet` varchar(255) NOT NULL,
  `purpose_of_visit` text NOT NULL,
  `accessible_locations` json NOT NULL,
  `time_of_entry` datetime NOT NULL,
  `time_of_departure` datetime NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED') NOT NULL,
  `created_by` varchar(60) NOT NULL,
  `created_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_by` varchar(60) NOT NULL,
  `updated_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`visit_id`),
  KEY `fk_nic_hash_idx` (`nic_hash`),
  CONSTRAINT `fk_nic_hash` FOREIGN KEY (`nic_hash`) REFERENCES `visitor` (`nic_hash`)
);


DROP DATABASE IF EXISTS app_store;
CREATE DATABASE app_store;
USE app_store;

-- Tags table
CREATE TABLE tags (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(64) NOT NULL UNIQUE,
  color       VARCHAR(32) NOT NULL,
  is_deleted  TINYINT(1) NOT NULL DEFAULT 0,
  created_by varchar(60) NOT NULL,
  created_on timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by varchar(60) NOT NULL,
  updated_on timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
);

-- Roles table
CREATE TABLE roles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(64) NOT NULL UNIQUE,
  access_ids   JSON NOT NULL,
  is_deleted   TINYINT(1) NOT NULL DEFAULT 0,
  created_by varchar(60) NOT NULL,
  created_on timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by varchar(60) NOT NULL,
  updated_on timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT chk_roles_access_ids_json_valid CHECK (JSON_VALID(access_ids)),
  CONSTRAINT chk_roles_access_ids_is_array  CHECK (JSON_TYPE(access_ids) = 'ARRAY')
);

-- Collection table
CREATE TABLE collection (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  header          VARCHAR(150) NOT NULL,
  `description`     TEXT,
  version_name    VARCHAR(64) NOT NULL,
  tag          INT NULL,
  icon            VARCHAR(255) NULL,
  role_ids        JSON NOT NULL,
  added_by        VARCHAR(254) NOT NULL,
  developed_by    JSON NOT NULL,
  is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
  created_on      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by varchar(60) NOT NULL,
  updated_on      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  CONSTRAINT fk_collection_tag
    FOREIGN KEY (tag) REFERENCES tags(id),

  CONSTRAINT chk_collection_role_ids_json_valid CHECK (JSON_VALID(role_ids)),
  CONSTRAINT chk_collection_role_ids_is_array  CHECK (JSON_TYPE(role_ids) = 'ARRAY'),

  CONSTRAINT chk_collection_developed_by_json_valid CHECK (JSON_VALID(developed_by)),
  CONSTRAINT chk_collection_developed_by_is_array  CHECK (JSON_TYPE(developed_by) = 'ARRAY')
);

-- Favourites table
CREATE TABLE favourites (
  user_email           VARCHAR(254) PRIMARY KEY,
  favourite_collection JSON NOT NULL,
  created_on           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_on           TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  CONSTRAINT chk_favs_collection_json_valid CHECK (JSON_VALID(favourite_collection)),
  CONSTRAINT chk_favs_collection_is_array  CHECK (JSON_TYPE(favourite_collection) = 'ARRAY')
);