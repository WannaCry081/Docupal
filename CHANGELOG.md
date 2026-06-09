# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## How to use this file

- Add your changes under `[Unreleased]` as you work.
- When you publish a release, rename `[Unreleased]` to the version number (e.g. `[1.0.0] - 2026-06-04`).
- Start a new empty `[Unreleased]` section for the next batch of changes.
- GitHub Releases (powered by Release Drafter) will also show categorized release notes automatically.

## [0.2.0](https://github.com/WannaCry081/Docupal/compare/docupal-v0.1.0...docupal-v0.2.0) (2026-06-09)


### Features

* add Accordion component with items, triggers, and content ([43aad7f](https://github.com/WannaCry081/Docupal/commit/43aad7f077e52c5b764322be886a582b3ef3a568))
* add genesis to project ([7909509](https://github.com/WannaCry081/Docupal/commit/7909509cb94fb92d7d865b94f40d7e1ed1b8b131))
* add not-found page ([e6512b6](https://github.com/WannaCry081/Docupal/commit/e6512b6980d576000c4eae6351c1681d920341bd))
* add shadcn badge component ([ebcd174](https://github.com/WannaCry081/Docupal/commit/ebcd17498083a1ecd6ca77abba5b8fb6b94b6b8c))
* add shadcn field component ([c9861e5](https://github.com/WannaCry081/Docupal/commit/c9861e530ce6d0f6ee3f85f226cd31fe6ec8c2f2))
* add shadcn label component ([1d3c353](https://github.com/WannaCry081/Docupal/commit/1d3c35319d31f04e2f70a7ab74d54c09cfef8f16))
* add shadcn separator component ([5274a28](https://github.com/WannaCry081/Docupal/commit/5274a28ca8fc0c8c4d5592b6b26570ca7e3b90b2))
* add shadcn sonner component ([298a841](https://github.com/WannaCry081/Docupal/commit/298a841047fa87c0eb71723e4a897b2d14dd07c5))
* add shadcn tooltip component ([bb4dbd0](https://github.com/WannaCry081/Docupal/commit/bb4dbd0111e64d9dd0b47774af6c27d76f8d2873))
* add sonner and tooltip provider in layout.tsx ([a47b36f](https://github.com/WannaCry081/Docupal/commit/a47b36fab0913b4dc339d6a25b82698e202fe906))
* **api:** add TutorialsPoint PDF download proxy endpoint ([9869712](https://github.com/WannaCry081/Docupal/commit/9869712296e92bd7b68499217adeec3fb0bd9da6))
* **api:** add TutorialsPoint topic verification endpoint ([11a8a13](https://github.com/WannaCry081/Docupal/commit/11a8a13fd5ebb64468d95a18a5d5c9e9cf686cb3))
* **api:** add TutorialsPoint zip aggregation endpoint ([a2e5728](https://github.com/WannaCry081/Docupal/commit/a2e5728ffae57e7226afcaa00e850def09af8dcd))
* **config:** add site constants for upstream links ([dbfc838](https://github.com/WannaCry081/Docupal/commit/dbfc83827109889138271bf2a360e3a66507726e))
* **landing:** add sequential batch download handling with error states ([6d3768d](https://github.com/WannaCry081/Docupal/commit/6d3768dfa9774bb14a75f0f7c3551fdf96afbc8e))
* **landing:** add site chrome and replace starter assets ([6d177dd](https://github.com/WannaCry081/Docupal/commit/6d177dd4bfcee6c4ee4f1069c15b866eb904e5f7))
* **landing:** add topic queue store and API client ([ddac712](https://github.com/WannaCry081/Docupal/commit/ddac712f03b9385af684e802898aebbb543fa645))
* **landing:** add topic suggestion and queue behavior hooks ([8ec5e6e](https://github.com/WannaCry081/Docupal/commit/8ec5e6e6a57ecb48ef5de4084b1ec545e67bbe68))
* **landing:** add typed content and status metadata ([6927858](https://github.com/WannaCry081/Docupal/commit/6927858595f939edf955bdd71bcd31a9c7140418))
* **landing:** compose homepage sections and FAQ accordion ([010203d](https://github.com/WannaCry081/Docupal/commit/010203dfc7e992b53aaed3925a46abf3b3e7ea20))
* **landing:** implement topic queue input and actions ([45e108b](https://github.com/WannaCry081/Docupal/commit/45e108b31945e41172f224a229c61e976dd1f659))
* **landing:** integrate autocomplete, share action, and download progress UI ([baaee81](https://github.com/WannaCry081/Docupal/commit/baaee81f3623f1f51a93162e1cab4c1fd56f7fe7))
* **queue:** add copy-url action for verified topics ([86a606d](https://github.com/WannaCry081/Docupal/commit/86a606d06acb60b7c40f6396ca93e252f5b902a0))
* **queue:** add retry action for unresolved topics ([b3560f8](https://github.com/WannaCry081/Docupal/commit/b3560f85f28d73c6742da6bce54f94bf3f17ef71))
* **queue:** auto-remove failed topics and add escape-to-clear input ([371b4a0](https://github.com/WannaCry081/Docupal/commit/371b4a034c1fa0addb3bb544eedb55814e331462))
* **queue:** switch batch downloads to single zip workflow ([0bce048](https://github.com/WannaCry081/Docupal/commit/0bce048df4703c121316148bd6410694a3f04977))
* setup lenis smooth scroll to project ([d190444](https://github.com/WannaCry081/Docupal/commit/d1904444cf9047e1f58709e9151c3d3d52fa491b))
* **theme:** persist user selection via cookie and early class sync ([078de32](https://github.com/WannaCry081/Docupal/commit/078de3224cdd0b09515e62e3aa70040c81346a89))
* **theme:** wire next-themes provider into root layout ([dbb249a](https://github.com/WannaCry081/Docupal/commit/dbb249ac5c4149876477f1380184c4a60ff56cce))
* **ui:** add dialog, command, popover, and drawer primitives ([785579d](https://github.com/WannaCry081/Docupal/commit/785579d0e6067fd363bb421a27f630f49827ae01))
* **ui:** add input and input-group primitives ([e9c9dc2](https://github.com/WannaCry081/Docupal/commit/e9c9dc297dfe37cdcf6a5c051e1d21883ab88bb6))
* **ui:** add reusable noise and fade-in visual utilities ([7395c6e](https://github.com/WannaCry081/Docupal/commit/7395c6e6565bd53d0b5e7502d173d3c6d4559d53))
* **ui:** add theme switcher dropdown menu ([7c7f004](https://github.com/WannaCry081/Docupal/commit/7c7f0040cc1e1b14b0ebeec8c9f7ca1e3cad8c75))


### Bug Fixes

* correct HTML entity usage in NotFound component ([1912ce1](https://github.com/WannaCry081/Docupal/commit/1912ce1741811395d91fc3c4a4a4742afcd37324))
* **faq:** use unique accordion item values per question ([1623e32](https://github.com/WannaCry081/Docupal/commit/1623e320436329d69b18ab6ac9b64736b68e965f))
* fix cicd issues on release.yml and ci.yml ([a72d0e5](https://github.com/WannaCry081/Docupal/commit/a72d0e5a33837c9c7a989645617e226d09049ee9))
* fix linting errors in AGENTS.md ([3b2ce51](https://github.com/WannaCry081/Docupal/commit/3b2ce515201dfc6c180f4ade2da13da1adfc3b8f))
* fix markdown linting ([d175039](https://github.com/WannaCry081/Docupal/commit/d1750396f692baa77366791ff7e11fc4f30d0307))
* remove version specification for pnpm setup in CI workflow ([a47a439](https://github.com/WannaCry081/Docupal/commit/a47a439e5066c442dcc87f0c59a1c27c324a5a22))
* streamline pnpm setup in CI workflow ([4449b9c](https://github.com/WannaCry081/Docupal/commit/4449b9cd4389489dad77364135bbd6c51481f37e))
* update ci.yml to use pnpm ([4395b48](https://github.com/WannaCry081/Docupal/commit/4395b48665a6e38762dd736fe6b41d1aae6d7b22))
* update enabling corepack step ([07b438d](https://github.com/WannaCry081/Docupal/commit/07b438da0fe82f2c59847bb2c44e10dcfd7c5a48))
* update import for use-mobile hook ([c0a1660](https://github.com/WannaCry081/Docupal/commit/c0a1660725630d0a54659e0712a91a2485bd27ba))
* update Node.js version matrix in CI workflow ([038683b](https://github.com/WannaCry081/Docupal/commit/038683b1c6765d6ea14a3250f5101e997894556f))
* update pnpm commands to use 'run --if-present' syntax ([050abfd](https://github.com/WannaCry081/Docupal/commit/050abfd62094f2fb0ba7abffdc53853846153a80))

## [Unreleased]

### Added

### Changed

### Fixed

### Removed
