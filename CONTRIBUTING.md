# Guide de Contribution — NewTrading

Merci de contribuer au projet **NewTrading** ! Afin de garantir la qualité du code, la sécurité des transactions financières simulées et la fluidité du travail d'équipe, nous vous demandons de respecter les règles suivantes.

---

## 1. Workflow Git & Gestion des Branches

Nous appliquons un workflow basé sur **Git Flow adapté** :

- `main` : Branche de production (code stable et déployable).
- `develop` : Branche d'intégration pour les fonctionnalités prêtes pour la recette/staging.
- `feature/<nom-fonctionnalite>` : Branche créée depuis `develop` pour développer une fonctionnalité (ex. `feature/websocket-candles`, `feature/paper-trading-engine`).
- `fix/<nom-correctif>` : Branche pour corriger une anomalie sur l'environnement de dev.
- `hotfix/<nom-urgence>` : Branche créée directement depuis `main` pour corriger une urgence en production.

---

## 2. Convention de Nommage des Commits

Nous appliquons la norme [Conventional Commits](https://www.conventionalcommits.org/) :
Format : `<type>(<scope>): <description courte>`

### Types autorisés :
- `feat` : Nouvelle fonctionnalité visible pour l'utilisateur ou l'API (ex. `feat(portfolio): add order placement endpoint`).
- `fix` : Correction d'un bug (ex. `fix(charts): fix candlestick overlap on mobile view`).
- `docs` : Modifications documentaires (ex. `docs(api): add swagger OpenAPI schema`).
- `style` : Formatage, indentations (sans impact sur la logique).
- `refactor` : Restructuration de code sans modification de comportement.
- `test` : Ajout ou mise à jour de tests unitaires/intégration.
- `chore` : Tâches de maintenance, dépendances ou configuration CI/CD.

### Scopes courants :
`auth`, `portfolio`, `charts`, `alerts`, `marketdata`, `db`, `ui`, `mobile`, `web`.

---

## 3. Standards de Développement par Stack

### ☕ Backend (Java / Spring Boot)
- **Règles financières :** Utilisez impérativement `BigDecimal` (mappé en `NUMERIC(18, 8)` en base PostgreSQL) pour tout calcul de solde, de prix ou de quantité d'actifs. L'usage de `float` ou `double` pour les montants financiers est formellement interdit afin d'éviter les erreurs d'arrondi.
- **Identifiants :** Toutes les entités et tables exposées doivent utiliser des identifiants `UUID` générés de manière sécurisée.
- **Qualité & Tests :** Respectez les règles Checkstyle / Spotless et couvrez les fonctionnalités avec des tests unitaires (`JUnit 5`, `Mockito`) et d'intégration.

### ⚛️ Frontend Web & Mobile (Next.js & React Native)
- **TypeScript :** Typage strict activé (`strict: true`).
- **Qualité de code :** Exécutez `npm run lint` et `npm run format` avant chaque validation.
- **UI/UX & Thème :** Respectez le guide de style Dark Mode et les codes couleurs définis (Vert pour Achat/Long, Rouge pour Vente/Short).
- **Gestion des flux temps réel :** Assurez-vous de clore et nettoyer proprement les abonnements WebSockets dans le cycle de vie des composants React pour éviter toute fuite de mémoire.

---

## 4. Processus de Pull Request (PR)

1. **Mise à jour :** Rebasez votre branche sur la dernière version de `develop`.
2. **Validation locale :** Vérifiez que tous les tests passent localement :
   - Backend : `./mvnw test`
   - Frontend : `npm test`
3. **Template de PR :** Décrivez le contexte métier, les modifications techniques apportées et la procédure de test manuel.
4. **Revue de code :** Au moins **1 approbation (Approve)** d'un reviewer et le succès du pipeline CI sont obligatoires avant le merge.

---

## 5. Gestion des Secrets & Données Sensibles

- Ne commitez **JAMAIS** de fichiers `.env`, clés secrètes d'API (Alpha Vantage, SendGrid, Firebase), tokens Google OAuth ou certificats.
- Renseignez uniquement des variables d'exemple dans les fichiers `.env.example`.
