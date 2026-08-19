import { memo, useState } from 'react';
import { X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { SmoothExpand } from '../../layout/SmoothExpand';

export const ActiveFiltersBar = memo(function ActiveFiltersBar({
  activeFilters,
  onClearFilter,
  onClearAll,
  onToggleSection,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasFilters = activeFilters.length > 0;

  return (
    <SmoothExpand show={hasFilters}>
      <div className="active-filters-bar">
        <div className="active-filters-header">
          <button
            type="button"
            className="active-filters-title-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            aria-label="Toggle active filters"
          >
            <span className="active-filters-title">Filtres actifs</span>
            <span
              className="filter-count-badge"
              style={{ transform: 'scale(0.8)', marginLeft: '-4px' }}
            >
              {activeFilters.length}
            </span>
            {isCollapsed ? (
              <ChevronDown size={14} className="collapse-icon" />
            ) : (
              <ChevronUp size={14} className="collapse-icon" />
            )}
          </button>
          <button
            type="button"
            className="clear-all-btn"
            onClick={onClearAll}
            title="Effacer tous les filtres"
          >
            <Trash2 size={14} />
            <span>Effacer</span>
          </button>
        </div>
        <SmoothExpand show={!isCollapsed}>
          <div className="active-filters-chips" style={{ paddingTop: '12px' }}>
            {activeFilters.map((filter) => (
              <div key={filter.key} className="active-filter-chip" data-section={filter.section}>
                <button
                  type="button"
                  className="active-filter-chip-label"
                  onClick={() => onToggleSection(filter.section)}
                  aria-label={`Afficher la section ${filter.label}`}
                >
                  {filter.label}
                </button>
                <button
                  type="button"
                  className="chip-remove"
                  aria-label={`Supprimer le filtre ${filter.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearFilter(filter.key);
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </SmoothExpand>
      </div>
    </SmoothExpand>
  );
});
