"use client";

import { useMemo, useState } from "react";
import { Header } from "@/modules/inicio/Header";
import { SearchBar } from "@/modules/inicio/SearchBar";
import { FreelancerGrid } from "@/modules/inicio/FreelancerGrid";
import { Pagination } from "@/ui/Pagination";
import { filterFreelancers, defaultFilters } from "@/lib/filterFreelancers";
import type { Freelancer, FreelancerFilters } from "@/types/freelancer";

const PAGE_SIZE = 16;

export function HomeClient({ freelancers }: { freelancers: Freelancer[] }) {
  const [filters, setFilters] = useState<FreelancerFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(freelancers.map((f) => f.category))).sort(),
    [freelancers],
  );
  const countries = useMemo(
    () => Array.from(new Set(freelancers.map((f) => f.country))).sort(),
    [freelancers],
  );

  const filtered = useMemo(
    () => filterFreelancers(freelancers, filters),
    [freelancers, filters],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageFreelancers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleFiltersChange(next: FreelancerFilters) {
    setFilters(next);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col items-center gap-6 px-6 py-8">
        <SearchBar
          filters={filters}
          onChange={handleFiltersChange}
          categories={categories}
          countries={countries}
        />
        <div className="w-full max-w-6xl">
          <FreelancerGrid freelancers={pageFreelancers} />
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}
