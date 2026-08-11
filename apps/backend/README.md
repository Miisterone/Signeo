<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

</p>

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Prima

```bash
#Set up a new local Prisma Postgres `prisma dev`-ready project
$ prisma init

#Start a local Prisma Postgres server for development
$ prisma dev

#Generate artifacts (e.g. Prisma Client)
$ prisma generate

#Browse your data
$ prisma studio

#Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
$ prisma migrate dev

#Pull the schema from an existing database, updating the Prisma schema
$ prisma db pull

#Push the Prisma schema state to the database
$ prisma db push

#Validate your Prisma schema
$ prisma validate

#Format your Prisma schema
$ prisma format

#Display Prisma version info
$ prisma version

#Display Prisma debug info
$ prisma debug
```
