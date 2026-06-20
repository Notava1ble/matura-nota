import React, { useEffect, useRef, useState } from "react";
import { OverviewData } from "@shared/types/types";
import { init, EChartsOption } from "@/lib/echarts";

interface SubjectChartsProps {
  data: OverviewData[];
  selectedSubject: string | "all";
}

export const SubjectCharts: React.FC<SubjectChartsProps> = ({
  data,
  selectedSubject,
}) => {
  const distributionRef = useRef<HTMLDivElement>(null);
  const bucketsRef = useRef<HTMLDivElement>(null);

  const [distChart, setDistChart] = useState<any>(null);
  const [bucketsChart, setBucketsChart] = useState<any>(null);

  // Check if system is in dark mode
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    // Watch for dark mode changes on the html tag
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Responsive charts resize helper
  useEffect(() => {
    const handleResize = () => {
      distChart?.resize();
      bucketsChart?.resize();
    };

    window.addEventListener("resize", handleResize);

    // Also use ResizeObserver on containers
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        distChart?.resize();
        bucketsChart?.resize();
      });
      if (distributionRef.current)
        resizeObserver.observe(distributionRef.current);
      if (bucketsRef.current) resizeObserver.observe(bucketsRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [distChart, bucketsChart]);

  // Initializing charts
  useEffect(() => {
    if (distributionRef.current && !distChart) {
      const chart = init(distributionRef.current);
      setDistChart(chart);
    }
    if (bucketsRef.current && !bucketsChart) {
      const chart = init(bucketsRef.current);
      setBucketsChart(chart);
    }
  }, [distChart, bucketsChart]);

  // Update chart options
  useEffect(() => {
    if (!distChart || !bucketsChart || data.length === 0) return;

    const styles = getComputedStyle(document.documentElement);
    const cssVar = (name: string) => styles.getPropertyValue(name).trim();
    const textColor = cssVar("--foreground");
    const lineColor = cssVar("--border");
    const tooltipBg = cssVar("--popover");
    const tooltipText = cssVar("--popover-foreground");
    const tooltipBorder = cssVar("--border");

    // Setup Distribution Chart Options
    const pointsList = Array.from({ length: 61 }, (_, i) => i);
    const isAll = selectedSubject === "all";

    const subjectsToShow = isAll
      ? data
      : data.filter((d) => d.examTitle === selectedSubject);

    const COLORS = [
      cssVar("--chart-1"),
      cssVar("--chart-2"),
      cssVar("--chart-3"),
      cssVar("--chart-4"),
      cssVar("--chart-5"),
    ];

    const subjectColorMap = new Map(
      data.map((sub, i) => [sub.examTitle, COLORS[i % COLORS.length]]),
    );
    const getSubjectColor = (examTitle: string) =>
      subjectColorMap.get(examTitle) ?? COLORS[0];

    // Distribution series
    const distSeries = subjectsToShow.map((sub) => {
      const color = getSubjectColor(sub.examTitle);
      const name = sub.examTitle;

      return {
        name,
        type: "line" as const,
        data: sub.pointDistribution,
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color,
        },
        itemStyle: {
          color,
        },
        emphasis: {
          focus: "none" as const,
          lineStyle: {
            width: 2,
            color,
          },
          itemStyle: {
            color,
            opacity: 1,
          },
        },
        blur: {
          lineStyle: {
            opacity: 1,
          },
          itemStyle: {
            opacity: 1,
          },
        },
      };
    });

    const distOption: EChartsOption = {
      grid: {
        left: "4%",
        right: "4%",
        bottom: "8%",
        top: "16%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        borderRadius: 0,
        textStyle: { color: tooltipText, fontSize: 11 },
        shadowBlur: 0,
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          let html = `<div style="font-family:inherit;padding:2px 0">
            <div style="font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${tooltipBorder}">Rezultati: ${params[0].name} Pikë</div>`;
          params.forEach((p: any) => {
            const pct = (
              (p.value /
                subjectsToShow.find((s) => s.examTitle === p.seriesName)!
                  .numberOfStudents) *
              100
            ).toFixed(2);
            html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;font-size:11px;padding:1px 0">
              <span style="display:flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;background:${p.color}"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight:700;font-family:monospace">${p.value.toLocaleString("sq-AL")} (${pct}%)</span>
            </div>`;
          });
          html += "</div>";
          return html;
        },
      },
      legend: {
        data: subjectsToShow.map((s) => s.examTitle),
        textStyle: { color: textColor, fontFamily: "inherit" },
        top: "2%",
      },
      xAxis: {
        type: "category",
        data: pointsList.map(String),
        boundaryGap: false,
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor, fontFamily: "inherit", interval: 9 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "Numri i Nxënësve",
        nameLocation: "middle",
        nameRotate: 90,
        nameGap: 48,
        nameTextStyle: {
          color: textColor,
          fontFamily: "inherit",
          align: "center",
          verticalAlign: "middle",
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontFamily: "inherit" },
        splitLine: { lineStyle: { color: lineColor, type: "dashed" } },
      },
      series: distSeries,
    };

    // Setup Buckets Chart Options
    const bucketLabels = [
      "0-10 pikë",
      "11-20 pikë",
      "21-30 pikë",
      "31-40 pikë",
      "41-50 pikë",
      "51-60 pikë",
    ];

    const bucketSeries = subjectsToShow.map((sub) => {
      const color = getSubjectColor(sub.examTitle);
      const name = sub.examTitle;

      return {
        name,
        type: "bar" as const,
        data: sub.pointBuckets.map((b) => b.count),
        barMaxWidth: 40,
        itemStyle: {
          color,
          borderRadius: 0,
        },
        emphasis: {
          focus: "none" as const,
          itemStyle: {
            color,
            opacity: 1,
          },
        },
        blur: {
          itemStyle: {
            opacity: 1,
          },
        },
      };
    });

    const bucketsOption: EChartsOption = {
      grid: {
        left: "4%",
        right: "4%",
        bottom: "8%",
        top: "16%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        borderRadius: 0,
        textStyle: { color: tooltipText, fontSize: 11 },
        shadowBlur: 0,
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          let html = `<div style="font-family:inherit;padding:2px 0">
            <div style="font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${tooltipBorder}">Intervali: ${params[0].name}</div>`;
          params.forEach((p: any) => {
            const pct = (
              (p.value /
                subjectsToShow.find((s) => s.examTitle === p.seriesName)!
                  .numberOfStudents) *
              100
            ).toFixed(1);
            html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;font-size:11px;padding:1px 0">
              <span style="display:flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;background:${p.color}"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight:700;font-family:monospace">${p.value.toLocaleString("sq-AL")} (${pct}%)</span>
            </div>`;
          });
          html += "</div>";
          return html;
        },
      },
      legend: {
        data: subjectsToShow.map((s) => s.examTitle),
        textStyle: { color: textColor, fontFamily: "inherit" },
        top: "2%",
      },
      xAxis: {
        type: "category",
        data: bucketLabels,
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor, fontFamily: "inherit" },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "Numri i Nxënësve",
        nameLocation: "middle",
        nameRotate: 90,
        nameGap: 48,
        nameTextStyle: {
          color: textColor,
          fontFamily: "inherit",
          align: "center",
          verticalAlign: "middle",
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontFamily: "inherit" },
        splitLine: { lineStyle: { color: lineColor, type: "dashed" } },
      },
      series: bucketSeries,
    };

    distChart.setOption(distOption, true);
    bucketsChart.setOption(bucketsOption, true);
  }, [distChart, bucketsChart, data, selectedSubject, isDarkMode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Score Distribution Chart Container */}
      <div className="bg-card border border-border p-6 flex flex-col h-100 lg:h-112.5">
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Shpërndarja e Pikëve
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Numri i nxënësve për çdo pikë të marrë (0–60)
          </p>
        </div>
        <div ref={distributionRef} className="flex-1 w-full min-h-62.5" />
      </div>

      {/* Point Buckets Chart Container */}
      <div className="bg-card border border-border p-6 flex flex-col h-100 lg:h-112.5">
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Shpërndarja sipas Intervaleve
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Nxënës të grupuar në intervale prej 10 pikësh
          </p>
        </div>
        <div ref={bucketsRef} className="flex-1 w-full min-h-62.5" />
      </div>
    </div>
  );
};
