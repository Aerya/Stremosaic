import { memo } from 'react';
import { SearchInput } from '../../forms/SearchInput';
import { LabelWithTooltip } from '../../forms/Tooltip';

export const PeopleFilters = memo(function PeopleFilters({
  selectedPeople,
  onSelectPeople,
  selectedCompanies,
  onSelectCompanies,
  selectedKeywords,
  onSelectKeywords,
  excludeKeywords,
  onExcludeKeywords,
  excludeCompanies,
  onExcludeCompanies,
  searchPerson,
  searchCompany,
  searchKeyword,
  showPeople = true,
}) {
  return (
    <div className="filter-stack">
      {showPeople && (
        <div className="filter-group">
          <LabelWithTooltip
            label="Casting & Équipe"
            tooltip="Recherchez du contenu avec des acteurs, réalisateurs ou scénaristes spécifiques."
          />
          <SearchInput
            type="person"
            placeholder="Rechercher des acteurs, réalisateurs..."
            onSearch={searchPerson}
            selectedItems={selectedPeople}
            onSelect={onSelectPeople}
            onRemove={onSelectPeople}
          />
        </div>
      )}
      <div className="filter-group">
        <LabelWithTooltip
          label="Studios / Sociétés de production"
          tooltip="Filtrer par sociétés de production (ex. Warner Bros, Pixar)."
        />
        <SearchInput
          type="company"
          placeholder="Rechercher des sociétés de production..."
          onSearch={searchCompany}
          selectedItems={selectedCompanies}
          onSelect={onSelectCompanies}
          onRemove={onSelectCompanies}
        />
      </div>
      <div className="filter-group">
        <LabelWithTooltip
          label="Mots-clés / Tags"
          tooltip="Rechercher par thèmes ou sujets (ex. 'voyage dans le temps')."
        />
        <SearchInput
          type="keyword"
          placeholder="Rechercher des mots-clés à inclure..."
          onSearch={searchKeyword}
          selectedItems={selectedKeywords}
          onSelect={onSelectKeywords}
          onRemove={onSelectKeywords}
        />
      </div>
      <div className="filter-group">
        <LabelWithTooltip
          label="Exclure des mots-clés"
          tooltip="Exclure le contenu comportant ces thèmes."
        />
        <span className="filter-label-hint">Les résultats ne contiendront pas ces mots-clés</span>
        <SearchInput
          type="keyword"
          placeholder="Rechercher des mots-clés à exclure..."
          onSearch={searchKeyword}
          selectedItems={excludeKeywords}
          onSelect={onExcludeKeywords}
          onRemove={onExcludeKeywords}
        />
      </div>
      <div className="filter-group">
        <LabelWithTooltip
          label="Exclure des studios"
          tooltip="Exclure le contenu de certains studios."
        />
        <span className="filter-label-hint">Exclure le contenu de ces studios</span>
        <SearchInput
          type="company"
          placeholder="Rechercher des sociétés à exclure..."
          onSearch={searchCompany}
          selectedItems={excludeCompanies}
          onSelect={onExcludeCompanies}
          onRemove={onExcludeCompanies}
        />
      </div>
    </div>
  );
});
