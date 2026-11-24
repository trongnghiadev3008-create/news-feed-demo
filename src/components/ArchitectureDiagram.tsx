import type { NodeId, SimulationState } from "../types";

export function ArchitectureDiagram({
  state,
  busy,
  onFanout,
}: {
  state: SimulationState;
  busy: boolean;
  onFanout: () => void;
}) {
  const author = state.mode === "normal" ? "Alice" : "Celebrity_X";
  const node = (id: NodeId, title: string, kind: string, detail?: string) => (
    <div
      data-node={id}
      className={`system-node ${kind} ${state.active === id ? "active-node" : ""}`}
    >
      <strong>{title}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
  const arrow = (
    <span className="connector" aria-hidden="true">
      →
    </span>
  );
  return (
    <section
      className="architecture panel"
      aria-label="News Feed System architecture"
    >
      <section className="flow-lane write-lane" aria-label="Publishing flow">
        <h2>PUBLISH</h2>
        <div className="flow-row">
          {node("postService", "Post Service", "service")}
          {arrow}
          {node("storage", "Post Cache", "cache", "Full post object")}
        </div>
      </section>
      <section className="flow-lane distribution" aria-label="Fanout flow">
        <div className="lane-heading">
          <h2>FANOUT</h2>
          <button
            className="fanout-button"
            onClick={onFanout}
            disabled={busy || state.phase !== "published"}
          >
            2. Run Fanout
          </button>
        </div>
        <div className="flow-row fanout-row">
          {node(
            "fanout",
            "Fanout Service",
            "worker",
            state.mode === "celebrity" ? "Skip push" : "Push IDs",
          )}
          {arrow}
          {node(
            "graph",
            "Graph DB",
            "database",
            state.visited.includes("graph")
              ? "followers(Alice) → [Bob]"
              : "Followers",
          )}
          {arrow}
          {node("recipient", "User Cache", "cache", "Filter privacy / mute / visibility")}
          {arrow}
          {node(
            "queue",
            "Message Queue",
            "queue",
            state.messageQueue.length ? "Task queued" : "Queue Empty",
          )}
          {arrow}
          {node("worker", "Fanout Worker", "worker")}
          {arrow}
          {node(
            "feed",
            "News Feed Cache",
            "cache",
            JSON.stringify(state.newsFeedCache.user_B),
          )}
        </div>
      </section>
      <section className="flow-lane read-lane" aria-label="Retrieval flow">
        <h2>RETRIEVAL</h2>
        <div className="flow-row retrieval-row">
          {node(
            "feedService",
            "News Feed Service",
            "service",
            state.mode === "celebrity" && state.hydration
              ? "Merge celebrity post on read"
              : state.returnedIds.length
                ? `Read ${JSON.stringify(state.returnedIds)}`
                : "Read post IDs",
          )}
          {arrow}
          {node(
            "feed",
            "News Feed Cache",
            "cache",
            JSON.stringify(state.newsFeedCache.user_B),
          )}
          {arrow}
          <div
            data-node="hydration"
            className={`hydration-card cache ${state.active === "post" || state.active === "profile" ? "active-node" : ""} ${state.hydration ? "hydrated" : ""}`}
          >
            <strong>HYDRATION</strong>
            <div className="hydration-equation">
              <code>post_101</code>
              <span> + </span>
              <span
                data-node="profile"
                className={state.active === "profile" ? "active-source" : ""}
              >
                {author} profile
              </span>
              <span> + </span>
              <span
                data-node="post"
                className={state.active === "post" ? "active-source" : ""}
              >
                post content
              </span>
              <span> → </span>
              <b>Feed Item</b>
            </div>
            <small>Post Cache + User Cache</small>
          </div>
        </div>
      </section>
      <div className="diagram-footer">
        <b>Feed Cache stores IDs, not full posts.</b>
      </div>
    </section>
  );
}
