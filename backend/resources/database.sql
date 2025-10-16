-- Recreate database
DROP DATABASE IF EXISTS web_app_marketplace;
CREATE DATABASE web_app_marketplace;
USE web_app_marketplace;

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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `apps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `url` text,
  `description` text,
  `version_name` varchar(64) NOT NULL,
  `tag_id` int DEFAULT NULL,
  `icon` longtext,
  `user_groups` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `added_by` varchar(254) NOT NULL,
  `added_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_by` varchar(254) NOT NULL,
  `updated_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `fk_apps_tag` (`tag_id`),
  CONSTRAINT `fk_apps_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_favourites` (
  `user_email` varchar(254) NOT NULL,
  `app_id` int NOT NULL,
  `is_favourite` tinyint(1) NOT NULL DEFAULT '0',
  `added_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_on` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_email`,`app_id`),
  KEY `fk_fav_app` (`app_id`),
  CONSTRAINT `fk_fav_app` FOREIGN KEY (`app_id`) REFERENCES `apps` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `created_by` varchar(45) NOT NULL,
  `updated_by` varchar(45) NOT NULL,
  `created_on` timestamp(6) NOT NULL,
  `updated_on` timestamp(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
