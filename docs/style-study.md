# Reference study

Visually sampled multiple moments from these public TikTok clips:

- Agent loop: https://www.tiktok.com/@krishnachaytanya/video/7685376080093400350
- Load balancing: https://www.tiktok.com/@krishnachaytanya/video/7686859266199751966
- Caching layers: https://www.tiktok.com/@krishnachaytanya/video/7675726744145415454

## Observed visual grammar

Near-black blue backgrounds; cool thin outlines; limited mint, lavender and blue accents; mechanical rotors and physical queue racks; glowing particles that visibly move between components; compact monospace labels; restrained counters; short bottom captions; stable layouts that allow the viewer to follow state changes. Mechanisms express the explanation instead of relying on decorative transitions.

## Application

One persistent machine occupies a portrait composition. A host rotor directs an arrival to the inbound mailbox. A container wake pulses across the isolation boundary. Three request/result cycles accumulate context. The agent writes an outbound mailbox; the host returns a reply. Six timed captions explain the current action.

Original artwork; no reference images, music or video are included in the deliverable.

## Sound

The browser player used a blob media source, but a subsequent direct download with yt-dlp succeeded for both the caching and agent-loop clips. Their audio was extracted and analyzed with FFmpeg and a reproducible 10 ms RMS transient detector. This session cannot directly audition audio, so the observations below are signal analysis and visual alignment, not listening impressions. No exact sonic match is claimed.

The user selected “Tactile clicks, soft impacts, and whooshes synced to motion.” The original synthesized score uses restrained noise clicks, low mailbox impacts, filtered directional sweeps, short tool-result tones and a soft reply chime. A very low harmonic floor supplies continuity. All audio is deterministic and shares the animation timeline; there is no voiceover or copied music.

## Scope

Current NanoClaw mailbox architecture, as inspected September 18, 2026. This intentionally does not depict the older stdin/file-IPC architecture. Timing is illustrative, and the three tool cycles are explanatory examples, not a claim about a fixed NanoClaw tool sequence.


## Direct audio analysis follow-up

Local references: `references/caching-layers.mp4`, `references/agent-loop.mp4`, and their extracted mono 24 kHz WAVs. Original source audio is stereo AAC at 44.1 kHz. Both downloaded clips are approximately 9.045 seconds.

- Caching: RMS −32.9 dBFS, peak −14.5 dBFS. Spectrogram shows repeated short tonal events, with much of the conspicuous energy near 300–400 Hz and additional higher tones. Frequent events suggest a sound-per-packet approach, rather than a slow cinematic bed.
- Agent loop: RMS −38.3 dBFS, peak −11.8 dBFS. Quiet average level with sharp transients; broader sweeps appear around the middle of the clip, with multiple sustained tonal bands at its ending.
- Comparison against one-frame-per-second contact sheet: the middle of the agent clip shows a failed TEST entering context; the ending shows green tests and SHIP. The wider middle sweeps and layered ending tones align broadly with those narrative moments. Exact frame-by-frame synchronization has not been established.
- Design implication: let discrete events supply the rhythm, use pitch/duration to distinguish request, result and failure, and reserve a richer tonal resolution for success. The initial animation is much slower (30 seconds) than these roughly 9-second references.

Measurements: `references/audio-analysis.json`; reproducible analysis: `python3 references/analyze_audio.py`. Transient detections are algorithmic maxima, not counts of individual sound effects. The current animation soundtrack remains the original first version; this follow-up does not claim it has been remixed from the analysis.
