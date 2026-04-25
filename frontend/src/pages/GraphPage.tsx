import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import ArticleTOC from "../components/ArticleTOC";
import GraphView from "../components/GraphView";
import type { GraphEdge, GraphNode } from "../types";
import { relationLabel, typeLabel } from "../utils/labels";

export default function GraphPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const articleId = Number(searchParams.get("articleId") ?? "0");

  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({
    nodes: [],
    edges: [],
  });
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .graph(articleId)
      .then((data) => {
        setGraph(data);
        const target = searchParams.get("node");
        setSelected(data.nodes.find((n) => n.id === target) ?? data.nodes[0] ?? null);
        setError("");
      })
      .catch(() => setError("知识图谱加载失败"))
      .finally(() => setLoading(false));
  }, [articleId]);

  function handleSelectArticle(id: number) {
    setSearchParams({ articleId: String(id) }, { replace: true });
  }

  function handleSelectNode(node: GraphNode) {
    setSelected(node);
    setSearchParams({ articleId: String(articleId), node: node.id }, { replace: true });
  }

  const relatedEdges = selected
    ? graph.edges.filter((e) => e.source === selected.id || e.target === selected.id)
    : [];

  const relatedNodes = selected
    ? relatedEdges
        .map((e) => (e.source === selected.id ? e.target : e.source))
        .map((id) => graph.nodes.find((n) => n.id === id))
        .filter(Boolean) as GraphNode[]
    : [];

  return (
    <div className="page-with-toc">
      <ArticleTOC currentArticleId={articleId} onSelect={handleSelectArticle} />

      <div className="toc-page-main">
        <section className="page-title">
          <div>
            <div className="eyebrow">知识图谱</div>
            <h1>知识图谱</h1>
            <div className="muted">实体、事件、思想与文章的关系网络</div>
          </div>
          <div className="metric-card">
            <strong>{graph.nodes.length}</strong>
            <span>节点 · {graph.edges.length} 关系</span>
          </div>
        </section>

        {loading && <div className="state-panel">正在生成知识图谱...</div>}
        {error && <div className="state-panel error-state">{error}</div>}

        {!loading && !error && graph.nodes.length === 0 && (
          <div className="state-panel">本文暂无知识图谱数据，请从左侧目录选择其他文章</div>
        )}

        {!loading && !error && graph.nodes.length > 0 && (
          <section className="layout-two">
            <GraphView
              graph={graph}
              selectedNodeId={selected?.id}
              onSelect={handleSelectNode}
            />
            <aside className="panel">
              {selected ? (
                <>
                  <h2>{selected.name}</h2>
                  <div className="meta">{typeLabel(selected.type)}</div>
                  {relatedEdges.length > 0 && (
                    <div className="stack graph-relations-stack">
                      <div className="eyebrow graph-relations-label">
                        关联关系 ({relatedEdges.length})
                      </div>
                      {relatedEdges.map((edge, i) => {
                        const other = relatedNodes[i];
                        const isSource = edge.source === selected.id;
                        return (
                          <div key={i} className="graph-relation-item">
                            <span className="tag">{relationLabel(edge.relation_type)}</span>
                            <span className="graph-rel-arrow">{isSource ? "→" : "←"}</span>
                            <button
                              type="button"
                              className="graph-rel-node"
                              onClick={() => other && handleSelectNode(other)}
                            >
                              {other?.name ?? "未知"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {selected.type === "article" && (
                    <div className="graph-node-action">
                      <Link
                        className="action-link"
                        to={`/articles/${selected.raw_id}`}
                      >
                        查看原文
                      </Link>
                    </div>
                  )}
                  {selected.type === "event" && (
                    <div className="graph-node-action">
                      <Link
                        className="action-link"
                        to={`/timeline?articleId=${articleId}&eventId=${selected.raw_id}`}
                      >
                        在时间线中查看
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="muted">请选择图谱节点</div>
              )}
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}
