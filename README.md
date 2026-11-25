# TOUGH.: a drop-test fan concept

A landing page you can break: drop the watch, the page shatters, the watch is fine. Scroll chapters (exploded view, colours) run on a scrubbed timeline. Built by Web Atelier as an unofficial fan concept, not affiliated with or endorsed by Casio. Product images are AI-generated illustrations. Nothing is sold here.

- `site/`: static page (canvas shatter engine, GSAP ScrollTrigger + Lenis from CDN), served by nginx (`Dockerfile`, `nginx.conf`, `/healthz`).
- Live: https://tough.yan.io.vn (noindex).
- Source of truth for edits: `video-plans/web-atelier/gshock/site`, copied here before each deploy.
