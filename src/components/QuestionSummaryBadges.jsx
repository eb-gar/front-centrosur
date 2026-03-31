import React from "react";

export default function QuestionSummaryBadges({
  activeFilter,
  total,
  unclassified,
  live,
  activeCategory,
  activeCategoryTotal,
  categoryLabel,
}) {
  if (activeFilter === "DIRECTO") {
    return (
      <div className="questions-summary-badges" aria-live="polite">
        <span className="questions-summary-badge direct">
          En Directo: {live}
        </span>
      </div>
    );
  }

  if (activeFilter === "TODO") {
    return (
      <div className="questions-summary-badges" aria-live="polite">
        <span className="questions-summary-badge">Total: {total}</span>
        <span className="questions-summary-badge unclassified">
          Sin Clasificar: {unclassified}
        </span>
      </div>
    );
  }

  if (activeFilter === "SIN_CLASIFICAR") {
    return (
      <div className="questions-summary-badges" aria-live="polite">
        <span className="questions-summary-badge unclassified">
          Sin Clasificar: {unclassified}
        </span>
      </div>
    );
  }

  if (!activeCategory) {
    return null;
  }

  const label =
    typeof categoryLabel === "function"
      ? categoryLabel(activeCategory)
      : activeCategory.name;

  return (
    <div className="questions-summary-badges" aria-live="polite">
      <span
        className="questions-summary-badge category"
        style={{
          backgroundColor: `${activeCategory.color}22`,
          color: activeCategory.color,
          border: `1px solid ${activeCategory.color}`,
        }}
      >
        {label}: {activeCategoryTotal}
      </span>
    </div>
  );
}
