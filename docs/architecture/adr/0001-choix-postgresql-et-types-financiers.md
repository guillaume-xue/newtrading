# ADR 0001 : Choix de PostgreSQL, UUID v4 et Précision NUMERIC(18,8)

- **Statut :** Accepté
- **Date :** 2026-06-25
- **Auteur :** Guillaume Xue

## Contexte
L'application NewTrading manipule des transactions boursières simulées, des portefeuilles virtuels et des cours financiers en direct. Nous devions choisir la base de données, la stratégie d'identifiants et le type de données pour les montants financiers.

## Décision
1. **Base de données :** PostgreSQL (fiabilité ACID, performances, gestion native des JSON et index partiels).
2. **Identifiants Primaires :** Utilisation systématique d'**UUID v4** (`gen_random_uuid()`) pour éviter les attaques par énumération d'ID séquentiels sur les APIs REST.
3. **Précision Financière :** Utilisation stricte de **`NUMERIC(18, 8)`** pour les soldes, prix et quantités, interdisant le type `FLOAT` afin d'éviter toute erreur d'arrondi binaire.
4. **Gestion Temporelle :** Utilisation systématique de **`TIMESTAMPTZ`** (stockage UTC).

## Conséquences
- **Positives :** Sécurité accrue sur les URLs d'API, exactitude comptable stricte, synchronisation UTC sans friction.
- **Négatives :** Léger surcoût de stockage par rapport à des entiers simples (BIGINT) et arithmétique NUMERIC légèrement plus lourde que FLOAT.
