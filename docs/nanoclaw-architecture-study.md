# NanoClaw: architecture study before redesign

Reviewed GitDiagram’s nanocoai/nanoclaw map and upstream source at commit `7902716b5b930215dbee4f56b8fb5b938d40468d` on September 18, 2026. This is a focused trace of the message lifecycle and credential boundary, not a claim to have audited every NanoClaw feature.

## What the diagram clarifies

GitDiagram groups the repository into Bootstrap & Host, State & Coordination, Isolated Agent Runtime, and Channels & External Services. It is a structural map, not a timeline: bootstrap, periodic recovery, chat delivery, and model requests are not sequential steps of one transaction. The animation wrongly gave these different responsibilities similar visual weight.

The upstream architecture document explicitly calls itself a draft and warns that implementation may differ. Source is authoritative. The local clone used for reading is separate from this project; no NanoClaw installation was modified or run.

## Verified normal message path

1. A channel adapter hands the host a normalized inbound event. `src/index.ts` wires this to `routeInbound`.
2. `src/router.ts` resolves messaging-group wiring, evaluates engagement and sender/access permissions, and resolves the session. A message can fan out to more than one wired agent. A non-engaging message can be stored as context without waking an agent.
3. The host writes the selected session's inbound mailbox, then requests a wake for an engaged message. Wake reuses an existing running/in-flight container rather than spawning a fresh container for every message. `src/session-manager.ts`, `src/container-runner.ts`.
4. The runner's `runPollLoop` polls for pending mail, claims processing, combines eligible messages into a prompt, and calls the configured provider with its saved continuation. It can accept follow-up messages while the provider query is active. `container/agent-runner/src/poll-loop.ts`.
5. The Claude provider delegates to the Claude Agent SDK, with MCP capabilities, tool hooks, model configuration, and continuation. The hosted model supplies responses/tool requests; the local SDK/runtime executes tools. NanoClaw's host is not manually scheduling a fixed READ → TEST → EDIT sequence. `container/agent-runner/src/providers/claude.ts`.
6. Outputs go through the outbound mailbox; the host drains due undelivered rows, dispatches them, and records delivery. Depending on provider/tool behavior, there can be several messages during a turn, not just one final reply. `src/delivery.ts`, runner poll loop.

## Boundaries and persistence

- Agent group = shared workspace/instructions/configuration. Session = conversation execution identity and its own mailbox/runtime. These are different scopes.
- Local SQLite composition: host writes inbound.db; runner writes outbound.db. The visible rows represent durable messages/acks, not disposable in-memory queue blocks. Central routing/policy state is separate. Current source also has driver/composition abstractions, so describe SQLite as the local composition, not an immutable rule for every deployment.
- OneCLI is an outbound HTTPS credential gateway, not a third chat mailbox and not limited to model API traffic. Tool calls to external services also use the configured gateway path. Filesystem reads and local tests do not need a credential-proxy round trip.
- Gateway setup contributes environment, CA certificates and credential stubs; the host ensures a OneCLI agent keyed by agent-group identity. Actual service secrets are injected at request time. Avoid saying the container contains no authentication material whatsoever: proxy configuration/stubs and gateway identity are different from raw upstream secrets.
- A separate host reconciliation mechanism handles durable state, due work, idle/stuck sessions and recovery. The sweep supplies a periodic floor and event hints can enqueue work sooner. It is not another step each message traverses.

## Findings from the previous animation

1. The generic internal rotor makes the SDK execution loop look like NanoClaw-specific tool orchestration.
2. The credential path is drawn only from the model client, omitting its broader external-tool role.
3. A single message/reply and three tool calls are an illustrative scenario; they are not fixed system behavior.
4. Emptying mailbox slots implies deletion on consumption. The important state change is pending → processing → completed/delivered.
5. All concerns stay visible simultaneously, producing crowding and a misleading equivalence between runtime mechanisms.

## Implemented visual narrative

The 18-second redesign follows one chosen triggered chat message in one local session. Three persistent anchors: Chat, Host, Agent. Reveal details only when active:

- Arrival: show routing and a short Inbox handoff at the Host/Agent boundary.
- Execution: focus on the Agent. Show a model request crossing a small gateway to an external provider, then one local tool action and its result. Keep the mailbox and host mechanics subdued.
- Reply: return to the full three-anchor view; reveal the Outbox handoff and delivery back to Chat.

Use temporary labels, one moving packet at a time and a single caption. Put schema names, runtime names, central DB, bootstrap, scheduling and recovery in optional explanatory material. Keep the credential boundary accurate without making it a permanent additional row of equally large boxes.

## Sources

- https://gitdiagram.com/nanocoai/nanoclaw
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/src/router.ts
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/src/container-runner.ts
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/container/agent-runner/src/poll-loop.ts
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/container/agent-runner/src/providers/claude.ts
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/src/delivery.ts
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/src/gateway-providers/onecli.ts
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/container/skills/onecli-gateway/SKILL.md
- https://github.com/nanocoai/nanoclaw/blob/7902716b5b930215dbee4f56b8fb5b938d40468d/src/host-sweep.ts
