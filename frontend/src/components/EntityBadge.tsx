import type { Entity } from "../types";
import { typeLabel } from "../utils/labels";

export default function EntityBadge({ entity }: { entity: Entity }) {
  return (
    <span className="tag" title={entity.description ?? undefined}>
      {entity.name} · {typeLabel(entity.type)}
    </span>
  );
}
