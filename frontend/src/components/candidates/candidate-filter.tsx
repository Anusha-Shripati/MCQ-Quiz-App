"use client";

interface CandidateFilterProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

export default function CandidateFilter({
  selectedFilter,
  setSelectedFilter,
}: CandidateFilterProps) {
  const handleFilterChange = (filterType: string) => {
    console.log("filterType", filterType);

    setSelectedFilter(filterType);
    console.log(`Selected filter: ${filterType}`);
  };

  return (
    <div className="flex justify-end space-x-4">
      {["Day", "Week", "Month", "Last 30 days", "All"].map((filterType) => (
        <button
          key={filterType}
          className={`px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-all duration-200 ease-in-out ${
            selectedFilter === filterType
              ? "bg-primary/90 scale-95"
              : "hover:bg-primary/80"
          }`}
          onClick={() => handleFilterChange(filterType)}
        >
          {filterType}
        </button>
      ))}
    </div>
  );
}
