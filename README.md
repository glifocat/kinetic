# Kinetic / NanoClaw

An 18-second portrait animation of NanoClaw’s host/agent message loop, inspired by the fine-line mechanical diagrams on @krishnachaytanya’s TikTok account.

## Play

Public player: https://glifocat.github.io/kinetic/

GitHub Pages publishes the root of the `main` branch. Push changes to `main` to update the site. The downloaded reference clips and intermediate soundtrack are excluded from version control.

Run `npm start`, then open http://127.0.0.1:4173. The desktop player uses a wide diagram; phones and video exports use the portrait composition. Sound, export, and direct MP4 download controls remain available at every width. Use the **Sound off / Sound on** control to enable sound (browsers require a user gesture). Pause, seek, select a chapter, or change playback speed. Reduced-motion preferences start the player paused.

## Finished video

`exports/nanoclaw-host-agent-loop.mp4` is 1080 × 1920 at 30 fps, with a stereo original sound score. The browser can also record a WebM with sound via **Export 1080p video**; keep the tab visible during recording.

To regenerate the MP4: `npm ci`, install FFmpeg, then `node scripts/render.cjs`. This renders exactly 540 frames and synthesizes the same audio score used by the player. No remote services or agent calls are made.

## Architecture

Three persistent anchors—Chat, Host, Agent—frame one illustrative session. Inbox, model requests through OneCLI, one local file read, and Outbox appear only while active. Original clicks, soft impacts and short tonal sweeps mark the handoffs.

This depicts current NanoClaw’s mailbox architecture: channel adapter → host routing → per-session inbound.db → isolated agent runner → outbound.db → host delivery → channel. The model client and tool execution live inside the agent container. Model API requests cross the boundary to OneCLI’s credential proxy, which injects credentials, and then to the external hosted model. Raw API keys remain outside the container. Durations and example tool calls are illustrative. This is an explainer, not a running NanoClaw instance or a complete security model.

Sources:
- https://github.com/nanocoai/nanoclaw#architecture
- https://github.com/nanocoai/nanoclaw/blob/main/src/router.ts

## Files

- `animation.js`: deterministic canvas renderer, choreography, synthesized sound score, transport and WebM export.
- `style.css`: responsive player layout.
- `scripts/render.cjs`: offline canvas/FFmpeg renderer.
- `docs/nanoclaw-architecture-study.md`: source review and narrative decisions.
- `docs/style-study.md`: visual observations, limitations and sound design decisions.
