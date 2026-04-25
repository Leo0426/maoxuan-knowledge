import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import ArticleTOC from "../components/ArticleTOC";
import MapView from "../components/MapView";
import type { MapLocation } from "../types";

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = Number(searchParams.get("articleId") ?? "0");

  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const [startDate, setStartDate] = useState(searchParams.get("start_date") ?? "");
  const [endDate, setEndDate] = useState(searchParams.get("end_date") ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .map(articleId, startDate || undefined, endDate || undefined)
      .then((items) => {
        setLocations(items);
        const target = searchParams.get("location");
        setSelected(items.find((l) => l.name === target) ?? items[0] ?? null);
        setError("");
      })
      .catch(() => setError("地图数据加载失败"))
      .finally(() => setLoading(false));
  }, [articleId, startDate, endDate]);

  const eventCount = useMemo(
    () => locations.reduce((total, l) => total + l.event_count, 0),
    [locations],
  );

  function handleSelectArticle(id: number) {
    setSearchParams({ articleId: String(id) }, { replace: true });
  }

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    const params: Record<string, string> = { articleId: String(articleId) };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (selected) params.location = selected.name;
    setSearchParams(params);
  }

  function handleSelect(location: MapLocation) {
    setSelected(location);
    const params = new URLSearchParams(searchParams);
    params.set("location", location.name);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="page-with-toc">
      <ArticleTOC currentArticleId={articleId} onSelect={handleSelectArticle} />

      <div className="toc-page-main map-page-main">
        <section className="page-title map-page-title">
          <div className="map-heading-row">
            <div>
              <div className="eyebrow">地理档案</div>
              <h1>地图</h1>
              <div className="muted">按地点查看事件分布和时间线索</div>
            </div>
            <form className="filter-row compact-filter" onSubmit={handleFilter}>
              <label>
                起始
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                结束
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              <button type="submit">筛选</button>
            </form>
          </div>
          <div className="metric-card compact-metric">
            <strong>{locations.length}</strong>
            <span>地点 · {eventCount} 事件</span>
          </div>
        </section>

        {loading && <div className="state-panel">正在加载地图数据...</div>}
        {error && <div className="state-panel error-state">{error}</div>}

        {!loading && !error && locations.length === 0 && (
          <div className="state-panel">本文暂无地理位置数据，请从左侧目录选择其他文章</div>
        )}

        {!loading && !error && locations.length > 0 && (
          <section className="layout-two">
            <MapView
              locations={locations}
              selectedLocationName={selected?.name}
              onSelect={handleSelect}
            />
            <LocationPanel location={selected} articleId={articleId} />
          </section>
        )}
      </div>
    </div>
  );
}

function LocationPanel({
  location,
  articleId,
}: {
  location: MapLocation | null;
  articleId: number;
}) {
  if (!location) {
    return <aside className="panel muted">请选择一个地点</aside>;
  }

  return (
    <aside className="panel map-detail-panel">
      <h2>{location.name}</h2>
      <div className="meta">
        {location.province} · {location.longitude.toFixed(2)}, {location.latitude.toFixed(2)} ·{" "}
        {location.event_count} 个事件
      </div>
      <div className="stack event-list">
        {location.events.map((event) => (
          <article className="item-card" key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <div className="meta">
              {event.date_text ?? event.start_date} · 重要度 {event.importance}
            </div>
            {event.quote && <blockquote>{event.quote}</blockquote>}
            <Link className="action-link" to={`/timeline?articleId=${articleId}&eventId=${event.id}`}>
              在时间线中查看
            </Link>
          </article>
        ))}
      </div>
    </aside>
  );
}
