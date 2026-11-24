import { initialState } from "../data/demoData.ts";
import type { Mode, NodeId, SimulationState } from "../types/index.ts";
export type Action =
  | { type: "reset"; mode: Mode }
  | { type: "activate"; node: NodeId }
  | { type: "publish"; content: string }
  | { type: "lookup" }
  | { type: "filter" }
  | { type: "enqueue" }
  | { type: "process" }
  | { type: "cache" }
  | { type: "fanoutDone" }
  | { type: "readIds" }
  | { type: "hydrate" }
  | { type: "render" }
  | { type: "idle" };
export function transition(
  state: SimulationState,
  action: Action,
): SimulationState {
  const log = (category: string, message: string) => [
    ...state.eventLog,
    { category, message },
  ];
  const id = "post_101";
  switch (action.type) {
    case "reset":
      return initialState(action.mode);
    case "activate":
      return {
        ...state,
        active: action.node,
        visited: [...state.visited, action.node],
      };
    case "idle":
      return { ...state, active: null };
    case "publish": {
      if (state.phase !== "ready") return state;
      const post = {
        id,
        authorId: state.mode === "normal" ? "user_A" : "celebrity_X",
        authorName: state.mode === "normal" ? "Alice" : "Celebrity_X",
        content: action.content.trim() || "Hello News Feed!",
      };
      return {
        ...state,
        posts: { [id]: post },
        postCache: { [id]: post },
        phase: "published",
        eventLog: [
          ...state.eventLog,
          {
            category: "POST",
            message: "Created post_101 · full post saved in Post Cache",
          },
        ],
      };
    }
    case "lookup":
      return {
        ...state,
        followerIds: [...(state.socialGraph[state.posts[id].authorId] ?? [])],
        eventLog: log(
          "GRAPH",
          `followers(${state.posts[id].authorName}) → [${(state.socialGraph[state.posts[id].authorId] ?? []).map((userId) => state.userCache[userId]?.name ?? userId).join(", ")}]`,
        ),
      };
    case "filter":
      return {
        ...state,
        recipientIds: state.followerIds.filter((userId) =>
          Boolean(state.userCache[userId]),
        ),
      };
    case "enqueue":
      return {
        ...state,
        messageQueue: state.recipientIds.map((targetUserId) => ({
          postId: id,
          targetUserId,
        })),
        eventLog: log("QUEUE", "Fanout task queued"),
      };
    case "process":
      return { ...state, eventLog: log("WORKER", "Processing task") };
    // Feed entries are references, never duplicated post objects.
    case "cache": {
      const newsFeedCache = { ...state.newsFeedCache };
      for (const task of state.messageQueue) {
        newsFeedCache[task.targetUserId] = [
          ...new Set([
            task.postId,
            ...(newsFeedCache[task.targetUserId] ?? []),
          ]),
        ];
      }
      return {
        ...state,
        messageQueue: [],
        newsFeedCache,
        eventLog: log(
          "CACHE",
          `Bob feed → ${JSON.stringify(newsFeedCache.user_B)}`,
        ),
      };
    }
    case "fanoutDone":
      return {
        ...state,
        phase: "fanned",
        eventLog:
          state.mode === "celebrity"
            ? log("FANOUT", "PULL: skipped per-follower writes")
            : state.eventLog,
      };
    case "readIds":
      return {
        ...state,
        returnedIds: [...state.newsFeedCache.user_B],
        eventLog: log(
          "READ",
          `Retrieved ${JSON.stringify(state.newsFeedCache.user_B)} from Feed Cache`,
        ),
      };
    // Celebrity posts are merged on retrieval instead of written to every follower.
    case "hydrate":
      return {
        ...state,
        hydration: true,
        returnedIds:
          state.mode === "celebrity"
            ? [
                ...new Set([
                  ...state.returnedIds,
                  ...Object.values(state.posts)
                    .filter((post) =>
                      state.users.user_B.following.includes(post.authorId),
                    )
                    .map((post) => post.id),
                ]),
              ]
            : state.returnedIds,
        eventLog: [
          ...state.eventLog,
          ...(state.mode === "celebrity"
            ? [
                {
                  category: "READ",
                  message: "Merge celebrity post on read",
                },
              ]
            : []),
          {
            category: "HYDRATE",
            message: "Loaded User + Post data",
          },
        ],
      };
    case "render":
      return {
        ...state,
        phase: "read",
        renderedPosts: state.returnedIds.map((key) => state.postCache[key]),
        eventLog: log("RESPONSE", "Rendered Bob's feed"),
      };
  }
}
export const writePath: NodeId[] = ["alice", "postService", "storage"];
export const fanoutPath: NodeId[] = [
  "fanout",
  "graph",
  "recipient",
  "queue",
  "worker",
  "feed",
];
export const readPath: NodeId[] = [
  "bob",
  "feedService",
  "feed",
  "feedService",
  "post",
  "profile",
];
