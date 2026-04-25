import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { api } from "../api/client";
import ArticleTOC from "../components/ArticleTOC";
import type { Article } from "../types";

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentArticleId = Number(id ?? "0") || 0;
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
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

  function handleSelectArticle(nextId: number) {
    navigate(`/articles/${nextId}`);
  }

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
              <div className="meta">
                {article?.volume}
                {article?.period ? ` · ${article.period}` : ""}
                {article?.date_text ? ` · ${article.date_text}` : ""}
              </div>
              <div className="article-body">
                <ReactMarkdown>{article?.content ?? ""}</ReactMarkdown>
              </div>
            </article>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="page-inner"><div className="state-panel">正在读取文章档案...</div></div>;
  }

  if (error) {
    return <div className="page-inner"><div className="state-panel error-state">{error}</div></div>;
  }

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
        <section className="stack">
          {articles.map((item) => (
            <Link className="item-card" to={`/articles/${item.id}`} key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.content.replace(/^>\s*/gm, "").replace(/#+\s*/g, "").slice(0, 120)}…</p>
              <div className="meta">
                {item.volume}
                {item.period ? ` · ${item.period}` : ""}
                {item.date_text ? ` · ${item.date_text}` : ""}
              </div>
            </Link>
          ))}
        </section>
        {articles.length === 0 && <div className="state-panel">暂无文章数据</div>}
        </div>
    </div>
  );
}
