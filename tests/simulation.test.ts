import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/data/demoData.ts";
import { transition } from "../src/engine/simulation.ts";
test("manual publishing, queue, fanout and hydration keep IDs separate from objects", () => {
  let s = transition(initialState(), {
    type: "publish",
    content: "Hello News Feed!",
  });
  assert.equal(s.posts.post_101.content, "Hello News Feed!");
  assert.deepEqual(s.newsFeedCache.user_B, []);
  assert.deepEqual(s.renderedPosts, []);
  s = transition(s, { type: "lookup" });
  assert.deepEqual(s.followerIds, ["user_B"]);
  s = transition(s, { type: "filter" });
  s = transition(s, { type: "enqueue" });
  assert.deepEqual(s.messageQueue, [
    { postId: "post_101", targetUserId: "user_B" },
  ]);
  s = transition(s, { type: "process" });
  s = transition(s, { type: "cache" });
  s = transition(s, { type: "fanoutDone" });
  assert.deepEqual(s.newsFeedCache.user_B, ["post_101"]);
  assert.equal(typeof s.newsFeedCache.user_B[0], "string");
  assert.equal(s.messageQueue.length, 0);
  assert.equal(s.renderedPosts.length, 0);
  s = transition(s, { type: "readIds" });
  s = transition(s, { type: "hydrate" });
  s = transition(s, { type: "render" });
  assert.equal(s.renderedPosts[0].content, "Hello News Feed!");
  assert.equal(s.userCache[s.renderedPosts[0].authorId].name, "Alice");
  assert.equal(s.phase, "read");
  assert.equal(s.eventLog.length, 8);
  assert.deepEqual(
    s.eventLog.map((event) => event.category),
    [
      "POST",
      "GRAPH",
      "QUEUE",
      "WORKER",
      "CACHE",
      "READ",
      "HYDRATE",
      "RESPONSE",
    ],
  );
  assert.equal(s.postCache.post_101.authorName, "Alice");
  s = transition(s, { type: "reset", mode: "normal" });
  assert.deepEqual(s, initialState());
});
test("recipient filtering and celebrity reads honor the stored graph and following list", () => {
  let s = transition(initialState(), {
    type: "publish",
    content: "Graph test",
  });
  s = { ...s, socialGraph: { ...s.socialGraph, user_A: ["missing_user"] } };
  s = transition(
    transition(transition(s, { type: "lookup" }), { type: "filter" }),
    { type: "enqueue" },
  );
  assert.deepEqual(s.followerIds, ["missing_user"]);
  assert.deepEqual(s.messageQueue, []);
  s = transition(s, { type: "cache" });
  assert.deepEqual(s.newsFeedCache.user_B, []);
  let celebrity = transition(initialState("celebrity"), {
    type: "publish",
    content: "Follow check",
  });
  celebrity = {
    ...celebrity,
    users: {
      ...celebrity.users,
      user_B: { ...celebrity.users.user_B, following: [] },
    },
  };
  celebrity = transition(transition(celebrity, { type: "hydrate" }), {
    type: "render",
  });
  assert.deepEqual(celebrity.renderedPosts, []);
});
test("celebrity pull merges on read while feed cache stays empty", () => {
  let s = transition(initialState("celebrity"), {
    type: "publish",
    content: "Celebrity post",
  });
  s = transition(s, { type: "fanoutDone" });
  assert.deepEqual(s.newsFeedCache.user_B, []);
  assert.deepEqual(s.messageQueue, []);
  s = transition(s, { type: "readIds" });
  assert.deepEqual(s.returnedIds, []);
  s = transition(s, { type: "hydrate" });
  s = transition(s, { type: "render" });
  assert.equal(s.renderedPosts[0].authorId, "celebrity_X");
  assert.deepEqual(s.newsFeedCache.user_B, []);
});
