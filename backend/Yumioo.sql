-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : mar. 30 déc. 2025 à 16:12
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
-- Base de données : `Yumioo`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnements`
--

CREATE TABLE `abonnements` (
  `id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `statut` enum('actif','expire','annule','essai') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'actif',
  `prix_mensuel` decimal(10,2) DEFAULT '50.00',
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `date_prochain_paiement` date DEFAULT NULL,
  `stripe_subscription_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 1, 'Burgers Classiques', 'Nos burgers incontournables', 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(2, 1, 'Burgers Premium', 'Nos créations signature', 2, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(3, 1, 'Accompagnements', 'Frites, salades et plus', 3, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(4, 1, 'Boissons', 'Sodas, jus et milkshakes', 4, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(5, 1, 'Desserts', 'Pour finir en beauté', 5, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(6, 2, 'Pizzas Classiques', 'Les grands classiques italiens', 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(7, 2, 'Pizzas Spéciales', 'Nos créations originales', 2, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(8, 2, 'Entrées', 'Antipasti et salades', 3, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(9, 2, 'Desserts', 'Dolci italiens', 4, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(10, 4, 'Tacos', NULL, 0, 1, '2025-12-29 23:18:19', '2025-12-29 23:18:19');

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
  `email_client` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_suivi` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `items_json` json NOT NULL,
  `date_commande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `heure_confirmation` datetime DEFAULT NULL,
  `heure_preparation` datetime DEFAULT NULL,
  `heure_prete` datetime DEFAULT NULL,
  `heure_livraison` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `mode_paiement` enum('sur_place','en_ligne') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'sur_place' COMMENT 'Mode de paiement choisi',
  `paiement_statut` enum('en_attente','paye','echoue','rembourse') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente' COMMENT 'Statut du paiement',
  `stripe_payment_intent_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID du PaymentIntent Stripe',
  `stripe_session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID de la session Checkout Stripe',
  `mode_retrait` enum('a_emporter','livraison') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'a_emporter' COMMENT 'Mode de retrait de la commande',
  `adresse_livraison` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Adresse de livraison',
  `code_postal_livraison` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Code postal de livraison',
  `ville_livraison` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ville de livraison',
  `instructions_livraison` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Instructions pour le livreur',
  `frais_livraison_appliques` decimal(10,2) DEFAULT '0.00' COMMENT 'Frais de livraison appliqués à cette commande'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `restaurant_id`, `utilisateur_id`, `numero_commande`, `montant_total`, `statut`, `telephone_client`, `email_client`, `token_suivi`, `notes`, `items_json`, `date_commande`, `heure_confirmation`, `heure_preparation`, `heure_prete`, `heure_livraison`, `created_at`, `updated_at`, `mode_paiement`, `paiement_statut`, `stripe_payment_intent_id`, `stripe_session_id`, `mode_retrait`, `adresse_livraison`, `code_postal_livraison`, `ville_livraison`, `instructions_livraison`, `frais_livraison_appliques`) VALUES
(1, 1, 4, 'CMD-1703000001-0001', 24.30, 'recuperee', '0634567890', NULL, NULL, 'Sans oignon SVP', '[{\"plat_id\": 1, \"nom_plat\": \"Classic Burger\", \"quantite\": 1, \"sous_total\": 9.9, \"prix_unitaire\": 9.9}, {\"plat_id\": 2, \"nom_plat\": \"Cheese Burger\", \"quantite\": 1, \"sous_total\": 10.9, \"prix_unitaire\": 10.9}, {\"plat_id\": 7, \"nom_plat\": \"Frites Maison\", \"quantite\": 1, \"sous_total\": 3.5, \"prix_unitaire\": 3.5}]', '2025-12-23 22:51:21', '2025-12-29 23:03:40', '2025-12-29 23:03:41', '2025-12-29 23:03:42', '2025-12-29 23:03:42', '2025-12-23 22:51:21', '2025-12-29 23:03:42', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(2, 2, 5, 'CMD-1703000002-0002', 29.30, 'recuperee', '0645678901', NULL, NULL, NULL, '[{\"plat_id\": 14, \"nom_plat\": \"Margherita\", \"quantite\": 1, \"sous_total\": 9.5, \"prix_unitaire\": 9.5}, {\"plat_id\": 16, \"nom_plat\": \"Quatre Fromages\", \"quantite\": 1, \"sous_total\": 13.9, \"prix_unitaire\": 13.9}, {\"plat_id\": 22, \"nom_plat\": \"Tiramisu Maison\", \"quantite\": 1, \"sous_total\": 6.5, \"prix_unitaire\": 6.5}]', '2025-12-23 21:51:21', NULL, '2025-12-26 14:14:47', '2025-12-26 14:44:02', '2025-12-26 14:44:06', '2025-12-23 22:51:21', '2025-12-26 14:44:06', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(3, 1, 4, 'CMD-1766697670257-4555', 61.50, 'recuperee', '0634567890', 'client1@test.fr', NULL, NULL, '[{\"plat_id\": 1, \"nom_plat\": \"Classic Burger\", \"quantite\": 1, \"sous_total\": 9.9, \"prix_unitaire\": 9.9}, {\"plat_id\": 2, \"nom_plat\": \"Cheese Burger\", \"quantite\": 1, \"sous_total\": 10.9, \"prix_unitaire\": 10.9}, {\"plat_id\": 3, \"nom_plat\": \"Bacon Burger\", \"quantite\": 1, \"sous_total\": 11.9, \"prix_unitaire\": 11.9}, {\"plat_id\": 4, \"nom_plat\": \"Double Cheese\", \"quantite\": 1, \"sous_total\": 14.9, \"prix_unitaire\": 14.9}, {\"plat_id\": 5, \"nom_plat\": \"Burger Bleu\", \"quantite\": 1, \"sous_total\": 13.9, \"prix_unitaire\": 13.9}]', '2025-12-25 21:21:10', '2025-12-26 13:20:30', '2025-12-26 13:20:35', '2025-12-26 13:20:38', '2025-12-29 23:03:39', '2025-12-25 21:21:10', '2025-12-29 23:03:39', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(4, 2, NULL, 'CMD-1766698264007-0688', 9.50, 'annulee', '0783052412', NULL, 'd061a413eed8cb3905fbf5e852c989d63b6cca541768f9d14e625ab9d7f3be74', NULL, '[{\"plat_id\": 14, \"nom_plat\": \"Margherita\", \"quantite\": 1, \"sous_total\": 9.5, \"prix_unitaire\": 9.5}]', '2025-12-25 21:31:04', NULL, NULL, NULL, NULL, '2025-12-25 21:31:04', '2025-12-30 00:23:17', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(5, 1, NULL, 'CMD-1766762670099-6513', 20.80, 'recuperee', '0783052412', NULL, 'c235f19c1e440e9483b481143f198d266ee802bac13fad07e13cd59b13ae34ae', NULL, '[{\"plat_id\": 1, \"nom_plat\": \"Classic Burger\", \"quantite\": 1, \"sous_total\": 9.9, \"prix_unitaire\": 9.9}, {\"plat_id\": 2, \"nom_plat\": \"Cheese Burger\", \"quantite\": 1, \"sous_total\": 10.9, \"prix_unitaire\": 10.9}]', '2025-12-26 15:24:30', '2025-12-29 23:03:36', '2025-12-29 23:03:38', '2025-12-29 23:03:38', '2025-12-29 23:03:39', '2025-12-26 15:24:30', '2025-12-29 23:03:39', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(6, 2, 4, 'CMD-1766762748885-1590', 33.80, 'annulee', '0634567890', 'client1@test.fr', NULL, NULL, '[{\"plat_id\": 18, \"nom_plat\": \"Burrata e Prosciutto\", \"quantite\": 1, \"sous_total\": 15.9, \"prix_unitaire\": 15.9}, {\"plat_id\": 19, \"nom_plat\": \"Tartufo\", \"quantite\": 1, \"sous_total\": 17.9, \"prix_unitaire\": 17.9}]', '2025-12-26 15:25:48', NULL, NULL, NULL, NULL, '2025-12-26 15:25:48', '2025-12-30 00:23:15', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(7, 2, NULL, 'CMD-1767050701539-4144', 18.40, 'recuperee', '0783051232', NULL, '9b5c7cc1925d5131fd6d2518cf3bea4642dd107b504ca82bd4f2aa891532275f', NULL, '[{\"plat_id\": 20, \"nom_plat\": \"Carpaccio de Bœuf\", \"quantite\": 1, \"sous_total\": 9.9, \"prix_unitaire\": 9.9}, {\"plat_id\": 21, \"nom_plat\": \"Salade Caprese\", \"quantite\": 1, \"sous_total\": 8.5, \"prix_unitaire\": 8.5}]', '2025-12-29 23:25:01', '2025-12-30 00:23:04', '2025-12-30 00:23:07', '2025-12-30 00:23:08', '2025-12-30 00:23:08', '2025-12-29 23:25:01', '2025-12-30 00:23:08', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(8, 2, 8, 'CMD-1767101114277-7426', 30.90, 'en_attente', '0783052412', 'leo@gmail.com', NULL, NULL, '[{\"plat_id\": 14, \"nom_plat\": \"Margherita\", \"quantite\": 2, \"sous_total\": 19, \"prix_unitaire\": 9.5}, {\"plat_id\": 15, \"nom_plat\": \"Regina\", \"quantite\": 1, \"sous_total\": 11.9, \"prix_unitaire\": 11.9}]', '2025-12-30 13:25:14', NULL, NULL, NULL, NULL, '2025-12-30 13:25:14', '2025-12-30 13:25:14', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00),
(9, 2, 8, 'CMD-1767101251833-9837', 33.80, 'en_attente', '0783052412', 'leo@gmail.com', NULL, NULL, '[{\"plat_id\": 18, \"nom_plat\": \"Burrata e Prosciutto\", \"quantite\": 1, \"sous_total\": 15.9, \"prix_unitaire\": 15.9}, {\"plat_id\": 19, \"nom_plat\": \"Tartufo\", \"quantite\": 1, \"sous_total\": 17.9, \"prix_unitaire\": 17.9}]', '2025-12-30 13:27:31', NULL, NULL, NULL, NULL, '2025-12-30 13:27:31', '2025-12-30 13:27:31', 'sur_place', 'en_attente', NULL, NULL, 'a_emporter', NULL, NULL, NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Structure de la table `commande_items`
--

CREATE TABLE `commande_items` (
  `id` int NOT NULL,
  `commande_id` int NOT NULL,
  `plat_id` int DEFAULT NULL,
  `nom_plat` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `quantite` int NOT NULL,
  `sous_total` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
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
(1, 1, 1, 'Classic Burger', 'Steak haché, salade, tomate, oignons', 9.90, '/uploads/images/60d6d39e-99d9-4366-876f-0de5fba3e8d1.png', '[]', 1, 1, '2025-12-23 22:51:21', '2025-12-30 15:59:49'),
(2, 1, 1, 'Cheese Burger', 'Steak haché, cheddar fondu, cornichons', 10.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(3, 1, 1, 'Bacon Burger', 'Steak haché, bacon croustillant, sauce BBQ', 11.90, NULL, NULL, 1, 3, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(4, 1, 2, 'Double Cheese', 'Double steak, double cheddar', 14.90, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(5, 1, 2, 'Burger Bleu', 'Steak, fromage bleu, champignons', 13.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(6, 1, 2, 'Veggie Burger', 'Steak végétal, avocat, légumes grillés', 12.90, NULL, NULL, 1, 3, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(7, 1, 3, 'Frites Maison', 'Frites fraîches coupées maison', 3.50, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(8, 1, 3, 'Frites de Patate Douce', 'Avec sauce aioli', 4.50, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(9, 1, 3, 'Salade César', 'Poulet grillé, parmesan, croûtons', 7.90, NULL, NULL, 1, 3, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(10, 1, 4, 'Coca-Cola', '33cl', 2.50, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(11, 1, 4, 'Limonade Maison', 'Citron pressé artisanal', 3.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(12, 1, 4, 'Milkshake Vanille', 'Milkshake crémeux', 4.50, NULL, NULL, 1, 3, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(13, 1, 5, 'Brownie Chocolat', 'Brownie chaud avec glace vanille', 5.90, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(14, 2, 6, 'Margherita', 'Tomate, mozzarella, basilic', 9.50, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(15, 2, 6, 'Regina', 'Tomate, mozzarella, jambon, champignons', 11.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(16, 2, 6, 'Quatre Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 13.90, NULL, NULL, 1, 3, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(17, 2, 7, 'Diavola', 'Tomate, mozzarella, salami piquant', 12.90, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(18, 2, 7, 'Burrata e Prosciutto', 'Burrata, jambon de Parme, roquette', 15.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(19, 2, 7, 'Tartufo', 'Crème de truffe, champignons, parmesan', 17.90, NULL, NULL, 1, 3, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(20, 2, 8, 'Carpaccio de Bœuf', 'Bœuf, roquette, parmesan', 9.90, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(21, 2, 8, 'Salade Caprese', 'Tomates, mozzarella di buffala', 8.50, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(22, 2, 9, 'Tiramisu Maison', 'Recette traditionnelle', 6.50, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(23, 2, 9, 'Panna Cotta', 'Coulis de fruits rouges', 5.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(24, 4, 10, 'Tacos supreme', 'poulet cheese', 10.00, NULL, '[]', 1, 1, '2025-12-29 23:18:52', '2025-12-29 23:18:52');

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
  `actif` tinyint(1) DEFAULT '0' COMMENT 'Restaurant validé et visible par les clients',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paiement_sur_place` tinyint(1) DEFAULT '1' COMMENT 'Accepte le paiement en face à face (espèces/CB sur place)',
  `paiement_en_ligne` tinyint(1) DEFAULT '0' COMMENT 'Accepte le paiement en ligne par CB',
  `stripe_account_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID du compte Stripe Connect du restaurant',
  `stripe_onboarding_complete` tinyint(1) DEFAULT '0' COMMENT 'Onboarding Stripe terminé',
  `livraison_active` tinyint(1) DEFAULT '0' COMMENT 'Indique si le restaurant propose la livraison',
  `a_emporter_active` tinyint(1) DEFAULT '1' COMMENT 'Indique si le restaurant propose le retrait sur place',
  `zone_livraison_km` decimal(5,2) DEFAULT '5.00' COMMENT 'Rayon de livraison en kilomètres',
  `minimum_livraison` decimal(10,2) DEFAULT '15.00' COMMENT 'Montant minimum pour la livraison',
  `delai_livraison` int DEFAULT '45' COMMENT 'Délai de livraison estimé en minutes',
  `fermeture_exceptionnelle` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `restaurants`
--

INSERT INTO `restaurants` (`id`, `utilisateur_id`, `nom`, `description`, `adresse`, `ville`, `code_postal`, `telephone`, `email`, `type_cuisine`, `horaires_ouverture`, `image`, `delai_preparation`, `frais_livraison`, `actif`, `created_at`, `updated_at`, `paiement_sur_place`, `paiement_en_ligne`, `stripe_account_id`, `stripe_onboarding_complete`, `livraison_active`, `a_emporter_active`, `zone_livraison_km`, `minimum_livraison`, `delai_livraison`, `fermeture_exceptionnelle`) VALUES
(1, 2, 'Le Burger Gourmand', 'Les meilleurs burgers artisanaux de la ville', '45 Avenue de la République', 'Lyon', '69003', '0478123456', 'contact@burgergourmand.fr', 'Burgers', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"17:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', '/uploads/images/677a8969-c0e7-4319-b384-0392421359ed.png', 25, 2.50, 1, '2025-12-23 22:51:21', '2025-12-30 16:00:33', 1, 0, 'acct_demo_1766755393022', 0, 1, 1, 5.00, 15.00, 45, 0),
(2, 3, 'Pizza Bella', 'Pizzeria italienne authentique avec four à bois', '12 Rue des Italiens', 'Lyon', '69001', '0478234567', 'pizzabella@gmail.com', 'Italien', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"01:00\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"20:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 30, 3.00, 1, '2025-12-23 22:51:21', '2025-12-30 00:06:49', 1, 0, NULL, 0, 1, 1, 5.00, 15.00, 45, 0),
(3, 6, 'Supafood', NULL, '2 rue sonthonnax', 'oyonnax', '01100', '0783052412', 'kev@gmail.com', 'Fast-food', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:00\", \"debut\": \"18:30\"}]}, \"lundi\": {\"ouvert\": false, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:00\", \"debut\": \"18:30\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:00\", \"debut\": \"18:30\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:30\"}]}, \"dimanche\": {\"ouvert\": false, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:00\", \"debut\": \"18:30\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:30\"}]}}', NULL, 30, 0.00, 1, '2025-12-29 22:56:04', '2025-12-29 23:22:00', 1, 0, NULL, 0, 0, 1, 5.00, 15.00, 45, 0),
(4, 7, 'supaeat', NULL, '2 rue monq', 'oyonnax', '01100', '0783052412', 'supa@resto.com', 'Italien', NULL, NULL, 30, 0.00, 0, '2025-12-29 23:15:59', '2025-12-29 23:23:01', 1, 0, NULL, 0, 0, 1, 5.00, 15.00, 45, 0);

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
  `photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `password`, `role`, `nom`, `prenom`, `telephone`, `photo_url`, `created_at`, `updated_at`) VALUES
