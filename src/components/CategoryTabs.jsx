import React from "react";

export default function CategoryTabs({
  tabs,
  categories,
  activeFilter,
  onChangeFilter,
  categoryLabel,
  activeCategoryTextColor,
  withUnclassified = false,
  className = "",
  rightContent = null,
}) {
  return (
    <div className={`tabs-bar ${className}`.trim()}>
      <div className="tabs-left">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={activeFilter === tab.value ? "active" : ""}
            onClick={() => onChangeFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}

        {categories.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              className={isActive ? "active" : ""}
              onClick={() => onChangeFilter(cat.id)}
              style={
                isActive
                  ? {
                      backgroundColor: cat.color,
                      color: activeCategoryTextColor
                        ? activeCategoryTextColor(cat)
                        : "#ffffff",
                      borderColor: cat.color,
                    }
                  : {
                      backgroundColor: `${cat.color}14`,
                      color: cat.color,
                      borderColor: `${cat.color}66`,
                    }
              }
            >
              {categoryLabel(cat)}
            </button>
          );
        })}

        {withUnclassified && (
          <button
            className={`btn-unclassified ${activeFilter === "SIN_CLASIFICAR" ? "active" : ""}`}
            onClick={() => onChangeFilter("SIN_CLASIFICAR")}
          >
            Sin Clasificar
          </button>
        )}
      </div>

      {rightContent}
    </div>
  );
}
