DROP DATABASE IF EXISTS app_store;
CREATE DATABASE app_store;
USE app_store;

-- -----------------
-- Roles table
CREATE TABLE roles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(64) NOT NULL UNIQUE,
  is_deleted   TINYINT(1) NOT NULL DEFAULT 0,
  added_by     VARCHAR(60) NOT NULL,
  added_on     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by   VARCHAR(60) NOT NULL,
  updated_on   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- -----------------
-- Tags table
CREATE TABLE tags (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(64) NOT NULL UNIQUE,
  color       VARCHAR(32) NOT NULL,
  is_deleted  TINYINT(1) NOT NULL DEFAULT 0,
  added_by    VARCHAR(60) NOT NULL,
  added_on    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by  VARCHAR(60) NOT NULL,
  updated_on  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- -----------------
-- Links table
CREATE TABLE links (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  header        VARCHAR(150) NOT NULL,
  url_name      VARCHAR(150) NOT NULL,
  `description` TEXT,
  version_name  VARCHAR(64) NOT NULL,
  tag           INT NULL,
  icon          VARCHAR(255) NULL,
  added_by      VARCHAR(254) NOT NULL,
  is_deleted    TINYINT(1) NOT NULL DEFAULT 0,
  added_on      TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_by    VARCHAR(60) NOT NULL,
  updated_on    TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_links_tag
    FOREIGN KEY (tag) REFERENCES tags(id)
);

-- -----------------
-- Role ↔ Links link table
DROP TABLE IF EXISTS roleLinks;
CREATE TABLE roleLinks (
  roleId INT NOT NULL,
  linkId INT NOT NULL,
  PRIMARY KEY (roleId, linkId),
  CONSTRAINT fk_rolelinks_role
    FOREIGN KEY (roleId) REFERENCES roles(id),
  CONSTRAINT fk_rolelinks_link
    FOREIGN KEY (linkId) REFERENCES links(id)
);

-- -----------------
-- Favourites table
CREATE TABLE favourites (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(254) UNIQUE,
  added_on   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- -----------------
-- Favourite ↔ Links link table
CREATE TABLE favourite_links (
  link_id      INT NOT NULL,
  favourite_id INT NOT NULL,
  PRIMARY KEY (link_id, favourite_id),
  CONSTRAINT fk_favlinks_favourite
    FOREIGN KEY (favourite_id) REFERENCES favourites(id),
  CONSTRAINT fk_favlinks_link
    FOREIGN KEY (link_id) REFERENCES links(id)
);
