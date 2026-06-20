import { loadOverview } from "@/lib/data";
import { OverviewData } from "@shared/types/types";
import { useEffect, useState } from "react";

export const App = () => {
  const [overview, setOverview] = useState<OverviewData>();

  useEffect(() => {
    loadOverview()
      .then((data) => {
        setOverview(data);
      })
      .catch((error) => {
        console.error("Failed to load overview data:", error);
      });
  }, []);

  return (
    <div>
      <h1>Overview</h1>
    </div>
  );
};
