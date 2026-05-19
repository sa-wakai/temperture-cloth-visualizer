# TODOS

## Design

- [ ] **Create DESIGN.md** — Extract the Visual Design System section from the main design doc into a dedicated `DESIGN.md` file. This allows `/design-review` and `/design-consultation` gstack skills to auto-reference it. Do after first implementation milestone.

- [ ] **Dark mode (v2)** — Add `prefers-color-scheme: dark` block to CSS. CSS variables are already defined so this is a token-swap, not a refactor. Decide color-for-color at that point.

## Engineering (from /plan-eng-review)

- [ ] Add one-line comment to fallback chain code explaining "err warmer" direction rationale
- [ ] Indoor mode: add HTML `min`/`max` attributes to number inputs (roomTemp: 0–50, humidity: 0–100) + inline validation message
- [ ] Add React `ErrorBoundary` around `/outdoor` route for malformed API response
- [ ] Keyword mapping: specify precedence order in code — waterproof → heavy → mid → light-layer (first match wins)
- [ ] City input geocoding: fire on form submit only (not on keystroke)
- [ ] Toast component unit tests: (1) renders amber for success, red for error; (2) auto-dismisses after 1.5s (fake timers); (3) warning auto-dismisses after 3s (fake timers); (4) does not block interaction with elements behind it. See `src/components/Toast.test.tsx`.

## v2+ (deferred)

- [ ] iOS or Android native widget — decide after 2 weeks of v1 daily usage
- [ ] Retroactive feedback: "寒かった / ちょうどよかった / 暑かった" after getting dressed
