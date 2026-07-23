# MDD - Monde de Dév

Réseau social pour développeurs

## Description

MDD (Monde de Dév) est une plateforme permettant aux développeurs de s'abonner à des sujets de programmation, publier des articles et échanger via des commentaires.

## Getting Started

### Prerequisites

- Node.js 22+
- npm ou yarn
- MySQL

### Installation

```bash
git clone https://github.com/UncleBone/Projet_5.git
cd DFSJS-Prenez-en-charge-le-d-veloppement-d-une-application-full-stack-JavaScript-compl-te
npm install
```

### Base de données

Créer la base de données MySQL :

```bash
mysql -u root -p < schema.sql
```

### Configuration

1. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

2. Renseigner les identifiants de connection dans .env
3. Initialiser la base de données :
```bash
npx prisma generate
npx prisma db push
```

### Lancement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **Base de données**: MySQL
- **ORM**: Prisma
- **Validation**: Zod

## Features

- Authentification utilisateur (inscription/connexion)
- Gestion de profil
- Abonnement à des thèmes
- Publication d'articles
- Commentaires sur articles
- Fil d'actualité personnalisé

## Project Structure

```
DFSJS.../
├── app/               		# App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── global.css
│   ├── not-found.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── home/
│   │    ├── page.tsx
│   │    ├── create/page.tsx
│   │    └── [slug]/page.tsx
│   ├── topics/page.tsx
│   ├── profile/page.tsx
│   └── api/				# Routes API			   
│        ├── auth/
│        │    ├── register/route.ts
│        │    └── login/route.ts
│        ├── posts/
│        │    ├── route.ts
│        │    └── [id]
│        │    		├── route.ts
│        │    		└── comment/route.ts
│        ├── topics/route.ts
│        └── user/
│             ├── route.ts
│             └── subscriptions
│             		├── route.ts
│             		└── [id]/route.ts
├── components/           	# Composants UI
│    ├── navigation.tsx
│    ├── back.tsx
│    ├── post.tsx
│    ├── fullPost.tsx
│    ├── comment.tsx
│    └── topic.tsx
├── lib/               		# Utilitaires
│    ├── authenticate.ts
│    ├── errorHandler.ts
│    ├── jwt.ts
│    ├── prisma.ts
│    └── utils.ts
├── dto/ 					# Data Transfer Objects & Types
│    ├── post.dto.ts
│    ├── topic.dto.ts
│    └── user.dto.ts
├── prisma/            		# Schéma de la base de données
│    └── schema.prisma
├── public/	  		  		# Assets statiques
├── controller/				# Logique de contrôle
│    ├── auth.controller.ts
│    ├── post.controller.ts
│    ├── topic.controller.ts
│    └── user.controller.ts        
├── service/ 					# Logique métier
│    ├── auth.client.service.ts
│    ├── auth.service.ts
│    ├── post.service.ts
│    ├── topic.service.ts
│    └── user.service.ts 
├── repository/ 				# Accès à la base de données (Prisma)
│    ├── auth.repository.ts
│    ├── post.repository.ts
│    ├── topic.repository.ts
│    └── user.repository.ts 
├── test/setup.js				# setup vitest
├── e2e/  						# tests e2e et rapports de tests
├── lighthouse.report.html		# rapport lighthouse
└── package.json
```

## Testing
- Lancement des tests vitest (unitaires, intégration et api) avec rapport de couverture :
```bash
	npm run test:coverage
```
- lancement des tests e2e avec rapport textuel :
```bash
	npx playwright test > e2e/report.txt
```

## License

MIT License
