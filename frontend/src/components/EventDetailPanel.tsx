import type { Event } from "../types";
import { Link } from "react-router-dom";

export default function EventDetailPanel({ event }: { event: Event | null }) {
  if (!event) {
    return <aside className="panel muted">请选择一个事件</aside>;
  }

  return (
    <aside className="panel">
      <h2>{event.title}</h2>
      <div className="meta">
        {event.date_text} · {event.location ?? "地点未标注"}
      </div>
      <p>{event.description}</p>
      {event.quote && (
        <blockquote>
          <p>{event.quote}</p>
        </blockquote>
      )}
      <div className="detail-actions">
        <div className="tag">重要度 {event.importance}</div>
        {event.location && (
          <Link className="action-link" to={`/map?location=${encodeURIComponent(event.location)}`}>
            定位地点
          </Link>
        )}
        <Link className="action-link" to={`/articles/${event.article_id}`}>
          查看文章
        </Link>
      </div>
    </aside>
  );
}
