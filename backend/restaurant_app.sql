-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : mar. 23 déc. 2025 à 22:44
-- Version du serveur : 8.0.40
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `restaurant_app`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ordre` int DEFAULT '0',
  `actif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `restaurant_id`, `nom`, `description`, `ordre`, `actif`, `created_at`, `updated_at`) VALUES
(1, 2, 'Burgers Classiques', 'Nos burgers incontournables', 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(2, 2, 'Burgers Premium', 'Nos créations signature', 2, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(3, 2, 'Accompagnements', 'Frites, salades et plus', 3, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(4, 2, 'Boissons', 'Sodas, jus et milkshakes', 4, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(5, 2, 'Desserts', 'Pour finir en beauté', 5, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(6, 3, 'Pizzas Classiques', 'Les grands classiques italiens', 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(7, 3, 'Pizzas Spéciales', 'Nos créations originales', 2, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(8, 3, 'Entrées', 'Antipasti et salades', 3, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(9, 3, 'Desserts', 'Dolci italiens', 4, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(10, 4, 'Sushis', 'Sushis nigiri traditionnels', 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(11, 4, 'Makis', 'Rouleaux classiques et créatifs', 2, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(12, 4, 'Sashimis', 'Poisson cru tranché', 3, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(13, 4, 'Menu Combos', 'Assortiments préparés', 4, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(14, 5, 'Entrées', 'Pour commencer', 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(15, 5, 'Plats Principaux', 'Nos spécialités', 2, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(16, 5, 'Desserts Maison', 'Pâtisseries artisanales', 3, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `numero_commande` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_total` decimal(10,2) NOT NULL,
  `statut` enum('en_attente','confirmee','en_preparation','prete','livree','recuperee','annulee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `telephone_client` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_client` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_suivi` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `items_json` json NOT NULL,
  `date_commande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `heure_confirmation` datetime DEFAULT NULL,
  `heure_preparation` datetime DEFAULT NULL,
  `heure_prete` datetime DEFAULT NULL,
  `heure_livraison` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_id` int GENERATED ALWAYS AS (`utilisateur_id`) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `restaurant_id`, `utilisateur_id`, `numero_commande`, `montant_total`, `statut`, `telephone_client`, `email_client`, `token_suivi`, `notes`, `items_json`, `date_commande`, `heure_confirmation`, `heure_preparation`, `heure_prete`, `heure_livraison`, `created_at`, `updated_at`) VALUES
(1, 2, 6, 'CMD-1766334842-0001', 24.30, 'en_attente', '0612345678', NULL, NULL, 'Sans oignon SVP', '[{\"plat_id\": 1, \"nom_plat\": \"Classic Burger\", \"quantite\": 1, \"sous_total\": 9.9, \"prix_unitaire\": 9.9}, {\"plat_id\": 2, \"nom_plat\": \"Cheese Burger\", \"quantite\": 1, \"sous_total\": 10.9, \"prix_unitaire\": 10.9}, {\"plat_id\": 7, \"nom_plat\": \"Frites Maison\", \"quantite\": 1, \"sous_total\": 3.5, \"prix_unitaire\": 3.5}]', '2025-12-21 16:24:02', NULL, NULL, NULL, NULL, '2025-12-21 16:24:02', '2025-12-21 16:34:02'),
(2, 3, 7, 'CMD-1766334842-0002', 29.80, 'confirmee', '0623456789', NULL, NULL, NULL, '[{\"plat_id\": 14, \"nom_plat\": \"Margherita\", \"quantite\": 1, \"sous_total\": 9.5, \"prix_unitaire\": 9.5}, {\"plat_id\": 16, \"nom_plat\": \"Quatre Fromages\", \"quantite\": 1, \"sous_total\": 13.9, \"prix_unitaire\": 13.9}, {\"plat_id\": 22, \"nom_plat\": \"Tiramisu Maison\", \"quantite\": 1, \"sous_total\": 6.5, \"prix_unitaire\": 6.5}]', '2025-12-21 16:14:02', '2025-12-21 17:19:02', NULL, NULL, NULL, '2025-12-21 16:14:02', '2025-12-21 16:34:02'),
(3, 4, 8, 'CMD-1766334842-0003', 35.90, 'en_preparation', '0634567890', NULL, NULL, NULL, '[{\"plat_id\": 34, \"nom_plat\": \"Menu Premium\", \"quantite\": 1, \"sous_total\": 35.9, \"prix_unitaire\": 35.9}]', '2025-12-21 16:09:02', '2025-12-21 17:24:02', '2025-12-21 17:29:02', NULL, NULL, '2025-12-21 16:09:02', '2025-12-21 16:34:02'),
(4, 5, 9, 'CMD-1766334842-0004', 31.30, 'prete', '0645678901', NULL, NULL, 'Bien cuit SVP', '[{\"plat_id\": 36, \"nom_plat\": \"Terrine Maison\", \"quantite\": 1, \"sous_total\": 7.5, \"prix_unitaire\": 7.5}, {\"plat_id\": 38, \"nom_plat\": \"Bœuf Bourguignon\", \"quantite\": 1, \"sous_total\": 16.9, \"prix_unitaire\": 16.9}, {\"plat_id\": 43, \"nom_plat\": \"Tarte Tatin\", \"quantite\": 1, \"sous_total\": 7.9, \"prix_unitaire\": 7.9}]', '2025-12-21 16:04:02', '2025-12-21 17:09:02', '2025-12-21 17:14:02', '2025-12-21 17:32:02', NULL, '2025-12-21 16:04:02', '2025-12-21 16:34:02'),
(5, 3, 6, 'CMD-1766248442-0005', 21.40, 'livree', '0612345678', NULL, NULL, NULL, '[{\"plat_id\": 15, \"nom_plat\": \"Regina\", \"quantite\": 1, \"sous_total\": 11.9, \"prix_unitaire\": 11.9}, {\"plat_id\": 18, \"nom_plat\": \"Burrata e Prosciutto\", \"quantite\": 1, \"sous_total\": 15.9, \"prix_unitaire\": 15.9}]', '2025-12-20 16:34:02', '2025-12-20 17:34:02', '2025-12-20 17:34:02', '2025-12-20 17:34:02', '2025-12-20 18:00:00', '2025-12-20 16:34:02', '2025-12-21 16:34:02');

-- --------------------------------------------------------

--
-- Structure de la table `commande_items`
--

CREATE TABLE `commande_items` (
  `id` int NOT NULL,
  `commande_id` int NOT NULL,
  `plat_id` int NOT NULL,
  `quantite` int NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `sous_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `plats`
--

CREATE TABLE `plats` (
  `id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `categorie_id` int DEFAULT NULL,
  `nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `prix` decimal(10,2) NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allergenes` json DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT '1',
  `ordre` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `plats`
--

INSERT INTO `plats` (`id`, `restaurant_id`, `categorie_id`, `nom`, `description`, `prix`, `image_url`, `allergenes`, `disponible`, `ordre`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Classic Burger', 'Burger avec steak haché, salade, tomate, oignons', 9.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(2, 2, 1, 'Cheese Burger', 'Burger avec cheddar fondu, cornichons', 10.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(3, 2, 1, 'Bacon Burger', 'Burger avec bacon croustillant et sauce BBQ', 11.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(4, 2, 2, 'Double Cheese', 'Double steak, double cheddar', 14.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(5, 2, 2, 'Burger Bleu', 'Steak, fromage bleu, champignons, sauce secrète', 13.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(6, 2, 2, 'Veggie Burger', 'Steak végétal, avocat, légumes grillés', 12.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(7, 2, 3, 'Frites Maison', 'Frites fraîches coupées maison', 3.50, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(8, 2, 3, 'Frites de Patate Douce', 'Frites de patates douces avec sauce aioli', 4.50, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(9, 2, 3, 'Salade César', 'Salade, poulet grillé, parmesan, croûtons', 7.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(10, 2, 4, 'Coca-Cola', '33cl', 2.50, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(11, 2, 4, 'Limonade Maison', 'Limonade artisanale citron pressé', 3.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(12, 2, 4, 'Milkshake Vanille', 'Milkshake crémeux à la vanille', 4.50, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(13, 2, 5, 'Brownie Chocolat', 'Brownie chaud avec glace vanille', 5.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(14, 3, 6, 'Margherita', 'Tomate, mozzarella, basilic', 9.50, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(15, 3, 6, 'Regina', 'Tomate, mozzarella, jambon, champignons', 11.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(16, 3, 6, 'Quatre Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 13.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(17, 3, 7, 'Diavola', 'Tomate, mozzarella, salami piquant, piment', 12.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(18, 3, 7, 'Burrata e Prosciutto', 'Burrata crémeuse, jambon de Parme, roquette', 15.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(19, 3, 7, 'Tartufo', 'Crème de truffe, champignons, parmesan', 17.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(20, 3, 8, 'Carpaccio de Bœuf', 'Fines tranches de bœuf, roquette, parmesan', 9.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(21, 3, 8, 'Salade Caprese', 'Tomates, mozzarella di buffala, basilic', 8.50, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(22, 3, 9, 'Tiramisu Maison', 'Recette traditionnelle au mascarpone', 6.50, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(23, 3, 9, 'Panna Cotta', 'Crème onctueuse au coulis de fruits rouges', 5.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(24, 4, 10, 'Nigiri Saumon', '2 pièces de saumon frais', 4.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(25, 4, 10, 'Nigiri Thon', '2 pièces de thon rouge', 5.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(26, 4, 10, 'Nigiri Crevette', '2 pièces de crevette', 4.50, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(27, 4, 11, 'Maki California', '6 pièces - crabe, avocat, concombre', 7.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(28, 4, 11, 'Maki Saumon Avocat', '6 pièces - saumon frais et avocat', 8.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(29, 4, 11, 'Maki Rainbow', '8 pièces - assortiment de poissons', 12.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(30, 4, 12, 'Sashimi Saumon', '6 tranches de saumon', 11.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(31, 4, 12, 'Sashimi Thon', '6 tranches de thon rouge', 13.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(32, 4, 12, 'Sashimi Mixte', '9 tranches - saumon, thon, daurade', 15.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(33, 4, 13, 'Menu Découverte', '12 pièces - sushi et maki assortis', 22.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(34, 4, 13, 'Menu Premium', '20 pièces - sushi, maki, sashimi', 35.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(35, 4, 13, 'Menu Chef', '30 pièces - sélection du chef', 49.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(36, 5, 14, 'Terrine Maison', 'Terrine du chef avec cornichons', 7.50, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(37, 5, 14, 'Œuf Meurette', 'Œuf poché au vin rouge', 8.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(38, 5, 15, 'Bœuf Bourguignon', 'Mijoté au vin rouge avec légumes', 16.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(39, 5, 15, 'Blanquette de Veau', 'Veau tendre en sauce crémeuse', 17.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(40, 5, 15, 'Coq au Vin', 'Recette traditionnelle au vin de Bourgogne', 18.90, NULL, NULL, 1, 3, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(41, 5, 15, 'Magret de Canard', 'Magret rôti avec sauce aux fruits', 19.90, NULL, NULL, 1, 4, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(42, 5, 16, 'Crème Brûlée', 'Onctueuse et caramélisée', 6.90, NULL, NULL, 1, 1, '2025-12-21 16:34:02', '2025-12-21 16:34:02'),
(43, 5, 16, 'Tarte Tatin', 'Tarte aux pommes caramélisées', 7.90, NULL, NULL, 1, 2, '2025-12-21 16:34:02', '2025-12-21 16:34:02');

-- --------------------------------------------------------

--
-- Structure de la table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int NOT NULL,
  `utilisateur_id` int NOT NULL,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `adresse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ville` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_postal` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_cuisine` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horaires_ouverture` json DEFAULT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delai_preparation` int DEFAULT '30',
  `frais_livraison` decimal(10,2) DEFAULT '0.00',
  `actif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `proprietaire_id` int GENERATED ALWAYS AS (`utilisateur_id`) VIRTUAL,
  `abonnement_actif` tinyint(1) GENERATED ALWAYS AS (`actif`) VIRTUAL,
  `date_fin_abonnement` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `restaurants`
--

INSERT INTO `restaurants` (`id`, `utilisateur_id`, `nom`, `description`, `adresse`, `ville`, `code_postal`, `telephone`, `email`, `type_cuisine`, `horaires_ouverture`, `image`, `delai_preparation`, `frais_livraison`, `actif`, `created_at`, `updated_at`, `date_fin_abonnement`) VALUES
(1, 4, 'Supa', 'asiatique', '1rue de la prairie ', 'oyonnax', '01100', '0783052412', 'supa@gmail.com', 'Asiatique', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 30, 0.00, 1, '2025-12-20 23:25:14', '2025-12-22 22:30:17', NULL),
(2, 10, 'Le Burger Gourmand', 'Les meilleurs burgers artisanaux de la ville. Viande fraîche, pain maison, et sauces secrètes.', '45 Avenue de la République', 'Lyon', '69003', '0478123456', 'contact@burgergourmand.fr', 'Burgers', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 30, 2.50, 1, '2025-12-21 16:34:02', '2025-12-22 22:30:17', NULL),
(3, 11, 'Pizza Bella', 'Pizzeria italienne authentique avec four à bois. Pâte préparée chaque matin, ingrédients importés d\'Italie.', '12 Rue des Italiens', 'Lyon', '69001', '0478234567', 'pizzabella@gmail.com', 'Italien', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 30, 3.00, 1, '2025-12-21 16:34:02', '2025-12-22 22:30:17', NULL),
(4, 12, 'Sushi Master', 'Restaurant japonais haut de gamme. Poissons ultra-frais livrés chaque jour, chef formé à Tokyo.', '8 Quai Saint-Antoine', 'Lyon', '69002', '0478345678', 'contact@sushimaster.fr', 'Japonais', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 45, 4.00, 1, '2025-12-21 16:34:02', '2025-12-22 22:30:17', NULL),
(5, 13, 'Le Bistrot du Coin', 'Cuisine française traditionnelle et conviviale. Plats du terroir revisités avec des produits locaux.', '23 Rue de la Bourse', 'Lyon', '69002', '0478456789', 'bistrot@orange.fr', 'Français', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 30, 2.00, 1, '2025-12-21 16:34:02', '2025-12-22 22:30:17', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('client','restaurateur','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `password`, `role`, `nom`, `prenom`, `telephone`, `created_at`, `updated_at`, `photo_url`) VALUES
(3, 'bea@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'queen', 'Mme', '0783052412', '2025-12-20 22:54:39', '2025-12-21 16:49:01', NULL),
(4, 'supakd@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'kd', 'supa', NULL, '2025-12-20 22:57:04', '2025-12-21 16:47:51', NULL),
(5, 'admin@test.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'admin', 'Admin', 'Système', NULL, '2025-12-21 04:21:19', '2025-12-21 16:47:51', NULL),
(6, 'marie.dupont@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Dupont', 'Marie', '0612345678', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(7, 'pierre.martin@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Martin', 'Pierre', '0623456789', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(8, 'sophie.bernard@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Bernard', 'Sophie', '0634567890', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(9, 'lucas.petit@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Petit', 'Lucas', '0645678901', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(10, 'chef.dubois@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Dubois', 'Jean', '0656789012', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(11, 'chef.laurent@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Laurent', 'Marie', '0667890123', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(12, 'chef.moreau@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Moreau', 'Thomas', '0678901234', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL),
(13, 'chef.simon@gmail.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Simon', 'Claire', '0689012345', '2025-12-21 16:34:02', '2025-12-21 16:47:51', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_commande` (`numero_commande`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_utilisateur` (`utilisateur_id`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_numero` (`numero_commande`),
  ADD KEY `idx_date` (`date_commande`),
  ADD KEY `idx_token_suivi` (`token_suivi`),
  ADD KEY `idx_email_client` (`email_client`);

--
-- Index pour la table `commande_items`
--
ALTER TABLE `commande_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_commande` (`commande_id`),
  ADD KEY `idx_plat` (`plat_id`);

--
-- Index pour la table `plats`
--
ALTER TABLE `plats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_categorie` (`categorie_id`),
  ADD KEY `idx_disponible` (`disponible`);

--
-- Index pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_utilisateur` (`utilisateur_id`),
  ADD KEY `idx_actif` (`actif`),
  ADD KEY `idx_ville` (`ville`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `commande_items`
--
ALTER TABLE `commande_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plats`
--
ALTER TABLE `plats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT pour la table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `commandes_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `commande_items`
--
ALTER TABLE `commande_items`
  ADD CONSTRAINT `commande_items_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `commande_items_ibfk_2` FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `plats`
--
ALTER TABLE `plats`
  ADD CONSTRAINT `plats_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plats_ibfk_2` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
