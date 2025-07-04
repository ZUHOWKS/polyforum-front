# Forum Poly - Application Angular + PocketBase

## Description

Une application de forum simple construite avec Angular 20 et PocketBase. L'application comprend :

- Page d'authentification (connexion/inscription)
- Liste des posts du forum
- Création de nouveaux posts
- Suppression des posts (pour l'auteur)

## Prérequis

- Node.js (version 18 ou plus récente)
- Angular CLI
- PocketBase

## Installation

### 1. Installation des dépendances Angular

```bash
cd polyforum-front
npm install
```

### 2. Configuration de PocketBase

#### Téléchargement de PocketBase

1. Téléchargez PocketBase depuis [https://pocketbase.io/docs/](https://pocketbase.io/docs/)
2. Placez l'exécutable dans le dossier `pocketbase/`

#### Démarrage de PocketBase

```bash
cd pocketbase
./pocketbase serve
```

PocketBase démarrera sur `http://127.0.0.1:8090`

#### Configuration de la base de données

1. Accédez à l'interface d'administration : `http://127.0.0.1:8090/_/`
2. Créez un compte administrateur
3. Créez les collections nécessaires :

**Collection "users" (devrait déjà exister) :**

- Type : Auth
- Champs par défaut (email, password, etc.)
- Ajoutez un champ `name` (type: Text)

**Collection "posts" :**

- Type : Base
- Champs :
  - `title` (type: Text, required)
  - `content` (type: Text, required)
  - `author` (type: Relation vers users, required)

#### Règles d'accès

Pour une configuration simple, vous pouvez définir les règles suivantes :

**Collection users :**

- List/Search rule: `@request.auth.id != ""`
- View rule: `@request.auth.id != ""`
- Create rule: (vide - permet l'inscription publique)
- Update rule: `@request.auth.id = id`
- Delete rule: `@request.auth.id = id`

**Collection posts :**

- List/Search rule: `@request.auth.id != ""`
- View rule: `@request.auth.id != ""`
- Create rule: `@request.auth.id != ""`
- Update rule: `@request.auth.id = author.id`
- Delete rule: `@request.auth.id = author.id`

## Démarrage de l'application

### 1. Démarrer PocketBase

```bash
cd pocketbase
./pocketbase serve
```

### 2. Démarrer Angular

```bash
cd polyforum-front
ng serve
```

L'application sera disponible sur `http://localhost:4200`

## Utilisation

1. **Inscription** : Créez un nouveau compte avec votre email, nom et mot de passe
2. **Connexion** : Connectez-vous avec vos identifiants
3. **Voir les posts** : Une fois connecté, vous accédez à la liste des posts
4. **Créer un post** : Cliquez sur "Nouveau Post" pour créer un post
5. **Supprimer un post** : Vous pouvez supprimer vos propres posts

## Structure du projet

```
polyforum-front/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── auth/           # Composant d'authentification
│   │   │   └── posts/          # Composant liste des posts
│   │   ├── services/
│   │   │   ├── auth.service.ts # Service d'authentification PocketBase
│   │   │   └── posts.service.ts # Service de gestion des posts
│   │   ├── app.component.*
│   │   ├── app.routes.ts       # Configuration des routes
│   │   └── app.config.ts
│   ├── styles.css              # Styles globaux
│   └── index.html
└── pocketbase/
    └── pocketbase              # Exécutable PocketBase
```

## Technologies utilisées

- **Frontend** : Angular 20, TypeScript, CSS3
- **Backend** : PocketBase
- **Base de données** : SQLite (intégrée à PocketBase)
- **Authentification** : PocketBase Auth

## Fonctionnalités

✅ Inscription utilisateur
✅ Connexion/Déconnexion
✅ Liste des posts
✅ Création de posts
✅ Suppression de posts (auteur uniquement)
✅ Interface responsive
✅ Gestion des erreurs

## Notes de développement

- L'URL de PocketBase est configurée dans les services (`http://127.0.0.1:8090`)
- Les formulaires utilisent la validation Angular
- L'authentification est gérée via un service avec Observable
- Le routage protège l'accès aux posts (connexion requise)
