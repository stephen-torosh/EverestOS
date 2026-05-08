# Copilot instructions for EverestOS

## Build, lint, and test

- Use Node.js `^20.19.0 || >=22.12.0`.
- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production build with Vite.
- `npm run preview` serves the built app locally.
- `npm run lint` runs both `oxlint` and `eslint`, and both commands use `--fix`, so linting can rewrite files.
- `npm run format` runs Prettier on `src/`.
- There is currently no `npm test` script and no single-test workflow configured.

## High-level architecture

- This is a Vue 3 + Vite SPA. `src/main.js` mounts `App.vue`, then installs Pinia and Vue Router.
- `App.vue` is the global shell: it renders `TheSidebar`, keeps the routed view in `<RouterView />`, and pushes global UI state into root `data-*` attributes (`data-theme`, `data-accent`, `data-animations`).
- `src/stores/systemStore.js` is the cross-cutting store. It owns theme, accent color, font size, language, animation preference, and the lightweight translation function `t(path)`. Those preferences are persisted in `localStorage`.
- `src/router/index.js` defines the main navigation and uses each route's `meta.title` as a translation key. The global `beforeEach` reads `systemStore.t(...)` to set the document title.
- The main user-facing data flow is in `src/views/MissionsView.vue`: it combines `swsmStore` for world/section/mission data and `knowledgeStore` for the progression graph.
- `src/stores/swsmStore.js` holds the static world/section/mission hierarchy and exposes derived getters like `currentSections` and `activeMissions`.
- `src/stores/knowledgeStore.js` is a setup-style Pinia store for the knowledge tree. Nodes carry dependency data (`dependsOn`) and are unlocked by `completeNode()`.
- `src/components/knowledge/KnowledgeGraph.vue` turns knowledge nodes into Vue Flow elements, then lays them out with Dagre. If you change node shape or dependency fields, update both the store data and the graph transform logic.
- `src/utils/masterEngine.js`, `src/components/MasterScene.vue`, and `src/missions/TestMission.js` form a separate experimental 3D/physics mission engine built on Three.js + Cannon-es. That stack is not currently wired into the router-driven UI.

## Key conventions

- Use the `@` alias for imports from `src` (`vite.config.js`, `jsconfig.json`).
- The app uses Vue SFCs with `<script setup>` almost everywhere and follows the existing no-semicolon style.
- Reuse the base UI primitives in `src/components/ui/` instead of introducing ad hoc buttons/text/modal patterns.
- Text is usually stored as translation keys, not inline strings. `systemStore.t('a.b.c')` is the main lookup path, and `BaseText` supports a `path` prop for translated labels.
- `BaseSelectGroup` treats labels containing `.` as translation keys. Pass already translated labels only when the string should stay literal.
- Route titles should be translation keys in `meta.title`, not hard-coded document titles.
- Theme/accent changes are expected to flow through CSS custom properties and root `data-*` attributes instead of per-component color logic.
- Existing code often binds component `v-model` directly to Pinia store state (for example in `TheSidebar.vue`). Follow that pattern when extending settings-style controls.
- Knowledge graph nodes are expected to have at least `id`, `label`, `type`, `status`, `dependsOn`, and `xp`.
