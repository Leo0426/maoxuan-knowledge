import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import type { SearchResults } from "../types";
import { typeLabel } from "../utils/labels";

const recommendations = ["持久战", "实践", "农民", "红色政权"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      setResults(await api.search(q));
      setError("");
    } catch {
      setError("搜索失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-inner">
      <section className="page-title">
        <div>
          <div className="eyebrow">检索</div>
          <h1>搜索</h1>
          <div className="muted">文章、事件、思想与实体</div>
        </div>
      </section>
      <form className="search-row" onSubmit={handleSearch}>
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="输入关键词" />
        <button type="submit">搜索</button>
      </form>
      {loading && <div className="state-panel">正在检索档案...</div>}
      {error && <div className="state-panel error-state">{error}</div>}
      {!loading && !results ? (
        <div className="tag-row">
          {recommendations.map((item) => (
            <button
              className="tag"
              key={item}
              onClick={() => {
                setQ(item);
                api.search(item).then(setResults);
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {!loading && results ? (
        <section className="stack">
          <ResultGroup title="文章" items={results.articles.map((item) => ({ label: item.title, meta: item.date_text ?? "", to: `/articles/${item.id}` }))} />
          <ResultGroup title="事件" items={results.events.map((item) => ({ label: item.title, meta: item.location ?? item.date_text ?? "", to: `/timeline?eventId=${item.id}` }))} />
          <ResultGroup title="思想" items={results.ideas.map((item) => ({ label: item.name, meta: item.category ?? "", to: `/graph?node=idea:${item.id}` }))} />
          <ResultGroup
            title="实体"
            items={results.entities.map((item) => ({
              label: item.name,
              meta: typeLabel(item.type),
              to: item.type === "place" ? `/map?location=${encodeURIComponent(item.name)}` : `/graph?node=entity:${item.id}`,
            }))}
          />
        </section>
      ) : null}
    </div>
  );
}

function ResultGroup({ title, items }: { title: string; items: { label: string; meta: string; to: string }[] }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <div className="stack">
        {items.length === 0 ? (
          <div className="muted">暂无结果</div>
        ) : (
          items.map((item) => (
            <Link className="result-link" key={`${title}-${item.label}`} to={item.to}>
              <span>{item.label}</span>
              {item.meta && <small>{item.meta}</small>}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
