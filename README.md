# blog-RestAPI

API RESTful de blog personnel construite avec Node.js, TypeScript, Express et PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-16.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-6.x-red)
![Jest](https://img.shields.io/badge/Jest-29.x-orange)

## Stack technique

- Node.js 16, TypeScript, Express 4
- PostgreSQL 15 via Prisma ORM 4
- Redis 6 via ioredis
- JWT pour l authentification
- Joi pour la validation des entrees
- Jest et ts-jest pour les tests unitaires
- Swagger UI pour la documentation interactive

## Architecture

```
Routes -> Controllers -> Services -> Repositories -> PostgreSQL
                                  -> Redis (cache)
```

Separation stricte des responsabilites : chaque couche ne connait
que la couche immediatement en dessous.

## Installation

```bash
git clone https://github.com/TON_USERNAME/blog-RestAPI.git
cd blog-RestAPI
pnpm install
cp .env.example .env
# remplir les variables dans .env
./node_modules/.bin/prisma migrate deploy
pnpm dev
```

## Variables d environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| PORT | Port du serveur | 3000 |
| DATABASE_URL | URL PostgreSQL | postgresql://user:pass@localhost:5432/blog_db |
| REDIS_URL | URL Redis | redis://localhost:6379 |
| JWT_SECRET | Cle secrete JWT | supersecretkey |
| JWT_EXPIRES_IN | Duree du token | 7d |
| CACHE_ARTICLES_TTL | TTL cache articles en secondes | 600 |

## Endpoints

### Auth

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | /auth/register | Inscription | Non |
| POST | /auth/login | Connexion | Non |
| POST | /auth/logout | Deconnexion | Oui |

### Articles

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | /articles | Liste paginee | Non |
| GET | /articles/:slug | Detail par slug | Non |
| POST | /articles | Creation | Oui |
| PATCH | /articles/:id | Mise a jour | Oui |
| DELETE | /articles/:id | Suppression | Oui |
| POST | /articles/:id/tags | Mise a jour des tags | Oui |
| GET | /articles/:id/comments | Liste des commentaires | Non |
| POST | /articles/:id/comments | Ajout commentaire | Oui |
| PATCH | /articles/:id/comments/:id | Modification commentaire | Oui |
| DELETE | /articles/:id/comments/:id | Suppression commentaire | Oui |

### Tags

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | /tags | Liste des tags | Non |

### Stats

| Methode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | /stats/me | Mes statistiques | Oui |
| GET | /stats/authors/:id | Stats d un auteur | Oui |
| GET | /stats/global | Stats globales | Admin |

## Exemples

### Inscription

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","username":"monuser"}'
```

Reponse :

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "monuser",
      "role": "AUTHOR"
    },
    "token": "eyJhbGc..."
  }
}
```

### Creation d un article

```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"title":"Mon premier article","content":"Contenu...","published":true,"tags":["typescript","nodejs"]}'
```

### Liste des articles avec filtres

```bash
curl "http://localhost:3000/articles?page=1&limit=5&sortBy=views&sortOrder=desc&published=true"
```

## Tests

```bash
pnpm test
pnpm test:coverage
```

## Documentation interactive

Swagger UI disponible sur http://localhost:3000/api-docs apres demarrage du serveur.
```