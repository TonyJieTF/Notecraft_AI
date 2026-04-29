# NoteCraft backend scaffold

This scaffold includes:
- NestJS app module
- Global Prisma module and Prisma service
- Service + DTO scaffolding for users, notes, search, review, and ai-jobs
- `prisma/seed.ts` with the same demo notes, tags, flashcards, review tasks, and search history used in the product prototype

## Recommended packages

Install the typical NestJS + Prisma stack:

```bash
npm install @nestjs/common @nestjs/core @nestjs/mapped-types @prisma/client class-transformer class-validator reflect-metadata rxjs
npm install -D prisma typescript ts-node @types/node
```

## Seed command

Add this to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Then run:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Notes

- DTOs already map to the Prisma enums and field names used in the schema.
- Services are intentionally thin and good for MVP development.
- Controllers are not included yet, so you can wire your own route structure without refactoring the services first.
- `lastReviewedAt` in `UpdateNoteDto` should be converted to `new Date(dto.lastReviewedAt)` before stricter production rollout if you want explicit typing in service updates.
