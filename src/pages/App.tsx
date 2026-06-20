import { useEffect, useState } from "react";
import { loadOverview } from "@/lib/data";
import { OverviewData } from "@shared/types/types";
import { StatsOverview } from "@/components/StatsOverview";
import { SubjectCharts } from "@/components/SubjectCharts";
import { SubjectButton } from "@/components/SubjectButton";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Info } from "lucide-react";

export const App = () => {
  const [data, setData] = useState<OverviewData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    loadOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load overview data:", err);
        setError("Nuk u mundësua ngarkimi i të dhënave të provimit.");
        setLoading(false);
      });
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDarkMode(isDark);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
            Duke ngarkuar...
          </p>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="border border-border p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Gabim
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {error ||
              "Të dhënat e provimit nuk u gjetën ose janë të korruptuara."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
          >
            Provo Përsëri
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-8 h-14 flex items-center justify-between max-w-7xl">
          <div className="flex items-baseline gap-3">
            <span className="font-bold tracking-tight text-base text-foreground uppercase">
              Matura Nota
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              2026
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-10 max-w-7xl">
        <section className="mb-8 pb-6 border-b border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Rezultatet e Maturës Shtetërore · Shqipëri
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Analiza Kombëtare e Rezultateve
          </h1>
        </section>

        <section className="mb-8 flex flex-wrap items-center gap-2">
          <SubjectButton
            onClick={() => setSelectedSubject("all")}
            active={selectedSubject === "all"}
          >
            Të Gjitha
          </SubjectButton>
          {data.map((sub) => (
            <SubjectButton
              key={sub.examTitle}
              onClick={() => setSelectedSubject(sub.examTitle)}
              active={selectedSubject === sub.examTitle}
            >
              {sub.examTitle}
            </SubjectButton>
          ))}
        </section>

        <StatsOverview data={data} selectedSubject={selectedSubject} />
        <SubjectCharts data={data} selectedSubject={selectedSubject} />
      </main>
    </div>
  );
};
