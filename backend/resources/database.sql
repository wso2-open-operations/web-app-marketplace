-- Recreate database
DROP DATABASE IF EXISTS web_app_marketplace;
CREATE DATABASE web_app_marketplace;
USE web_app_marketplace;

-- Tags table
DROP TABLE IF EXISTS tags;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `color` varchar(32) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `added_by` varchar(254) NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_by` varchar(254) NOT NULL,
  `updated_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ;

-- Apps table
DROP TABLE IF EXISTS apps;
CREATE TABLE `apps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `url` text,
  `description` text,
  `version_name` varchar(64) DEFAULT NULL,
  `tags` text,
  `icon` longtext NOT NULL,
  `user_groups` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `added_by` varchar(254) NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_by` varchar(254) NOT NULL,
  `updated_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ;


-- User favourite table
DROP TABLE IF EXISTS user_favourites;
CREATE TABLE `user_favourites` (
  `user_email` varchar(254) NOT NULL,
  `app_id` int NOT NULL,
  `is_favourite` tinyint(1) NOT NULL DEFAULT '0',
  `added_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_email`,`app_id`),
  KEY `fk_fav_app` (`app_id`),
  CONSTRAINT `fk_fav_app` FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`)
) ;

-- User groups table
DROP TABLE IF EXISTS user_groups;
CREATE TABLE `user_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `created_by` varchar(45) NOT NULL,
  `updated_by` varchar(45) NOT NULL,
  `created_on` timestamp(6) NOT NULL,
  `updated_on` timestamp(6) NOT NULL,
  PRIMARY KEY (`id`)
) ;
