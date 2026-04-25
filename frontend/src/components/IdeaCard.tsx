import type { Idea } from "../types";

export default function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <article className="item-card">
      <h3>{idea.name}</h3>
      <p>{idea.summary}</p>
      <div className="meta">{idea.category}</div>
    </article>
  );
}
