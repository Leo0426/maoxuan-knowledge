import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

import type { Event } from "../types";

export default function TimelineChart({
  events,
  selectedEventId,
  onSelect,
}: {
  events: Event[];
  selectedEventId?: number;
  onSelect: (event: Event) => void;
}) {
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const datedEvents = useMemo(
    () =>
      events
        .filter((event) => event.start_date || event.end_date)
        .sort((a, b) =>
          String(a.start_date ?? a.end_date).localeCompare(String(b.start_date ?? b.end_date)),
        ),
    [events],
  );
  const startDate = datedEvents[0]?.start_date ?? "未标注";
  const endDate = datedEvents[datedEvents.length - 1]?.start_date ?? "未标注";
  const maxImportance = Math.max(...events.map((event) => event.importance), 1);

  const dateRange = useMemo(() => {
    const timestamps = datedEvents
      .map((event) => Date.parse(event.start_date ?? event.end_date ?? ""))
      .filter((value) => Number.isFinite(value));
    if (timestamps.length === 0) return {};

    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    const day = 1000 * 60 * 60 * 24;
    const span = Math.max(max - min, day);
    const padding = Math.max(span * 0.12, day * 30);

    return {
      min: min - padding,
      max: max + padding,
    };
  }, [datedEvents]);

  const chartData = useMemo(
    () =>
      datedEvents.map((event, index) => {
        const lane = index % 3;
        const isSelected = event.id === selectedEventId;
        return {
          eventId: event.id,
          event,
          name: event.title,
          value: [
            event.start_date ?? event.end_date,
            lane,
            event.importance,
            event.title,
          ],
          symbol: isSelected ? "pin" : "circle",
          symbolSize: isSelected ? 28 : 10 + event.importance * 4,
          itemStyle: {
            color: isSelected ? "#c4a35a" : event.importance >= 4 ? "#8f5f36" : "#4a6e67",
            borderColor: "#f7f1e4",
            borderWidth: isSelected ? 3 : 1,
            shadowBlur: isSelected ? 14 : 0,
            shadowColor: "rgba(196,163,90,0.45)",
          },
          label: {
            show: isSelected || event.importance >= Math.min(maxImportance, 4),
            formatter: event.title.length > 12 ? `${event.title.slice(0, 12)}...` : event.title,
            position: lane === 0 ? "bottom" : "top",
            distance: 8,
            color: isSelected ? "#1e2620" : "#56635b",
            fontSize: 11,
            fontWeight: isSelected ? 700 : 500,
          },
        };
      }),
    [datedEvents, maxImportance, selectedEventId],
  );

  const option = {
    animationDuration: 420,
    animationEasing: "cubicOut",
    grid: { left: 54, right: 34, top: 54, bottom: 86 },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      alwaysShowContent: false,
      enterable: false,
      confine: true,
      hideDelay: 60,
      backgroundColor: "#141d21",
      borderColor: "#2a3a40",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 12px 28px rgba(20,29,33,0.22); border-radius: 8px;",
      padding: [10, 12],
      textStyle: { color: "#f0eadb", fontSize: 12, lineHeight: 18 },
      formatter: (params: { data: { event: Event } }) => {
        if (!params.data?.event) return "";
        const event = params.data.event;
        const date = event.date_text ?? event.start_date ?? "时间未标注";
        const location = event.location ? `<br/>地点：${event.location}` : "";
        const desc = event.description ? `<br/><span style="color:#c9d0c8">${event.description.slice(0, 84)}</span>` : "";
        return `<strong>${event.title}</strong><br/>时间：${date}${location}<br/>重要度：${event.importance}/5${desc}`;
      },
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        filterMode: "filter",
        minValueSpan: 1000 * 60 * 60 * 24 * 7,
        realtime: true,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "filter",
        minValueSpan: 1000 * 60 * 60 * 24 * 7,
        realtime: true,
        showDetail: true,
        brushSelect: true,
        start: 0,
        end: 100,
        height: 22,
        bottom: 28,
        borderColor: "#d9d1c0",
        fillerColor: "rgba(196,163,90,0.22)",
        handleStyle: { color: "#c4a35a", borderColor: "#9f7d3f" },
        textStyle: { color: "#6f766e", fontSize: 10 },
      },
    ],
    xAxis: {
      type: "time",
      min: dateRange.min,
      max: dateRange.max,
      axisPointer: {
        show: true,
        label: {
          backgroundColor: "#1e2620",
          color: "#f3efe6",
        },
      },
      axisLine: { lineStyle: { color: "#bfb6a2", width: 2 } },
      axisTick: { lineStyle: { color: "#ccc5b4" } },
      axisLabel: {
        color: "#667068",
        fontFamily: "'SF Mono', 'Consolas', monospace",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: { color: "#e0dbd0", type: "dashed" },
      },
    },
    yAxis: {
      type: "value",
      min: -0.5,
      max: 2.5,
      show: false,
    },
    series: [
      {
        type: "scatter",
        z: 3,
        cursor: "pointer",
        data: chartData,
        emphasis: {
          scale: true,
          focus: "self",
          label: {
            show: true,
            color: "#1e2620",
            fontWeight: 700,
          },
        },
      },
    ],
  };

  return (
    <div className="panel chart-module timeline-module">
      <div className="module-header">
        <div>
          <div className="eyebrow">事件编年</div>
          <h2>事件时间轴</h2>
        </div>
        <div className="module-kpis">
          <span>{events.length} 个事件</span>
          <span>{startDate} / {endDate}</span>
        </div>
      </div>
      <ReactECharts
        option={option}
        className="responsive-chart timeline-chart"
        style={{ height: "100%" }}
        notMerge
        onChartReady={(chart) => {
          chart.getZr().on("globalout", () => {
            chart.dispatchAction({ type: "hideTip" });
          });
        }}
        onEvents={{
          click: (params: { data?: { eventId?: number } }) => {
            const event = events.find((item) => item.id === params.data?.eventId);
            if (event) onSelect(event);
          },
        }}
      />
      {chartData.length === 0 && (
        <div className="chart-empty-overlay">当前事件缺少可绘制日期，可在下方事件索引中查看</div>
      )}
      <div className="module-footer timeline-footer">
        当前选中：<strong>{selectedEvent?.title ?? "未选择事件"}</strong>
      </div>
    </div>
  );
}
