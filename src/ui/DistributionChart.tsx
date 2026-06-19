import { useEffect, useMemo, useRef } from "react";
import { init, type EChartsOption } from "../lib/echarts";

type DistributionPoint = {
  range: string;
  count: number;
};

export function DistributionChart({ data }: { data: DistributionPoint[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const option = useMemo<EChartsOption>(
    () => ({
      color: ["#1c7c74"],
      grid: { left: 48, right: 18, top: 24, bottom: 42 },
      tooltip: {
        trigger: "axis",
        valueFormatter: (value: unknown) => Number(value).toLocaleString("sq-AL"),
      },
      xAxis: {
        type: "category",
        data: data.map((point) => point.range),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#c8beaa" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#68746f" },
        splitLine: { lineStyle: { color: "#eee8da" } },
      },
      series: [
        {
          name: "Rezultate",
          type: "bar",
          data: data.map((point) => point.count),
          barMaxWidth: 34,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [data],
  );

  useEChart(ref, option);

  return <div ref={ref} className="chart-surface w-full" role="img" aria-label="Shperndarja e pikeve sipas intervaleve" />;
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
