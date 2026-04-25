import { useEffect, useRef, useState } from "react";

import { api } from "../api/client";
import type { ArticleSummary } from "../types";

interface Props {
  currentArticleId: number;
  onSelect: (id: number) => void;
}

interface VolumeGroup {
  volume: string;
  periods: PeriodGroup[];
}

interface PeriodGroup {
  period: string;
  articles: ArticleSummary[];
}

const DEFAULT_PERIOD = "其他时期";

function periodForArticle(article: ArticleSummary): string {
  return article.period ?? DEFAULT_PERIOD;
}

function groupByVolume(articles: ArticleSummary[]): VolumeGroup[] {
  const volumeMap = new Map<string, Map<string, ArticleSummary[]>>();
  for (const a of articles) {
    const vol = a.volume ?? "其他";
    const period = periodForArticle(a);
    if (!volumeMap.has(vol)) volumeMap.set(vol, new Map());
    const periodMap = volumeMap.get(vol)!;
    if (!periodMap.has(period)) periodMap.set(period, []);
    periodMap.get(period)!.push(a);
  }
  return Array.from(volumeMap.entries()).map(([volume, periodMap]) => ({
    volume,
    periods: Array.from(periodMap.entries()).map(([period, items]) => ({
      period,
      articles: items,
    })),
  }));
}

export default function ArticleTOC({ currentArticleId, onSelect }: Props) {
  const [groups, setGroups] = useState<VolumeGroup[]>([]);
  const [openVolumes, setOpenVolumes] = useState<Set<string>>(new Set());
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    api.articleToc().then((items) => {
      const grouped = groupByVolume(items);
      setGroups(grouped);
      // Open the volume that contains the current article
      const current = items.find((a) => a.id === currentArticleId);
      const defaultVol = current?.volume ?? grouped[0]?.volume ?? "";
      setOpenVolumes(new Set([defaultVol]));
    });
  }, []);

  // When article changes, ensure its volume is open and scroll it into view
  useEffect(() => {
    if (groups.length === 0) return;
    const allArticles = groups.flatMap((g) => g.periods.flatMap((p) => p.articles));
    const current = allArticles.find((a) => a.id === currentArticleId);
    if (current?.volume) {
      setOpenVolumes((prev) => new Set([...prev, current.volume!]));
    }
  }, [currentArticleId, groups]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentArticleId]);

  function toggleVolume(vol: string) {
    setOpenVolumes((prev) => {
      const next = new Set(prev);
      if (next.has(vol)) next.delete(vol);
      else next.add(vol);
      return next;
    });
  }

  if (groups.length === 0) {
    return <aside className="article-toc panel toc-loading">加载目录...</aside>;
  }

  return (
    <aside className="article-toc panel">
      <div className="toc-header">目录</div>
      {groups.map(({ volume, periods }) => {
        const isOpen = openVolumes.has(volume);
        return (
          <div key={volume} className="toc-volume-group">
            <button
              type="button"
              className="toc-volume-header"
              onClick={() => toggleVolume(volume)}
            >
              <span className="toc-arrow">{isOpen ? "▾" : "▸"}</span>
              {volume}
            </button>
            {isOpen && (
              <div className="toc-period-list">
                {periods.map(({ period, articles }) => (
                  <div key={period} className="toc-period-group">
                    <div className="toc-period-header">{period}</div>
                    <div className="toc-article-list">
                      {articles.map((a) => {
                        const isActive = a.id === currentArticleId;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            ref={isActive ? activeRef : null}
                            className={`toc-article-btn${isActive ? " active" : ""}`}
                            onClick={() => onSelect(a.id)}
                            title={a.title}
                          >
                            {a.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
