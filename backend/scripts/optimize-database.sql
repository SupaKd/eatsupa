-- ============================================================
-- SCRIPT D'OPTIMISATION DE LA BASE DE DONNÉES
-- Exécuter ces commandes pour optimiser l'espace et les performances
-- ============================================================

-- ==================== 1. INDEX OPTIMAUX ====================
-- Ces index améliorent les performances des requêtes fréquentes

-- Index pour les recherches de restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_ville ON restaurants(ville);
CREATE INDEX IF NOT EXISTS idx_restaurants_actif ON restaurants(actif);
CREATE INDEX IF NOT EXISTS idx_restaurants_type_cuisine ON restaurants(type_cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_utilisateur ON restaurants(utilisateur_id);

-- Index pour les plats
CREATE INDEX IF NOT EXISTS idx_plats_restaurant ON plats(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_plats_categorie ON plats(categorie_id);
CREATE INDEX IF NOT EXISTS idx_plats_disponible ON plats(disponible);
CREATE INDEX IF NOT EXISTS idx_plats_restaurant_categorie ON plats(restaurant_id, categorie_id);

-- Index pour les catégories
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_ordre ON categories(restaurant_id, ordre);

-- Index pour les commandes
CREATE INDEX IF NOT EXISTS idx_commandes_restaurant ON commandes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_commandes_utilisateur ON commandes(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes(date_commande);
CREATE INDEX IF NOT EXISTS idx_commandes_restaurant_statut ON commandes(restaurant_id, statut);

-- Index pour les items de commande
CREATE INDEX IF NOT EXISTS idx_commande_items_commande ON commande_items(commande_id);
CREATE INDEX IF NOT EXISTS idx_commande_items_plat ON commande_items(plat_id);


-- ==================== 2. OPTIMISATION DES TYPES ====================
-- Réduire la taille des colonnes si possible

-- Exemple: Si les descriptions sont souvent courtes
-- ALTER TABLE plats MODIFY description VARCHAR(500);
-- ALTER TABLE restaurants MODIFY description VARCHAR(1000);

-- Utiliser TINYINT pour les booléens (1 octet vs 4 pour INT)
-- ALTER TABLE plats MODIFY disponible TINYINT(1) DEFAULT 1;
-- ALTER TABLE restaurants MODIFY actif TINYINT(1) DEFAULT 0;
-- ALTER TABLE categories MODIFY actif TINYINT(1) DEFAULT 1;


-- ==================== 3. ARCHIVAGE DES ANCIENNES COMMANDES ====================
-- Créer une table d'archive pour les vieilles commandes (> 1 an)

CREATE TABLE IF NOT EXISTS commandes_archive LIKE commandes;
CREATE TABLE IF NOT EXISTS commande_items_archive LIKE commande_items;

-- Procédure pour archiver les commandes de plus d'un an
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS archiver_commandes()
BEGIN
    DECLARE cutoff_date DATE;
    SET cutoff_date = DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
    
    -- Archiver les items d'abord
    INSERT INTO commande_items_archive
    SELECT ci.* FROM commande_items ci
    INNER JOIN commandes c ON ci.commande_id = c.id
    WHERE c.date_commande < cutoff_date
    AND c.statut IN ('livree', 'recuperee', 'annulee');
    
    -- Archiver les commandes
    INSERT INTO commandes_archive
    SELECT * FROM commandes
    WHERE date_commande < cutoff_date
    AND statut IN ('livree', 'recuperee', 'annulee');
    
    -- Supprimer les items archivés
    DELETE ci FROM commande_items ci
    INNER JOIN commandes c ON ci.commande_id = c.id
    WHERE c.date_commande < cutoff_date
    AND c.statut IN ('livree', 'recuperee', 'annulee');
    
    -- Supprimer les commandes archivées
    DELETE FROM commandes
    WHERE date_commande < cutoff_date
    AND statut IN ('livree', 'recuperee', 'annulee');
    
    SELECT 'Archivage terminé' AS message;
END //
DELIMITER ;

-- Pour exécuter l'archivage: CALL archiver_commandes();


-- ==================== 4. NETTOYAGE ET MAINTENANCE ====================

-- Optimiser les tables (récupérer l'espace des lignes supprimées)
OPTIMIZE TABLE restaurants;
OPTIMIZE TABLE plats;
OPTIMIZE TABLE categories;
OPTIMIZE TABLE commandes;
OPTIMIZE TABLE commande_items;
OPTIMIZE TABLE utilisateurs;

-- Analyser les tables pour mettre à jour les statistiques
ANALYZE TABLE restaurants;
ANALYZE TABLE plats;
ANALYZE TABLE categories;
ANALYZE TABLE commandes;
ANALYZE TABLE commande_items;
ANALYZE TABLE utilisateurs;


-- ==================== 5. VÉRIFICATION DE L'ESPACE ====================

-- Voir la taille des tables
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Taille (MB)',
    ROUND((data_length / 1024 / 1024), 2) AS 'Données (MB)',
    ROUND((index_length / 1024 / 1024), 2) AS 'Index (MB)',
    table_rows AS 'Lignes'
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY (data_length + index_length) DESC;

-- Voir l'espace total utilisé
SELECT 
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Taille totale (MB)'
FROM information_schema.tables
WHERE table_schema = DATABASE();


-- ==================== 6. ÉVÉNEMENT AUTOMATIQUE DE NETTOYAGE ====================
-- (Nécessite que event_scheduler soit activé: SET GLOBAL event_scheduler = ON;)

-- Nettoyage hebdomadaire automatique
CREATE EVENT IF NOT EXISTS evt_weekly_cleanup
ON SCHEDULE EVERY 1 WEEK
STARTS (TIMESTAMP(CURRENT_DATE, '03:00:00'))
DO
BEGIN
    -- Optimiser les tables principales
    OPTIMIZE TABLE commandes;
    OPTIMIZE TABLE commande_items;
    
    -- Supprimer les tokens de suivi expirés (si applicable)
    -- DELETE FROM tokens_suivi WHERE expires_at < NOW();
END;


-- ==================== 7. PURGE DES DONNÉES TEMPORAIRES ====================

-- Supprimer les commandes abandonnées (panier non finalisé) de plus de 24h
-- DELETE FROM commandes 
-- WHERE statut = 'panier' 
-- AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);