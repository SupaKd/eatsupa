-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : jeu. 25 déc. 2025 à 18:28
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
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
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
(9, 2, 'Desserts', 'Dolci italiens', 4, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `utilisateur_id` int DEFAULT NULL,
  `numero_commande` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_total` decimal(10,2) NOT NULL,
  `statut` enum('en_attente','confirmee','en_preparation','prete','livree','recuperee','annulee') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `telephone_client` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_client` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_suivi` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `items_json` json NOT NULL,
  `date_commande` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `heure_confirmation` datetime DEFAULT NULL,
  `heure_preparation` datetime DEFAULT NULL,
  `heure_prete` datetime DEFAULT NULL,
  `heure_livraison` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `mode_paiement` enum('sur_place','en_ligne') COLLATE utf8mb4_unicode_ci DEFAULT 'sur_place' COMMENT 'Mode de paiement choisi',
  `paiement_statut` enum('en_attente','paye','echoue','rembourse') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente' COMMENT 'Statut du paiement',
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID du PaymentIntent Stripe',
  `stripe_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID de la session Checkout Stripe'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `restaurant_id`, `utilisateur_id`, `numero_commande`, `montant_total`, `statut`, `telephone_client`, `email_client`, `token_suivi`, `notes`, `items_json`, `date_commande`, `heure_confirmation`, `heure_preparation`, `heure_prete`, `heure_livraison`, `created_at`, `updated_at`, `mode_paiement`, `paiement_statut`, `stripe_payment_intent_id`, `stripe_session_id`) VALUES
(1, 1, 4, 'CMD-1703000001-0001', 24.30, 'en_attente', '0634567890', NULL, NULL, 'Sans oignon SVP', '[{\"plat_id\": 1, \"nom_plat\": \"Classic Burger\", \"quantite\": 1, \"sous_total\": 9.9, \"prix_unitaire\": 9.9}, {\"plat_id\": 2, \"nom_plat\": \"Cheese Burger\", \"quantite\": 1, \"sous_total\": 10.9, \"prix_unitaire\": 10.9}, {\"plat_id\": 7, \"nom_plat\": \"Frites Maison\", \"quantite\": 1, \"sous_total\": 3.5, \"prix_unitaire\": 3.5}]', '2025-12-23 22:51:21', NULL, NULL, NULL, NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21', 'sur_place', 'en_attente', NULL, NULL),
(2, 2, 5, 'CMD-1703000002-0002', 29.30, 'confirmee', '0645678901', NULL, NULL, NULL, '[{\"plat_id\": 14, \"nom_plat\": \"Margherita\", \"quantite\": 1, \"sous_total\": 9.5, \"prix_unitaire\": 9.5}, {\"plat_id\": 16, \"nom_plat\": \"Quatre Fromages\", \"quantite\": 1, \"sous_total\": 13.9, \"prix_unitaire\": 13.9}, {\"plat_id\": 22, \"nom_plat\": \"Tiramisu Maison\", \"quantite\": 1, \"sous_total\": 6.5, \"prix_unitaire\": 6.5}]', '2025-12-23 21:51:21', NULL, NULL, NULL, NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21', 'sur_place', 'en_attente', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `commande_items`
--

CREATE TABLE `commande_items` (
  `id` int NOT NULL,
  `commande_id` int NOT NULL,
  `plat_id` int DEFAULT NULL,
  `nom_plat` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `prix` decimal(10,2) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
(1, 1, 1, 'Classic Burger', 'Steak haché, salade, tomate, oignons', 9.90, NULL, NULL, 1, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
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
(23, 2, 9, 'Panna Cotta', 'Coulis de fruits rouges', 5.90, NULL, NULL, 1, 2, '2025-12-23 22:51:21', '2025-12-23 22:51:21');

-- --------------------------------------------------------

--
-- Structure de la table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` int NOT NULL,
  `utilisateur_id` int NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_postal` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_cuisine` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horaires_ouverture` json DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delai_preparation` int DEFAULT '30',
  `frais_livraison` decimal(10,2) DEFAULT '0.00',
  `actif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paiement_sur_place` tinyint(1) DEFAULT '1' COMMENT 'Accepte le paiement en face à face (espèces/CB sur place)',
  `paiement_en_ligne` tinyint(1) DEFAULT '0' COMMENT 'Accepte le paiement en ligne par CB',
  `stripe_account_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID du compte Stripe Connect du restaurant',
  `stripe_onboarding_complete` tinyint(1) DEFAULT '0' COMMENT 'Onboarding Stripe terminé'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `restaurants`
--

INSERT INTO `restaurants` (`id`, `utilisateur_id`, `nom`, `description`, `adresse`, `ville`, `code_postal`, `telephone`, `email`, `type_cuisine`, `horaires_ouverture`, `image`, `delai_preparation`, `frais_livraison`, `actif`, `created_at`, `updated_at`, `paiement_sur_place`, `paiement_en_ligne`, `stripe_account_id`, `stripe_onboarding_complete`) VALUES
(1, 2, 'Le Burger Gourmand', 'Les meilleurs burgers artisanaux de la ville', '45 Avenue de la République', 'Lyon', '69003', '0478123456', 'contact@burgergourmand.fr', 'Burgers', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 25, 2.50, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21', 1, 0, NULL, 0),
(2, 3, 'Pizza Bella', 'Pizzeria italienne authentique avec four à bois', '12 Rue des Italiens', 'Lyon', '69001', '0478234567', 'pizzabella@gmail.com', 'Italien', '{\"jeudi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"lundi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"mardi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"samedi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"23:30\", \"debut\": \"12:00\"}]}, \"dimanche\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"21:00\", \"debut\": \"12:00\"}]}, \"mercredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"22:30\", \"debut\": \"18:00\"}]}, \"vendredi\": {\"ouvert\": true, \"horaires\": [{\"fin\": \"14:30\", \"debut\": \"11:30\"}, {\"fin\": \"23:00\", \"debut\": \"18:00\"}]}}', NULL, 30, 3.00, 1, '2025-12-23 22:51:21', '2025-12-23 22:51:21', 1, 0, NULL, 0);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('client','restaurateur','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `password`, `role`, `nom`, `prenom`, `telephone`, `photo_url`, `created_at`, `updated_at`) VALUES
(1, 'admin@localfood.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'admin', 'Admin', 'Système', '0600000000', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(2, 'resto1@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Dubois', 'Jean', '0612345678', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(3, 'resto2@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'restaurateur', 'Martin', 'Sophie', '0623456789', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(4, 'client1@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Dupont', 'Marie', '0634567890', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21'),
(5, 'client2@test.fr', '$2a$12$bnjh/Y/uQh1CJDpMNHW.7um68D8PhHTdiLe0h4lZ.RSUIQtkQU0va', 'client', 'Bernard', 'Lucas', '0645678901', NULL, '2025-12-23 22:51:21', '2025-12-23 22:51:21');

--
-- Index pour les tables déchargées
--

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
  ADD KEY `idx_paiement_statut` (`paiement_statut`);

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
  ADD KEY `idx_paiement_en_ligne` (`paiement_en_ligne`);

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
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `commande_items`
--
ALTER TABLE `commande_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plats`
--
ALTER TABLE `plats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

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
