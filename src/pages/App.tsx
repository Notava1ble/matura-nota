import { useEffect, useState } from "react";
import { loadOverview, loadStudent } from "@/lib/data";
import { OverviewData, StudentStats } from "@shared/types/types";
import { StatsOverview } from "@/components/StatsOverview";
import { SubjectCharts } from "@/components/SubjectCharts";
import { SubjectButton } from "@/components/SubjectButton";
import { StudentDashboard } from "@/components/StudentDashboard";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Info } from "lucide-react";

const STUDENT_ID_PARAM = "id";

const getInitialStudentId = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(STUDENT_ID_PARAM) ?? "";
};

export const App = () => {
  const [data, setData] = useState<OverviewData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState(getInitialStudentId);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentStats | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  const setStudentIdInUrl = (studentId: string | null) => {
    const nextUrl = new URL(window.location.href);
    if (studentId) {
      nextUrl.searchParams.set(STUDENT_ID_PARAM, studentId);
    } else {
      nextUrl.searchParams.delete(STUDENT_ID_PARAM);
    }
    window.history.replaceState(null, "", nextUrl);
  };

  useEffect(() => {
    const initialStudentId = getInitialStudentId().trim();
    if (!initialStudentId) return;

    setSearchError(null);

    if (initialStudentId.length !== 12 || !/^\d+$/.test(initialStudentId)) {
      setSearchError("ID-ja e kandidatit duhet te kete saktesisht 12 shifra.");
      return;
    }

    setSearchLoading(true);
    loadStudent(initialStudentId)
      .then((data) => {
        setStudentData(data);
        setActiveStudentId(initialStudentId);
        setSearchQuery(initialStudentId);
      })
      .catch((err) => {
        console.error(err);
        setSearchError("Kandidati me kete ID nuk u gjet. Ju lutemi kontrolloni ID-ne tuaj.");
      })
      .finally(() => setSearchLoading(false));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    if (cleanQuery.length !== 12 || !/^\d+$/.test(cleanQuery)) {
      setSearchError("ID-ja e kandidatit duhet të ketë saktësisht 12 shifra.");
      return;
    }

    setSearchLoading(true);
    try {
      const data = await loadStudent(cleanQuery);
      setStudentData(data);
      setActiveStudentId(cleanQuery);
      setStudentIdInUrl(cleanQuery);
    } catch (err: any) {
      console.error(err);
      setSearchError(
        "Kandidati me këtë ID nuk u gjet. Ju lutemi kontrolloni ID-në tuaj."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveStudentId(null);
    setStudentData(null);
    setSearchError(null);
    setStudentIdInUrl(null);
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
            {studentData && activeStudentId
              ? "Rezultatet Personale të Kandidatit"
              : "Analiza Kombëtare e Rezultateve"}
          </h1>
        </section>

        {/* Search section */}
        <section className="mb-8 bg-card border border-border p-6 rounded-none">
          <div className="max-w-xl">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-foreground mb-2">
              Kërko Rezultatet e Kandidatit
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Vendosni kodin tuaj unik me 12 shifra të provimit për të parë rezultatet personale dhe krahasimin kombëtar.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Shembull: 260100100001"
                  className="w-full h-10 px-4 bg-background border border-border text-xs font-mono tracking-wider focus:outline-none focus:border-primary placeholder:text-muted-foreground/60 rounded-none text-foreground"
                  disabled={searchLoading}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs bg-transparent border-0 cursor-pointer"
                  >
                    Fshi
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="h-10 px-6 rounded-none font-black text-[10px] uppercase tracking-wider"
              >
                {searchLoading ? "Duke kërkuar..." : "Kërko"}
              </Button>
            </form>
            {searchError && (
              <p className="text-xs text-destructive mt-2 font-medium">
                {searchError}
              </p>
            )}
          </div>
        </section>

        {studentData && activeStudentId ? (
          <StudentDashboard
            studentId={activeStudentId}
            student={studentData}
            overviewData={data}
            onBack={handleClearSearch}
          />
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
};
