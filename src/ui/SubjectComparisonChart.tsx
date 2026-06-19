import { useEffect, useMemo, useRef } from "react";
import { init, type EChartsOption } from "../lib/echarts";
import type { SubjectMetric } from "../types/data";

export function SubjectComparisonChart({ subjects }: { subjects: SubjectMetric[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const option = useMemo<EChartsOption>(
    () => ({
      color: ["#315f9b", "#d0683a"],
      legend: { bottom: 0, textStyle: { color: "#4e5a55" } },
      grid: { left: 42, right: 18, top: 24, bottom: 58 },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: subjects.map((subject) => subject.subject),
        axisLabel: { interval: 0, rotate: subjects.length > 3 ? 24 : 0, color: "#4e5a55" },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#c8beaa" } },
      },
      yAxis: [
        {
          type: "value",
          min: 0,
          max: 10,
          axisLabel: { color: "#68746f" },
          splitLine: { lineStyle: { color: "#eee8da" } },
        },
        {
          type: "value",
          min: 0,
          max: 100,
          axisLabel: { formatter: "{value}%", color: "#68746f" },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Nota mesatare",
          type: "bar",
          data: subjects.map((subject) => subject.averageGrade),
          barMaxWidth: 30,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "Kalueshmeria",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          data: subjects.map((subject) => subject.passRate),
        },
      ],
    }),
    [subjects],
  );

  useEChart(ref, option);

  return <div ref={ref} className="chart-surface w-full" role="img" aria-label="Krahasim i notave dhe kalueshmerise sipas lendes" />;
}

function useEChart(ref: React.RefObject<HTMLDivElement | null>, option: EChartsOption) {
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const chart = init(ref.current);
    chart.setOption(option);

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option, ref]);
}
