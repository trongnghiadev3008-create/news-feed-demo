import type { Mode, SimulationState } from "../types/index.ts";
export function initialState(mode: Mode = "normal"): SimulationState {
  return {
    mode,
    posts: {},
    users: {
      user_A: {
        id: "user_A",
        name: "Alice",
        followers: ["user_B"],
        following: [],
      },
      user_B: {
        id: "user_B",
        name: "Bob",
        followers: [],
        following: ["user_A", "celebrity_X"],
      },
      celebrity_X: {
        id: "celebrity_X",
        name: "Celebrity_X",
        followers: ["user_B"],
        following: [],
      },
    },
    socialGraph: { user_A: ["user_B"], celebrity_X: ["user_B"] },
    messageQueue: [],
    newsFeedCache: { user_B: [] },
    postCache: {},
    userCache: {
      user_A: { name: "Alice" },
      user_B: { name: "Bob" },
      celebrity_X: { name: "Celebrity_X" },
    },
    eventLog: [],
    phase: "ready",
    active: null,
    visited: [],
    returnedIds: [],
    renderedPosts: [],
    hydration: false,
    followerIds: [],
    recipientIds: [],
  };
}
