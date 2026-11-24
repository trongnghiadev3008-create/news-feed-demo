import { useEffect, useRef } from "react";
import type { Log } from "../types";
// Presentation copy stays separate from the unchanged simulation event data.
function displayMessage(event: Log) {
  switch (event.category) {
    case "POST":
      return "Created post_101";
    case "QUEUE":
      return "Task queued";
    case "WORKER":
      return "Task processed";
    case "CACHE":
      return event.message.replace("Bob feed", "Bob");
    case "READ":
      return event.message.startsWith("Retrieved")
        ? "Retrieved IDs"
        : event.message;
    case "HYDRATE":
      return "Loaded post + user";
    case "RESPONSE":
      return "Feed rendered";
    default:
      return event.message;
  }
}
export function EventLog({ events }: { events: Log[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [events]);
  return (
    <section className="event-log">
      <div className="log-heading">
        <span>Event Log</span>
        <span>{String(events.length).padStart(2, "0")} EVENTS</span>
      </div>
      <div className="log-lines" ref={ref} role="log" aria-live="polite">
        {events.length ? (
          events.map((e, i) => (
            <div key={i}>
              <span className="log-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b className={`log-${e.category.split(" ")[0].toLowerCase()}`}>
                {e.category}
              </b>
              <span>{displayMessage(e)}</span>
            </div>
          ))
        ) : (
          <div className="log-placeholder">
            System ready. Create a post to begin the trace.
          </div>
        )}
      </div>
    </section>
  );
}
