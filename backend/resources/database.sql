-- Recreate database
DROP DATABASE IF EXISTS web_app_marketplace;
CREATE DATABASE web_app_marketplace;
USE web_app_marketplace;

-- Tags table  
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(64)  NOT NULL UNIQUE,
  color       VARCHAR(32)  NOT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 0,
  added_by    VARCHAR(254) NOT NULL,
  added_on    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by  VARCHAR(254) NOT NULL,
  updated_on  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Apps table  (per screenshot)
DROP TABLE IF EXISTS apps;
CREATE TABLE apps (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  url           TEXT NULL,
  description   TEXT NULL,
  version_name  VARCHAR(64)  NOT NULL,
  tag_id        INT NULL,
  icon          LONGTEXT NULL,
  user_groups   TEXT NOT NULL,                     
  is_active     TINYINT(1) NOT NULL DEFAULT 0,
  added_by      VARCHAR(254) NOT NULL,
  added_on      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by    VARCHAR(254) NOT NULL,
  updated_on    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  CONSTRAINT fk_apps_tag FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- User favourites
DROP TABLE IF EXISTS user_favourites;
CREATE TABLE user_favourites (
  user_email   VARCHAR(254) NOT NULL,
  app_id       INT NOT NULL,
  is_favourite TINYINT(1) NOT NULL DEFAULT 0,
  added_on     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_on   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  PRIMARY KEY (user_email, app_id),
  CONSTRAINT fk_fav_app FOREIGN KEY (app_id) REFERENCES apps(id)
);

-- User groups table
DROP TABLE IF EXISTS user_groups;
CREATE TABLE user_groups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(256) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 0,           
  created_by  VARCHAR(45)  NOT NULL,
  updated_by  VARCHAR(45)  NOT NULL,
  created_on  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_on  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
