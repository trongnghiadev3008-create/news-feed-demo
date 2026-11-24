import { useEffect, useReducer, useRef, useState } from "react";
import { initialState } from "./data/demoData";
import {
  transition,
  writePath,
  fanoutPath,
  readPath,
} from "./engine/simulation";
import type { Action } from "./engine/simulation";
import type { Mode, NodeId } from "./types";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import { PhoneFeed } from "./components/PhoneFeed";
import { CacheInspector } from "./components/CacheInspector";
import { EventLog } from "./components/EventLog";
import { DemoControls } from "./components/DemoControls";
export default function App() {
  const [state, dispatch] = useReducer(transition, undefined, () =>
    initialState(),
  );
  const [content, setContent] = useState("Hello News Feed!");
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState(false);
  const generation = useRef(0);
  const locked = useRef(false);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const wait = (ms: number, token: number) =>
    new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(generation.current === token), ms),
    );
  function reset(mode: Mode = state.mode) {
    generation.current++;
    locked.current = false;
    setBusy(false);
    setAuto(false);
    dispatch({ type: "reset", mode });
    setContent(
      mode === "normal" ? "Hello News Feed!" : "Hello from Celebrity_X!",
    );
  }
  async function sequence(
    path: NodeId[],
    token: number,
    actions: Partial<Record<NodeId, Action>> = {},
  ) {
    for (const node of path) {
      if (generation.current !== token) return false;
      dispatch({ type: "activate", node });
      if (actions[node]) dispatch(actions[node]!);
      if (!(await wait(500, token))) return false;
    }
    return true;
  }
  async function write(token: number, postContent = content) {
    if (!(await sequence(writePath, token))) return false;
    dispatch({ type: "publish", content: postContent });
    dispatch({ type: "idle" });
    return true;
  }
  async function fanout(token: number) {
    if (state.mode === "celebrity") {
      if (!(await sequence(["fanout"], token))) return false;
    } else if (
      !(await sequence(fanoutPath, token, {
        graph: { type: "lookup" },
        recipient: { type: "filter" },
        queue: { type: "enqueue" },
        worker: { type: "process" },
        feed: { type: "cache" },
      }))
    )
      return false;
    dispatch({ type: "fanoutDone" });
    dispatch({ type: "idle" });
    return true;
  }
  async function read(token: number) {
    for (let i = 0; i < readPath.length; i++) {
      if (generation.current !== token) return false;
      const node = readPath[i];
      dispatch({ type: "activate", node });
      if (i === 2) dispatch({ type: "readIds" });
      if (i === 3) dispatch({ type: "hydrate" });
      if (!(await wait(500, token))) return false;
    }
    dispatch({ type: "render" });
    dispatch({ type: "idle" });
    return true;
  }
  async function manual(stage: "write" | "fanout" | "read") {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    const token = generation.current;
    await (stage === "write"
      ? write(token)
      : stage === "fanout"
        ? fanout(token)
        : read(token));
    if (token === generation.current) {
      locked.current = false;
      setBusy(false);
    }
  }
  async function autoDemo() {
    if (auto) {
      reset();
      return;
    }
    reset();
    const token = generation.current;
    locked.current = true;
    setAuto(true);
    setBusy(true);
    if (
      !(await wait(1200, token)) ||
      !(await write(
        token,
        state.mode === "normal"
          ? "Hello News Feed!"
          : "Hello from Celebrity_X!",
      )) ||
      !(await wait(1400, token)) ||
      !(await fanout(token)) ||
      !(await wait(1400, token)) ||
      !(await read(token))
    )
      return;
    if (token === generation.current) {
      locked.current = false;
      setAuto(false);
      setBusy(false);
    }
  }
  const currentStage = state.active
    ? ["alice", "postService", "storage"].includes(state.active)
      ? 0
      : ["fanout", "graph", "recipient", "queue", "worker"].includes(
            state.active,
          )
        ? 1
        : state.active === "feed" &&
            !state.hydration &&
            state.phase === "published"
          ? 1
          : 2
    : state.phase === "ready" || state.phase === "published"
      ? 0
      : state.phase === "fanned"
        ? 1
        : 2;
  return (
    <main>
      <header>
        <div className="title-block">
          <div className="eyebrow">NEWS FEED SYSTEM — INTERACTIVE DEMO</div>
          <h1>
            News Feed System <span>Interactive Architecture Demo</span>
          </h1>
        </div>
        <DemoControls
          mode={state.mode}
          busy={busy}
          auto={auto}
          onMode={reset}
          onReset={() => reset()}
          onAuto={autoDemo}
        />
      </header>
      <div className="stage-bar">
        {["Publishing", "Fanout", "Retrieval"].map((text, i) => (
          <div
            key={text}
            className={
              i === currentStage
                ? "current-stage"
                : i < currentStage
                  ? "complete-stage"
                  : ""
            }
            aria-current={i === currentStage ? "step" : undefined}
          >
            <span>{i + 1}</span>
            {text}
            <small>
              {i === 0
                ? "WRITE PATH"
                : i === 1
                  ? "FANOUT ON WRITE"
                  : "READ PATH"}
            </small>
          </div>
        ))}
        <div className="hybrid-badge" aria-label="Hybrid fanout strategy">
          {state.mode === "normal" && (
            <span>
              Normal User → <b>PUSH</b>
            </span>
          )}
          <span>
            Celebrity → <b>PULL</b>
          </span>
        </div>
      </div>
      <div className="workspace">
        <PhoneFeed
          side="alice"
          state={state}
          content={content}
          setContent={setContent}
          onAction={() => manual("write")}
          disabled={busy}
        />
        <div className="center">
          <ArchitectureDiagram
            state={state}
            busy={busy}
            onFanout={() => manual("fanout")}
          />
        </div>
        <PhoneFeed
          side="bob"
          state={state}
          content={content}
          setContent={setContent}
          onAction={() => manual("read")}
          disabled={busy}
        />
      </div>
      <div className="bottom-grid">
        <CacheInspector state={state} />
        <EventLog events={state.eventLog} />
      </div>
      <footer>
        <span>
          CHAPTER 11 <b>Design a News Feed System</b>
        </span>
        <div className="legend">
          <span>● Service</span>
          <span>● Cache</span>
          <span>● Fanout / worker</span>
          <span>● Queue</span>
          <span>● Database</span>
        </div>
        <span>Educational simulation · no backend</span>
      </footer>
    </main>
  );
}
