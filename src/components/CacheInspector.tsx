import type { SimulationState } from "../types";
export function CacheInspector({ state }: { state: SimulationState }) {
  const post = state.postCache.post_101;
  const task = state.messageQueue[0];
  return (
    <section className="inspector panel" aria-label="Internal simulation state">
      <h2>Internal State</h2>
      <div className="state-cards">
        <article className="state-card post-state">
          <h3>POST CACHE</h3>
          {post ? (
            <>
              <code>post_101</code>
              <b>{post.authorName}</b>
              <p>{JSON.stringify(post.content)}</p>
            </>
          ) : (
            <p>No post stored</p>
          )}
        </article>
        <article className="state-card feed-state">
          <h3>NEWS FEED CACHE</h3>
          <b>Bob</b>
          <code>{JSON.stringify(state.newsFeedCache.user_B)}</code>
        </article>
        <article className={`state-card queue-state ${task ? "has-task" : ""}`}>
          <h3>MESSAGE QUEUE</h3>
          {task ? (
            <>
              <b>Queued task</b>
              <code>
                {task.postId}
                <br />
                {task.targetUserId}
              </code>
            </>
          ) : (
            <p>Queue Empty</p>
          )}
        </article>
      </div>
    </section>
  );
}
