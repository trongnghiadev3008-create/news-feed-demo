import type { SimulationState } from "../types";
export function PhoneFeed({
  side,
  state,
  content,
  setContent,
  onAction,
  disabled,
}: {
  side: "alice" | "bob";
  state: SimulationState;
  content: string;
  setContent: (v: string) => void;
  onAction: () => void;
  disabled: boolean;
}) {
  const publisher = side === "alice";
  const name = state.mode === "normal" ? "Alice" : "Celebrity_X";
  return (
    <section
      className={`phone ${publisher ? "publisher" : "reader"} ${state.active === side ? "phone-active" : ""}`}
      aria-label={publisher ? "Publisher" : "Bob feed"}
    >
      <h2>{publisher ? name : "Bob's News Feed"}</h2>
      {publisher ? (
        <div className="phone-body">
          <label className="sr-only" htmlFor="post-content">
            Write a post
          </label>
          <textarea
            id="post-content"
            value={content}
            disabled={disabled || state.phase !== "ready"}
            onChange={(e) => setContent(e.target.value)}
            maxLength={120}
          />
          <button
            className="primary"
            disabled={disabled || state.phase !== "ready"}
            onClick={onAction}
          >
            1. Create Post
          </button>
          <p className="phone-note" role="status">
            {state.phase === "ready"
              ? "Ready to publish."
              : "post_101 saved in Post Cache."}
          </p>
        </div>
      ) : (
        <div className="phone-body">
          <div className="feed-content">
            {state.renderedPosts.length ? (
              state.renderedPosts.map((post) => (
                <article className="post-card" key={post.id}>
                  <strong>{state.userCache[post.authorId].name}</strong>
                  <p>{post.content}</p>
                  <small>
                    Loaded from:
                    <br />
                    {state.mode === "celebrity" ? "Celebrity merge" : "News Feed Cache"} → Hydration
                    <br />
                    (Post Cache + User Cache)
                  </small>
                </article>
              ))
            ) : (
              <div className="empty-feed">
                <b>No posts yet</b>
              </div>
            )}
          </div>
          <button
            className="primary read-button"
            disabled={disabled || !["fanned", "read"].includes(state.phase)}
            onClick={onAction}
          >
            3. Refresh Feed
          </button>
        </div>
      )}
    </section>
  );
}
