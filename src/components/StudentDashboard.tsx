import React, { useEffect, useRef, useState } from "react";
import { StudentStats, OverviewData, StudentExamStats } from "@shared/types/types";
import { init, EChartsOption } from "@/lib/echarts";
import { formatNumber } from "@shared/utils/statistics";
import { formatSubject } from "@shared/utils/format";
import {
  ArrowLeft,
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";

interface StudentDashboardProps {
  studentId: string;
  student: StudentStats;
  overviewData: OverviewData[];
  onBack: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentId,
  student,
  overviewData,
  onBack,
}) => {
  const comparisonRef = useRef<HTMLDivElement>(null);
  const distributionRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  const [comparisonChart, setComparisonChart] = useState<any>(null);
  const [distributionChart, setDistributionChart] = useState<any>(null);
  const [radarChart, setRadarChart] = useState<any>(null);

  // Default to the first exam the student took
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>(
    student.exams[0]?.examTitle || ""
  );

  const [radarMetric, setRadarMetric] = useState<"points" | "rank">("points");

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
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
      comparisonChart?.resize();
      distributionChart?.resize();
      radarChart?.resize();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        comparisonChart?.resize();
        distributionChart?.resize();
        radarChart?.resize();
      });
      if (comparisonRef.current) resizeObserver.observe(comparisonRef.current);
      if (distributionRef.current) resizeObserver.observe(distributionRef.current);
      if (radarRef.current) resizeObserver.observe(radarRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [comparisonChart, distributionChart, radarChart]);

  // Initializing charts
  useEffect(() => {
    if (comparisonRef.current && !comparisonChart) {
      const chart = init(comparisonRef.current);
      setComparisonChart(chart);
    }
    if (distributionRef.current && !distributionChart) {
      const chart = init(distributionRef.current);
      setDistributionChart(chart);
    }
    if (radarRef.current && !radarChart) {
      const chart = init(radarRef.current);
      setRadarChart(chart);
    }
  }, [comparisonChart, distributionChart, radarChart]);

  // Update comparison chart options
  useEffect(() => {
    if (!comparisonChart) return;

    const styles = getComputedStyle(document.documentElement);
    const cssVar = (name: string) => styles.getPropertyValue(name).trim();
    const textColor = cssVar("--foreground");
    const lineColor = cssVar("--border");
    const tooltipBg = cssVar("--popover");
    const tooltipText = cssVar("--popover-foreground");
    const tooltipBorder = cssVar("--border");
    const primaryColor = cssVar("--primary");
    const chart2Color = cssVar("--chart-2");

    const subjectTitles = student.exams.map((e) => formatSubject(e.examTitle));
    const studentPoints = student.exams.map((e) => e.points);
    const nationalAverages = student.exams.map((e) => {
      const match = overviewData.find((o) => o.examTitle === e.examTitle);
      return match ? Math.round(match.pointsAverage * 10) / 10 : 0;
    });

    const option: EChartsOption = {
      grid: {
        left: "4%",
        right: "4%",
        bottom: "8%",
        top: "20%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        confine: true,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        borderRadius: 0,
        textStyle: { color: tooltipText, fontSize: 11 },
        shadowBlur: 0,
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          let html = `<div style="font-family:inherit;padding:2px 0">
            <div style="font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${tooltipBorder}">${params[0].name}</div>`;
          params.forEach((p: any) => {
            html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;font-size:11px;padding:1px 0">
              <span style="display:flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;background:${p.color}"></span>
                ${p.seriesName}
              </span>
              <span style="font-weight:700;font-family:monospace">${p.value} Pikë</span>
            </div>`;
          });
          html += "</div>";
          return html;
        },
      },
      legend: {
        data: ["Pikët e Mia", "Mesatarja Kombëtare"],
        textStyle: { color: textColor, fontFamily: "inherit" },
        top: "2%",
      },
      xAxis: {
        type: "category",
        data: subjectTitles,
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor, fontFamily: "inherit" },
      },
      yAxis: {
        type: "value",
        max: 60,
        name: "Pikët (Maks. 60)",
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
      series: [
        {
          name: "Pikët e Mia",
          type: "bar" as const,
          data: studentPoints,
          barMaxWidth: 30,
          itemStyle: {
            color: primaryColor,
            borderRadius: 0,
          },
          emphasis: {
            focus: "none" as const,
            itemStyle: {
              color: primaryColor,
              opacity: 1,
            },
          },
          blur: {
            itemStyle: {
              opacity: 1,
            },
          },
        },
        {
          name: "Mesatarja Kombëtare",
          type: "bar" as const,
          data: nationalAverages,
          barMaxWidth: 30,
          itemStyle: {
            color: chart2Color,
            borderRadius: 0,
          },
          emphasis: {
            focus: "none" as const,
            itemStyle: {
              color: chart2Color,
              opacity: 1,
            },
          },
          blur: {
            itemStyle: {
              opacity: 1,
            },
          },
        },
      ],
    };

    comparisonChart.setOption(option, true);
  }, [comparisonChart, student, overviewData, isDarkMode]);

  // Update distribution chart options based on selected exam
  useEffect(() => {
    if (!distributionChart || !selectedExamTitle) return;

    const styles = getComputedStyle(document.documentElement);
    const cssVar = (name: string) => styles.getPropertyValue(name).trim();
    const textColor = cssVar("--foreground");
    const lineColor = cssVar("--border");
    const tooltipBg = cssVar("--popover");
    const tooltipText = cssVar("--popover-foreground");
    const tooltipBorder = cssVar("--border");
    const primaryColor = cssVar("--primary");
    const chart1Color = cssVar("--chart-1");

    const examMatch = student.exams.find((e) => e.examTitle === selectedExamTitle);
    const nationalMatch = overviewData.find((o) => o.examTitle === selectedExamTitle);

    if (!examMatch || !nationalMatch) return;

    const pointsList = Array.from({ length: 61 }, (_, i) => i);
    const distribution = nationalMatch.pointDistribution;
    const studentPoints = examMatch.points;

    const option: EChartsOption = {
      grid: {
        left: "4%",
        right: "4%",
        bottom: "8%",
        top: "16%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        confine: true,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        borderRadius: 0,
        textStyle: { color: tooltipText, fontSize: 11 },
        shadowBlur: 0,
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          const pt = params[0].name;
          const count = params[0].value;
          const pct = ((count / nationalMatch.numberOfStudents) * 100).toFixed(2);
          const isStudentScore = Number(pt) === studentPoints;

          return `<div style="font-family:inherit;padding:2px 0">
            <div style="font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${tooltipBorder}">
              Rezultati: ${pt} Pikë ${isStudentScore ? " (Pikët e Mia)" : ""}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;font-size:11px;padding:1px 0">
              <span>Nxënës:</span>
              <span style="font-weight:700;font-family:monospace">${count.toLocaleString("sq-AL")} (${pct}%)</span>
            </div>
          </div>`;
        },
      },
      xAxis: {
        type: "category",
        data: pointsList.map(String),
        boundaryGap: false,
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor, fontFamily: "inherit", interval: 9 },
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
      series: [
        {
          name: "Shpërndarja Kombëtare",
          type: "line" as const,
          data: distribution,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: chart1Color,
          },
          areaStyle: {
            color: chart1Color,
            opacity: 0.1,
          },
          markLine: {
            symbol: ["none", "none"] as any,
            label: {
              show: true,
              position: "end" as any,
              formatter: `Unë: ${studentPoints} Pikë`,
              fontFamily: "inherit",
              fontSize: 10,
              fontWeight: "bold",
              color: textColor,
              padding: [2, 4],
            },
            lineStyle: {
              type: "dashed",
              color: primaryColor,
              width: 2,
            },
            data: [
              { xAxis: studentPoints }
            ],
          },
        },
      ],
    };

    distributionChart.setOption(option, true);
  }, [distributionChart, selectedExamTitle, student, overviewData, isDarkMode]);

  // Update radar chart options
  useEffect(() => {
    if (!radarChart) return;

    const styles = getComputedStyle(document.documentElement);
    const cssVar = (name: string) => styles.getPropertyValue(name).trim();
    const textColor = cssVar("--foreground");
    const lineColor = cssVar("--border");
    const tooltipBg = cssVar("--popover");
    const tooltipText = cssVar("--popover-foreground");
    const tooltipBorder = cssVar("--border");
    const primaryColor = cssVar("--primary");

    // Build subject map
    const examMap = new Map<string, StudentExamStats>();
    student.exams.forEach((exam) => {
      examMap.set(exam.examTitle.toLowerCase(), exam);
    });

    const getVal = (titleKey: string) => {
      const exam = examMap.get(titleKey.toLowerCase());
      if (!exam) return 0;
      if (radarMetric === "points") {
        return exam.points;
      } else {
        // Percentile rank (0 to 100)
        return Math.round(exam.percentile * 1000) / 10;
      }
    };

    const matVal = getVal("Matematike") || getVal("Matematikë");
    const letVal = getVal("Letersi") || getVal("Letërsi");
    const huajVal = getVal("Gjuhe E Huaj") || getVal("Gjuhë e Huaj");
    const zgjVal = getVal("Lende Me Zgjedhje") || getVal("Lëndë me Zgjedhje");

    const valuesList = [matVal, letVal, huajVal, zgjVal];
    const maxVal = radarMetric === "points" ? 60 : 100;

    const option: EChartsOption = {
      tooltip: {
        trigger: "item",
        appendToBody: true,
        confine: true,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        borderRadius: 0,
        textStyle: { color: tooltipText, fontSize: 11 },
        shadowBlur: 0,
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          const isPoints = radarMetric === "points";
          const getSubjectText = (val: number) => {
            if (val === 0) return "Pa të dhëna";
            if (isPoints) return `${val} Pikë`;
            const pct = val;
            if (pct >= 50) {
              return `Top ${(100 - pct).toFixed(1)}%`;
            } else {
              return `Bottom ${pct.toFixed(1)}%`;
            }
          };

          return `<div style="font-family:inherit;padding:2px 0">
            <div style="font-weight:700;font-size:10px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${tooltipBorder}">
              Profili i Kandidatit
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;">
              <div style="display:flex;justify-content:space-between;gap:16px;">
                <span>Matematikë:</span>
                <span style="font-weight:700">${getSubjectText(matVal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:16px;">
                <span>Letërsi:</span>
                <span style="font-weight:700">${getSubjectText(letVal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:16px;">
                <span>Gjuhë e Huaj:</span>
                <span style="font-weight:700">${getSubjectText(huajVal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:16px;">
                <span>Lëndë me Zgjedhje:</span>
                <span style="font-weight:700">${getSubjectText(zgjVal)}</span>
              </div>
            </div>
          </div>`;
        },
      },
      radar: {
        indicator: [
          { name: "Matematikë", max: maxVal },
          { name: "Letërsi", max: maxVal },
          { name: "Gjuhë e Huaj", max: maxVal },
          { name: "Lëndë me Zgjedhje", max: maxVal },
        ],
        axisName: {
          color: textColor,
          fontFamily: "inherit",
          fontSize: 10,
          fontWeight: "bold",
        },
        splitLine: {
          lineStyle: {
            color: lineColor,
          },
        },
        splitArea: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: lineColor,
          },
        },
      },
      series: [
        {
          name: "Performanca e Kandidatit",
          type: "radar",
          data: [
            {
              value: valuesList,
              name: "Rezultati",
              itemStyle: {
                color: primaryColor,
              },
              lineStyle: {
                color: primaryColor,
                width: 2,
              },
              areaStyle: {
                color: primaryColor,
                opacity: 0.1,
              },
              emphasis: {
                focus: "none" as const,
                itemStyle: {
                  color: primaryColor,
                  opacity: 1,
                },
                lineStyle: {
                  color: primaryColor,
                  width: 2,
                },
                areaStyle: {
                  color: primaryColor,
                  opacity: 0.1,
                },
              },
            },
          ],
        },
      ],
    };

    radarChart.setOption(option, true);
  }, [radarChart, student, radarMetric, isDarkMode]);

  const formatPercentileToTopBottom = (percentile: number) => {
    const pct = percentile * 100;
    if (pct >= 50) {
      return `Top ${(100 - pct).toFixed(1)}%`;
    } else {
      return `Bottom ${pct.toFixed(1)}%`;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with search back link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-2 bg-transparent border-0 p-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kthehu te Analiza Kombëtare
          </button>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Rezultatet e Kandidatit:
            </h1>
            <span className="font-mono text-lg md:text-xl font-bold text-primary tracking-wide">
              {studentId}
            </span>
          </div>
        </div>

        {/* Global status badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {student.failedExamsCount === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              KALUES
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-black uppercase tracking-wider">
              <XCircle className="w-3.5 h-3.5" />
              JO KALUES
            </div>
          )}
        </div>
      </div>

      {/* Overview statistical cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Average Grade */}
        <div className="bg-card border border-border p-4 md:p-5 rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Nota Mesatare</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {formatNumber(student.averageGrade, 2)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / 10
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">
              Nota e rrumbullakosur: {student.roundedAverageGrade}
            </p>
          </div>
        </div>

        {/* Exams Passed */}
        <div className="bg-card border border-border p-4 md:p-5 rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Provimet e Kaluara</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {student.passedExamsCount}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / {student.exams.length}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">
              {student.failedExamsCount > 0
                ? `${student.failedExamsCount} provim nuk është kaluar`
                : "Të gjitha provimet janë kaluar"}
            </p>
          </div>
        </div>

        {/* Best Subject */}
        <div className="bg-card border border-border p-4 md:p-5 rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Lënda më e Fortë</span>
            <Percent className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground block truncate">
              {student.bestExam ? formatSubject(student.bestExam) : "—"}
            </span>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium truncate">
              {student.exams.length > 0 && student.bestExam
                ? `${
                    student.exams.find((e) => e.examTitle === student.bestExam)?.points
                  } pikë (Nota ${
                    student.exams.find((e) => e.examTitle === student.bestExam)?.roundedGrade
                  })`
                : "Nuk ka të dhëna"}
            </p>
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-card border border-border p-4 md:p-5 rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-wider">Pikët e Grumbulluara</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {student.totalPoints}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / {student.exams.length * 60}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">
              Mesatarisht {formatNumber(student.averagePoints, 1)} pikë për provim
            </p>
          </div>
        </div>
      </div>

      {/* Detail Results Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            Detajet e Provimeve
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            Lista e plotë e vlerësimeve sipas lëndëve specifike
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Provimi</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Lënda Specifike</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Pikët</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Nota</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Renditja</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Pozicioni (% Top/Bottom)</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Statusi</th>
              </tr>
            </thead>
            <tbody>
              {student.exams.map((exam, index) => {
                return (
                  <tr key={index} className="border-b border-border hover:bg-muted/10 transition-colors last:border-b-0">
                    <td className="p-4 text-xs font-black text-foreground uppercase tracking-wider">
                      {formatSubject(exam.examTitle)}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-72" title={exam.subject}>
                      <span className="line-clamp-2">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-right text-foreground">
                      <div className="flex flex-col items-end">
                        <span>{exam.points} <span className="text-[10px] text-muted-foreground font-normal">/ 60</span></span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-right text-foreground">
                      <div className="flex flex-col items-end">
                        <span>{formatNumber(exam.grade, 2)}</span>
                        <span className="text-[9px] text-muted-foreground font-normal">Nota: {exam.roundedGrade}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-right text-foreground">
                      {exam.rank.toLocaleString("sq-AL")}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-right text-foreground">
                      {formatPercentileToTopBottom(exam.percentile)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                          exam.passed
                            ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-destructive/10 border border-destructive/20 text-destructive"
                        }`}
                      >
                        {exam.passed ? "KALUAR" : "NGELUR"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart (Profili i Aftësive) */}
        <div className="bg-card border border-border p-6 flex flex-col h-100 lg:h-112.5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Profili i Aftësive
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Performanca në 4 lëndët kryesore
              </p>
            </div>
            
            {/* Metric Toggle */}
            <div className="flex items-center gap-1 bg-muted/40 border border-border p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setRadarMetric("points")}
                className={`h-6 px-2.5 text-[9px] font-black uppercase tracking-wider cursor-pointer border-0 transition-colors ${
                  radarMetric === "points"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Pikët
              </button>
              <button
                type="button"
                onClick={() => setRadarMetric("rank")}
                className={`h-6 px-2.5 text-[9px] font-black uppercase tracking-wider cursor-pointer border-0 transition-colors ${
                  radarMetric === "rank"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Rangimi %
              </button>
            </div>
          </div>
          <div ref={radarRef} className="flex-1 w-full min-h-62.5" />
        </div>

        {/* National Average Comparison Chart */}
        <div className="bg-card border border-border p-6 flex flex-col h-100 lg:h-112.5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Krahasimi me Mesataren Kombëtare
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Pikët tuaja krahasuar me mesataren e nxënësve të tjerë në çdo lëndë
            </p>
          </div>
          <div ref={comparisonRef} className="flex-1 w-full min-h-62.5" />
        </div>
      </div>

      {/* Score Distribution Bell Curve Chart (Full Width) */}
      <div className="bg-card border border-border p-6 flex flex-col h-100 lg:h-112.5">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Pozicionimi në Shpërndarjen Kombëtare
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ku qëndron rezultati juaj në kurbën e të gjithë kandidatëve
            </p>
          </div>

          {/* Exam selector tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {student.exams.map((exam) => (
              <button
                key={exam.examTitle}
                onClick={() => setSelectedExamTitle(exam.examTitle)}
                className={`h-7 border px-2.5 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors ${
                  selectedExamTitle === exam.examTitle
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {formatSubject(exam.examTitle)}
              </button>
            ))}
          </div>
        </div>
        <div ref={distributionRef} className="flex-1 w-full min-h-62.5" />
      </div>
    </div>
  );
};
