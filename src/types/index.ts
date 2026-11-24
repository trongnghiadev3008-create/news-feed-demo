export type Mode = "normal" | "celebrity";
export type NodeId =
  | "alice"
  | "web"
  | "postService"
  | "storage"
  | "fanout"
  | "graph"
  | "recipient"
  | "queue"
  | "worker"
  | "feed"
  | "feedService"
  | "post"
  | "profile"
  | "cdn"
  | "bob";
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
}
export interface User {
  id: string;
  name: string;
  followers: string[];
  following: string[];
}
export interface Task {
  postId: string;
  targetUserId: string;
}
export interface Log {
  category: string;
  message: string;
}
export interface SimulationState {
  mode: Mode;
  posts: Record<string, Post>;
  users: Record<string, User>;
  socialGraph: Record<string, string[]>;
  messageQueue: Task[];
  newsFeedCache: Record<string, string[]>;
  postCache: Record<string, Post>;
  userCache: Record<string, { name: string }>;
  eventLog: Log[];
  phase: "ready" | "published" | "fanned" | "read";
  active: NodeId | null;
  visited: NodeId[];
  returnedIds: string[];
  renderedPosts: Post[];
  hydration: boolean;
  followerIds: string[];
  recipientIds: string[];
}
