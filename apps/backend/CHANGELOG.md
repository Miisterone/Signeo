# Changelog

## [0.2.0](https://github.com/Miisterone/Signeo/compare/backend-v0.1.3...backend-v0.2.0) (2026-11-17)


### Features

* add change-password endpoint ([dc4c5a1](https://github.com/Miisterone/Signeo/commit/dc4c5a1ff84ebfa007f1d84f650a36ed72a51ebf))
* limite les tentatives de connexion + store auth ([ee0d6e9](https://github.com/Miisterone/Signeo/commit/ee0d6e9813cb8a8332dfd553934aac76db1054d1))


### Bug Fixes

* supabase error handling improvements ([250cb58](https://github.com/Miisterone/Signeo/commit/250cb5806d4a47279d7f6d98799f7bb6c0435d5a))


### Refactoring

* **auth:** inject supabase clients + role from jwt strategy ([4d986c5](https://github.com/Miisterone/Signeo/commit/4d986c593a18e42ba655596283f38c0585c6540e))


### CI CD

* **backend:** switch jest to ESM and rename eslint config ([afd35d6](https://github.com/Miisterone/Signeo/commit/afd35d6687c48585544e43cfc5d6d3a320f39ed0))

## [0.1.3](https://github.com/Miisterone/Signeo/compare/backend-v0.1.2...backend-v0.1.3) (2026-10-29)


### Bug Fixes

* exclut .env docker image + change swagger route ([053b207](https://github.com/Miisterone/Signeo/commit/053b207d0e85fea735851c0858344b169a938e48))


### Documentation

* explain docker architecture and add .env.example files ([be2302c](https://github.com/Miisterone/Signeo/commit/be2302ccef8249807d7b361bc9daf58222e8557a))
* save ([581abb7](https://github.com/Miisterone/Signeo/commit/581abb77f84412e9283977670d88fe96e93550d7))


### CI CD

* add docker config frontend + backend (not mobile) ([6dfc8f4](https://github.com/Miisterone/Signeo/commit/6dfc8f402351f1fcd1b59da86152b50bb53855e3))
* **docker:** add lint + test ([cc98773](https://github.com/Miisterone/Signeo/commit/cc9877381b07e84b0e8902884d7c86bfcdf92a1b))
* simplify Dockerfile commands ([1f7b8de](https://github.com/Miisterone/Signeo/commit/1f7b8de4213b442d532fa2576b4bcf3323e8c598))

## [0.1.2](https://github.com/Miisterone/Signeo/compare/backend-v0.1.1...backend-v0.1.2) (2026-09-20)


### Refactoring

* security (add new API authentication and limit login attempts) ([#19](https://github.com/Miisterone/Signeo/issues/19)) ([93e5c3b](https://github.com/Miisterone/Signeo/commit/93e5c3bc02076a67e745ae25193c94707bb8b79b))

## [0.1.1](https://github.com/Miisterone/Signeo/compare/backend-v0.1.0...backend-v0.1.1) (2026-09-12)


### Features

* **frontend:** profil page ([#17](https://github.com/Miisterone/Signeo/issues/17)) ([79aa5bf](https://github.com/Miisterone/Signeo/commit/79aa5bf9b9928bb0f03715ab6545dc559bdfddbd))
