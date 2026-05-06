import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { api } from "../api/client";
import ArticleTOC from "../components/ArticleTOC";
import type { Article, ArticleSummary } from "../types";

function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

function groupByVolume(articles: Article[]): { volume: string; items: Article[] }[] {
  const map = new Map<string, Article[]>();
  for (const a of articles) {
    const vol = a.volume ?? "其他";
    if (!map.has(vol)) map.set(vol, []);
    map.get(vol)!.push(a);
  }
  return Array.from(map.entries()).map(([volume, items]) => ({ volume, items }));
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentArticleId = Number(id ?? "0") || 0;
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [tocList, setTocList] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    if (id) {
      api
        .article(Number(id))
        .then((item) => {
          setArticle(item);
          setError("");
        })
        .catch(() => setError("文章加载失败"))
        .finally(() => setLoading(false));
    } else {
      api
        .articles()
        .then((items) => {
          setArticles(items);
          setError("");
        })
        .catch(() => setError("文章列表加载失败"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      api.articleToc().then(setTocList);
    }
  }, [id]);

  function handleSelectArticle(nextId: number) {
    navigate(`/articles/${nextId}`);
  }

  const currentIndex = tocList.findIndex((a) => a.id === currentArticleId);
  const prevArticle = currentIndex > 0 ? tocList[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < tocList.length - 1
      ? tocList[currentIndex + 1]
      : null;

  if (id) {
    return (
      <div className="page-with-toc">
        <ArticleTOC currentArticleId={currentArticleId} onSelect={handleSelectArticle} />

        <div className="toc-page-main article-page-main">
          {loading && <div className="state-panel">正在读取文章档案...</div>}
          {error && <div className="state-panel error-state">{error}</div>}

          {!loading && !error && (
            <article className="panel article-detail">
              <div className="eyebrow">文章</div>
              <h1>{article?.title ?? "加载中"}</h1>
              <div className="article-detail-meta">
                {article?.volume && (
                  <span className="article-meta-chip">{article.volume}</span>
                )}
                {article?.period && (
                  <span className="article-meta-chip">{article.period}</span>
                )}
                {article?.date_text && (
                  <span className="article-meta-date">{article.date_text}</span>
                )}
              </div>
              <div className="article-body">
                <ReactMarkdown>{article?.content ?? ""}</ReactMarkdown>
              </div>
              {(prevArticle || nextArticle) && (
                <nav className="article-nav">
                  <div>
                    {prevArticle && (
                      <button
                        type="button"
                        className="article-nav-btn"
                        onClick={() => navigate(`/articles/${prevArticle.id}`)}
                      >
                        <span className="article-nav-label">← 上一篇</span>
                        <span className="article-nav-title">{prevArticle.title}</span>
                      </button>
                    )}
                  </div>
                  <div>
                    {nextArticle && (
                      <button
                        type="button"
                        className="article-nav-btn article-nav-btn--next"
                        onClick={() => navigate(`/articles/${nextArticle.id}`)}
                      >
                        <span className="article-nav-label">下一篇 →</span>
                        <span className="article-nav-title">{nextArticle.title}</span>
                      </button>
                    )}
                  </div>
                </nav>
              )}
            </article>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-inner">
        <div className="state-panel">正在读取文章档案...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-inner">
        <div className="state-panel error-state">{error}</div>
      </div>
    );
  }

  const groups = groupByVolume(articles);

  return (
    <div className="page-with-toc">
      <ArticleTOC currentArticleId={currentArticleId} onSelect={handleSelectArticle} />

      <div className="toc-page-main article-page-main">
        <section className="page-title">
          <div>
            <div className="eyebrow">文章列表</div>
            <h1>文章</h1>
            <div className="muted">按篇目浏览原文与时间信息</div>
          </div>
          <div className="metric-card">
            <strong>{articles.length}</strong>
            <span>篇</span>
          </div>
        </section>
        {groups.map(({ volume, items }) => (
          <section key={volume} className="article-volume-group">
            <div className="article-volume-header">{volume}</div>
            <div className="stack">
              {items.map((item, idx) => (
                <Link
                  className="item-card article-list-card"
                  to={`/articles/${item.id}`}
                  key={item.id}
                >
                  <div className="article-list-card-head">
                    <h3>{item.title}</h3>
                    <span className="article-list-num">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p>{stripMarkdown(item.content).slice(0, 120)}…</p>
                  <div className="meta">
                    {item.period ?? ""}
                    {item.date_text ? ` · ${item.date_text}` : ""}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {articles.length === 0 && (
          <div className="state-panel">暂无文章数据</div>
        )}
      </div>
    </div>
  );
}