(1, 'admin@test.com', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'admin', 'Admin', 'Système', '0600000000', NULL, '2025-12-23 22:51:21', '2025-12-25 22:26:25'),
(2, 'resto1@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Dubois', 'Jean', '0612345678', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(3, 'resto2@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Martin', 'Sophie', '0623456789', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(4, 'client1@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Dupont', 'Marie', '0634567890', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(5, 'client2@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Bernard', 'Lucas', '0645678901', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(6, 'kdk@gmail.com', '$2a$12$lQ8NlKQEpycuq5KihiapI.cqU/xAKP2LJZJFLPxIipR/gsdIiqgkq', 'restaurateur', 'kdk', 'kdk', '0783052412', NULL, '2025-12-29 22:55:01', '2025-12-29 22:55:01'),
(7, 'kd@gmail.com', '$2a$12$tFdzD4DZPoEgyuH3Eb659O9Sa5aGO0sZPOm2/dXbaUCwijT3lCUJ2', 'restaurateur', 'kd', 'kd', '0783052412', NULL, '2025-12-29 23:15:17', '2025-12-29 23:15:17'),
(8, 'leo@gmail.com', '$2a$12$dDBylbWUsoB3xsnveTn.L.EAhg4Hx.qcU16RmXO07O2tz/6A4.imG', 'client', 'Leo', 'Supa', '0783052412', NULL, '2025-12-30 13:22:11', '2025-12-30 13:42:21');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_statut` (`statut`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_ordre` (`ordre`),
  ADD KEY `idx_actif` (`actif`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_commande` (`numero_commande`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_utilisateur` (`utilisateur_id`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_date` (`date_commande`),
  ADD KEY `idx_token_suivi` (`token_suivi`),
  ADD KEY `idx_email_client` (`email_client`),
  ADD KEY `idx_mode_paiement` (`mode_paiement`),
  ADD KEY `idx_paiement_statut` (`paiement_statut`),
  ADD KEY `idx_commandes_mode_retrait` (`mode_retrait`);

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
  ADD KEY `idx_disponible` (`disponible`),
  ADD KEY `idx_ordre` (`ordre`);

--
-- Index pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_utilisateur` (`utilisateur_id`),
  ADD KEY `idx_actif` (`actif`),
  ADD KEY `idx_ville` (`ville`),
  ADD KEY `idx_type_cuisine` (`type_cuisine`),
  ADD KEY `idx_paiement_en_ligne` (`paiement_en_ligne`),
  ADD KEY `idx_restaurants_livraison` (`livraison_active`),
  ADD KEY `idx_restaurants_a_emporter` (`a_emporter_active`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `abonnements`
--
ALTER TABLE `abonnements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `commande_items`
--
ALTER TABLE `commande_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plats`
--
ALTER TABLE `plats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pour la table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD CONSTRAINT `fk_abonnements_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `fk_commandes_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_commandes_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `commande_items`
--
ALTER TABLE `commande_items`
  ADD CONSTRAINT `fk_commande_items_commande` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_commande_items_plat` FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `plats`
--
ALTER TABLE `plats`
  ADD CONSTRAINT `fk_plats_categorie` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plats_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `fk_restaurants_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
