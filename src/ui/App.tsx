import { Outlet } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpenCheck, ChevronDown, GraduationCap, Search, TrendingUp } from "lucide-react";
import { loadDatasetIndex, loadSubjects, loadSummary, lookupStudent } from "../lib/data";
import { formatNumber } from "../lib/stats";
import type { DatasetIndex, StudentRecord, SubjectMetric, Summary } from "../types/data";
import { DistributionChart } from "./DistributionChart";
import { SubjectComparisonChart } from "./SubjectComparisonChart";
import { SubjectTable } from "./SubjectTable";
import { StudentPanel } from "./StudentPanel";

export function App() {
  const [datasetIndex, setDatasetIndex] = useState<DatasetIndex | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [subjects, setSubjects] = useState<SubjectMetric[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("Te gjitha lendet");
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "not-found" | "found">("idle");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      const index = await loadDatasetIndex();
      setDatasetIndex(index);
      setYear(index.latestYear);
    }

    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!year) {
      return;
    }

    const activeYear = year;

    async function loadYearData() {
      setIsLoading(true);
      const [nextSummary, nextSubjects] = await Promise.all([loadSummary(activeYear), loadSubjects(activeYear)]);
      setSummary(nextSummary);
      setSubjects(nextSubjects);
      setIsLoading(false);
    }

    void loadYearData();
  }, [year]);

  const visibleSubjects = useMemo(() => {
    if (selectedSubject === "Te gjitha lendet") {
      return subjects;
    }

    return subjects.filter((subject) => subject.subject === selectedSubject);
  }, [selectedSubject, subjects]);

  async function handleStudentLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!year) {
      return;
    }

    const record = await lookupStudent(year, studentId);
    setStudent(record);
    setLookupStatus(record ? "found" : "not-found");
  }

  if (isLoading || !summary || !datasetIndex || !year) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f4ee] px-6 text-[#16201d]">
        <div className="max-w-md border-l-4 border-[#1c7c74] pl-5">
          <p className="text-sm uppercase tracking-[0.24em] text-[#69746f]">Matura Nota</p>
          <h1 className="mt-3 text-3xl font-semibold">Duke ngarkuar statistikat...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#16201d]">
      <section className="border-b border-[#d8d2c2] bg-[#f6f4ee]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#45615a]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c7bea9] bg-white/60 px-3 py-1">
                <BookOpenCheck size={16} aria-hidden="true" />
                Portal publik statistikash
              </span>
              <span>Perditesuar per vitin {year}</span>
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-[#16201d] md:text-7xl">
              Matura Nota
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4e5a55]">
              Eksploro rezultatet kombetare te Matures, krahaso lendet dhe gjej kontekstin e rezultatit tend
              permes identifikuesit anonim.
            </p>
          </div>

          <form
            onSubmit={handleStudentLookup}
            className="self-end border border-[#d8d2c2] bg-[#fffdf7] p-5 shadow-[0_18px_60px_rgba(32,39,35,0.08)]"
          >
            <label className="text-sm font-semibold text-[#30423d]" htmlFor="student-id">
              Kerko rezultatin personal
            </label>
            <div className="mt-3 flex gap-2">
              <input
                id="student-id"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="p.sh. A10293"
                className="min-w-0 flex-1 border border-[#cfc7b7] bg-white px-4 py-3 text-base uppercase text-[#16201d]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#1c7c74] px-4 py-3 font-semibold text-white transition hover:bg-[#15645e]"
              >
                <Search size={18} aria-hidden="true" />
                Kerko
              </button>
            </div>
            <p className="mt-3 text-sm text-[#68746f]">Provo ID-ne shembull: A10293 ose A88420.</p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Kandidate" value={summary.candidateCount.toLocaleString("sq-AL")} detail="ne dataset" />
          <MetricCard label="Nota mesatare" value={formatNumber(summary.averageGrade)} detail="shkallezuar" />
          <MetricCard label="Kalueshmeria" value={`${formatNumber(summary.passRate)}%`} detail="kombetare" />
          <MetricCard label="Mediana" value={formatNumber(summary.medianGrade)} detail="nota p50" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-8 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Analiza publike</h2>
              <p className="mt-1 text-sm text-[#68746f]">Shperndarje, krahasime dhe ritme kalueshmerie.</p>
            </div>
            <label className="inline-flex items-center gap-2 border border-[#cfc7b7] bg-white px-3 py-2 text-sm font-medium">
              Lenda
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                className="bg-transparent pr-8 text-[#16201d]"
              >
                <option>Te gjitha lendet</option>
                {subjects.map((subject) => (
                  <option key={subject.subject}>{subject.subject}</option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Shperndarja e pikeve" icon={<BarChart3 size={18} />}>
              <DistributionChart data={summary.scoreDistribution} />
            </Panel>
            <Panel title="Krahasimi sipas lendes" icon={<TrendingUp size={18} />}>
              <SubjectComparisonChart subjects={visibleSubjects} />
            </Panel>
          </div>

          <Panel title="Tabela e lendeve" icon={<GraduationCap size={18} />}>
            <SubjectTable subjects={visibleSubjects} />
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Sinjale kryesore" icon={<TrendingUp size={18} />}>
            <div className="space-y-3">
              {summary.insights.map((insight) => (
                <p key={insight} className="border-l-4 border-[#f2b84b] bg-[#fff8e7] px-4 py-3 text-sm leading-6 text-[#4e4633]">
                  {insight}
                </p>
              ))}
            </div>
          </Panel>

          <StudentPanel status={lookupStatus} student={student} />
        </aside>
      </section>

      <Outlet />
    </main>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-[#d8d2c2] bg-[#fffdf7] p-4">
      <p className="text-sm font-medium text-[#68746f]">{label}</p>
      <p className="number-font mt-2 text-3xl font-semibold text-[#16201d]">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8a7460]">{detail}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-[#d8d2c2] bg-[#fffdf7]">
      <header className="flex items-center gap-2 border-b border-[#e4dece] px-4 py-3 text-sm font-semibold text-[#30423d]">
        {icon}
        {title}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
