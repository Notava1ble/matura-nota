import type { StudentRecord } from "../types/data";
import { formatNumber } from "../lib/stats";

export function StudentPanel({ status, student }: { status: "idle" | "not-found" | "found"; student: StudentRecord | null }) {
  if (status === "idle") {
    return (
      <section className="border border-[#d8d2c2] bg-[#fffdf7] p-5">
        <h2 className="text-lg font-semibold">Rezultati personal</h2>
        <p className="mt-2 text-sm leading-6 text-[#68746f]">
          Shkruaj identifikuesin anonim per te pare notat, percentilet dhe krahasimin me mesataren kombetare.
        </p>
      </section>
    );
  }

  if (status === "not-found" || !student) {
    return (
      <section className="border border-[#d8d2c2] bg-[#fffdf7] p-5">
        <h2 className="text-lg font-semibold">Nuk u gjet rezultat</h2>
        <p className="mt-2 text-sm leading-6 text-[#68746f]">
          Kontrollo identifikuesin anonim dhe provo perseri. Te dhenat personale nuk ruhen ne aplikacion.
        </p>
      </section>
    );
  }

  const averagePercentile = student.results.reduce((total, result) => total + result.percentile, 0) / student.results.length;
  const strongest = [...student.results].sort((a, b) => b.percentile - a.percentile)[0];

  return (
    <section className="border border-[#d8d2c2] bg-[#fffdf7] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7460]">ID anonim</p>
          <h2 className="mt-1 text-2xl font-semibold">{student.id}</h2>
        </div>
        <div className="number-font bg-[#1c7c74] px-3 py-2 text-sm font-semibold text-white">
          p{Math.round(averagePercentile)}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#4e5a55]">
        Performanca me e forte eshte ne {strongest.subject}, ku rezultati eshte mbi {strongest.percentile}% te rezultateve kombetare.
      </p>

      <div className="mt-5 space-y-4">
        {student.results.map((result) => {
          const delta = result.totalPoints - result.nationalAverage;
          const width = Math.max(8, Math.min(100, result.percentile));

          return (
            <article key={`${student.id}-${result.subject}`} className="border border-[#e4dece] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{result.subject}</h3>
                  <p className="text-sm text-[#68746f]">{result.exam}</p>
                </div>
                <div className="number-font text-right">
                  <p className="text-2xl font-semibold">{result.grade}</p>
                  <p className="text-xs text-[#68746f]">nota</p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-[#eee8da]">
                <div className="h-2 bg-[#315f9b]" style={{ width: `${width}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <Stat label="Pike" value={formatNumber(result.totalPoints)} />
                <Stat label="Percentil" value={`p${result.percentile}`} />
                <Stat label="Diferenca" value={`${delta >= 0 ? "+" : ""}${formatNumber(delta)}`} tone={delta >= 0 ? "good" : "low"} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "low" }) {
  const toneClass = tone === "good" ? "text-[#1c7c74]" : tone === "low" ? "text-[#b44b35]" : "text-[#16201d]";

  return (
    <div>
      <p className="text-xs text-[#68746f]">{label}</p>
      <p className={`number-font font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
