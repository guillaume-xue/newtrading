# Spécifications UI/UX & Design System — NewTrading

- **Projet :** NewTrading
- **Date de mise à jour :** 8 juin 2026
- **Auteur :** Guillaume Xue
- **Lien de la maquette Figma :** [Ouvrir le fichier Figma NewTrading](https://www.figma.com/design/cLff7ZS6SyTwO5MKAyB8zy/newtrading?m=auto&t=EAOp1Bd9unF74zYq-6)
- **Design Tokens / Variables :** [Lien vers les styles / composants partagés]

---

## 1. Identité Visuelle & Thème

- **Thème global :** Mode sombre (*Dark Mode*) par défaut pour optimiser la lisibilité des graphiques boursiers.
- **Typographie :** Polices sans-serif modernes (ex. *Inter*, *Roboto* ou *SF Pro*) pour garantir la netteté des données chiffrées.
- **Palette de couleurs principales :**
  - **Achat / Gain (Long) :** Vert (ex. `#00C076` / `#26A69A`)
  - **Vente / Perte (Short) :** Rouge (ex. `#FF3B30` / `#EF5350`)
  - **Arrière-plan / Background :** Sombre (ex. `#131722` / `#1E222D`)
  - **Surfaces & Cartes :** Gris foncé (ex. `#2A2E39`)
  - **Bordures & Séparateurs :** Gris discret (ex. `#363C4E`)

---

## 2. Structure des Écrans (V1)

### A. Graphique Principal & Analyse
- Zone centrale intégrant la bibliothèque **Lightweight Charts**.
- Affichage des chandeliers boursiers (OHLCV) en direct et historique.
- Barre d'outils de tracé : annotations et lignes de tendance.
- Repères visuels sur le graphique pour les positions ouvertes (Longue / Courte).

### B. Panneau Latéral (Watchlist)
- Liste des actifs financiers suivis (code actif, dernier cours, variation en %).
- Accès rapide pour basculer d'un instrument à un autre.

### C. Panneau de Paper Trading & Portefeuille
- Formulaire de passage d'ordres : saisie du montant/quantité, choix de direction (**BUY** / **SELL**).
- Affichage du solde virtuel (*Current Balance*) et calcul du PnL en direct.

### D. Module d'Alertes
- Interface modale ou panneau pour définir une alerte de prix :
  - Actif concerné (*Asset Code*)
  - Prix cible (*Target Price*)
  - Condition (*Above* / *Below*)
  - Canal (*Push*, *Email*, *Both*)

### E. Authentification
- Écran de connexion et d'inscription (formulaire classique sécurisé par JWT et bouton *Sign in with Google*).

---

## 3. Checklist d'Intégration Frontend

- [ ] Exporter les icônes en SVG optimisé (dossier `src/assets/icons`).
- [ ] Valider l'accessibilité des contrastes sur fond sombre (norme WCAG AA).
- [ ] Vérifier la cohérence responsive (Web Desktop / Tablette / Mobile React Native).
