import React from "react";
import { OverviewData } from "@shared/types/types";
import {
  getPassRateFromDistribution,
  formatNumber,
} from "@shared/utils/statistics";

interface StatsOverviewProps {
  data: OverviewData[];
  selectedSubject: string | "all";
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data, selectedSubject }) => {
  const filtered = selectedSubject === "all" ? data : data.filter(d => d.examTitle === selectedSubject);
  
  const totalExamEntries = filtered.reduce((acc, curr) => acc + curr.numberOfStudents, 0);
  const studentsInLargestExam = filtered.reduce(
    (max, curr) => Math.max(max, curr.numberOfStudents),
    0,
  );
  
  // Weighted averages
  const avgPoints = totalExamEntries > 0 
    ? filtered.reduce((acc, curr) => acc + (curr.pointsAverage * curr.numberOfStudents), 0) / totalExamEntries 
    : 0;
    
  const avgGrade = totalExamEntries > 0 
    ? filtered.reduce((acc, curr) => acc + (curr.gradeAverage * curr.numberOfStudents), 0) / totalExamEntries 
    : 0;

  // Weighted pass rate
  let totalPassing = 0;
  filtered.forEach(sub => {
    const rate = getPassRateFromDistribution(sub.pointDistribution);
    totalPassing += rate * sub.numberOfStudents;
  });
  const passRate = totalExamEntries > 0 ? (totalPassing / totalExamEntries) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-card border border-border p-6 rounded-none">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kandidatë Gjithsej</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {new Intl.NumberFormat("sq-AL").format(studentsInLargestExam)}
          </span>
          <span className="text-xs text-muted-foreground mt-2">
            {selectedSubject === "all" ? "Nxënës të testuar në të dyja provimet" : `Nxënës të testuar në ${selectedSubject}`}
          </span>
        </div>
      </div>

      {/* Grade Average Card */}
      <div className="bg-card border border-border p-6 rounded-none">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nota Mesatare</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {formatNumber(avgGrade, 2)}
          </span>
          <span className="text-xs text-muted-foreground mt-2">
            Mesatarja kombëtare e notës së shkallëzuar (nga 10)
          </span>
        </div>
      </div>

      {/* Points Average Card */}
      <div className="bg-card border border-border p-6 rounded-none">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pikët Mesatare</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {formatNumber(avgPoints, 1)}
          </span>
          <span className="text-xs text-muted-foreground mt-2">
            Mesatarja e pikëve të grumbulluara nga 60 pikë totale
          </span>
        </div>
      </div>

      {/* Pass Rate Card */}
      <div className="bg-card border border-border p-6 rounded-none">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shkalla e Kalueshmërisë</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {formatNumber(passRate, 1)}%
          </span>
          <span className="text-xs text-muted-foreground mt-2">
            Përqindja e nxënësve që kaluan (me pikë &ge; 15)
          </span>
        </div>
      </div>
    </div>
  );
};
