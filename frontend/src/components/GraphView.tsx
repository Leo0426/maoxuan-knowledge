import ReactECharts from "echarts-for-react";

import type { GraphEdge, GraphNode } from "../types";

const categories = [
  { name: "文章" },
  { name: "事件" },
  { name: "思想" },
  { name: "实体" },
];

const symbols: Record<string, string> = {
  article: "roundRect",
  event: "circle",
  idea: "diamond",
  entity: "triangle",
};

export default function GraphView({
  graph,
  selectedNodeId,
  onSelect,
}: {
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  selectedNodeId?: string;
  onSelect: (node: GraphNode) => void;
}) {
  const option = {
    color: ["#3d6b63", "#c4a35a", "#8f4b35", "#4a5e6a"],
    tooltip: {
      backgroundColor: "#141d21",
      borderColor: "#2a3a40",
      borderWidth: 1,
      textStyle: { color: "#f0eadb", fontSize: 12 },
    },
    legend: [
      {
        data: categories.map((item) => item.name),
        icon: "circle",
        itemHeight: 8,
        itemWidth: 8,
        textStyle: { color: "#667068", fontSize: 11 },
      },
    ],
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        draggable: true,
        categories,
        force: { repulsion: 120, edgeLength: 80 },
        label: { show: true, position: "right", formatter: "{b}", fontSize: 11 },
        data: graph.nodes.map((node) => ({
          id: node.id,
          name: node.name,
          category: node.category,
          symbol: symbols[node.type] ?? "circle",
          symbolSize: node.id === selectedNodeId ? 58 : node.type === "article" ? 46 : 32,
          itemStyle: {
            borderColor: node.id === selectedNodeId ? "#c4a35a" : "#f3efe6",
            borderWidth: node.id === selectedNodeId ? 4 : 1,
          },
        })),
        links: graph.edges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          label: { show: false, formatter: edge.relation_type },
        })),
      },
    ],
  };

  return (
    <section className="panel" style={{ background: "var(--color-surface-inset)" }}>
      <ReactECharts
        option={option}
        style={{ height: 620 }}
        onEvents={{
          click: (params: { dataType?: string; data?: { id?: string } }) => {
            if (params.dataType !== "node" || !params.data?.id) return;
            const node = graph.nodes.find((item) => item.id === params.data?.id);
            if (node) onSelect(node);
          },
        }}
      />
    </section>
  );
}
