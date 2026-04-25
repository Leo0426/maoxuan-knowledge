import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import ArticleTOC from "../components/ArticleTOC";
import EventDetailPanel from "../components/EventDetailPanel";
import TimelineChart from "../components/TimelineChart";
import type { Event } from "../types";

export default function TimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = Number(searchParams.get("articleId") ?? "0");

  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .timeline(articleId)
      .then((items) => {
        setEvents(items);
        const eventId = Number(searchParams.get("eventId"));
        setSelected(items.find((e) => e.id === eventId) ?? items[0] ?? null);
        setError("");
      })
      .catch(() => setError("时间线数据加载失败"))
      .finally(() => setLoading(false));
  }, [articleId]);

  function handleSelectArticle(id: number) {
    setSearchParams({ articleId: String(id) }, { replace: true });
  }

  function handleSelectEvent(event: Event) {
    setSelected(event);
    setSearchParams(
      { articleId: String(articleId), eventId: String(event.id) },
      { replace: true },
    );
  }

  return (
    <div className="page-with-toc">
      <ArticleTOC currentArticleId={articleId} onSelect={handleSelectArticle} />

      <div className="toc-page-main">
        <section className="page-title">
          <div>
            <div className="eyebrow">时间线</div>
            <h1>时间线</h1>
            <div className="muted">按时间浏览关键事件与原文片段</div>
          </div>
          <div className="metric-card">
            <strong>{events.length}</strong>
            <span>个事件</span>
          </div>
        </section>

        {loading && <div className="state-panel">正在整理时间线档案...</div>}
        {error && <div className="state-panel error-state">{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className="state-panel">本文暂无事件数据，请从左侧目录选择其他文章</div>
        )}

        {!loading && !error && events.length > 0 && (
          <>
            <section className="layout-two">
              <div className="stack">
                <TimelineChart
                  events={events}
                  selectedEventId={selected?.id}
                  onSelect={handleSelectEvent}
                />
                <div className="panel event-strip">
                  <div className="event-strip-header">
                    <span>事件索引</span>
                    <strong>{events.length}</strong>
                  </div>
                  {events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className={event.id === selected?.id ? "event-row active" : "event-row"}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <span className="event-row-date">{event.date_text ?? event.start_date ?? "未标注"}</span>
                      <span className="event-row-title">{event.title}</span>
                      <span className="event-row-score">重要度 {event.importance}</span>
                    </button>
                  ))}
                </div>
              </div>
              <EventDetailPanel event={selected} />
            </section>
            <div className="below-actions">
              <Link to={`/map?articleId=${articleId}`} className="action-link">
                转到地图视图
              </Link>
              <Link to="/search" className="action-link">
                全局搜索
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
