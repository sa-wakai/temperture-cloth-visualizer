# Changelog

## [0.1.0] — 2026-05-19

### Added
- Indoor outfit assistant: room-temperature + humidity → child clothing pattern matching
- Outdoor outfit assistant: Open-Meteo weather fetch → layered outfit recommendation
- PWA shell with Workbox app-shell caching (no weather API caching by design)
- Geolocation with 3 s timeout + cached lat/lon fallback + city-name geocoding
- Weather cache with freshness tiers (fresh <1 h / stale 1-2 h / very-stale >2 h banner)
- Wardrobe management: add/edit/delete adult items and child patterns with overlap detection
- JSON export/import for wardrobe data
- Toast notifications with per-type durations (success 1.5 s / warning 3 s / error 4 s)
- Noto Sans JP typography, CSS variable design token system
- 51 unit tests covering all business logic (outdoor, indoor, keyword mapping, weather cache, toast)
- Responsive portrait-first layout, `prefers-reduced-motion` animation support
