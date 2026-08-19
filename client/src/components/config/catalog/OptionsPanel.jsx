import { memo } from 'react';
import { Checkbox } from '../../forms/Checkbox';

export const OptionsPanel = memo(function OptionsPanel({ localCatalog, onFiltersChange, isMovie }) {
  const filters = localCatalog?.filters || {};

  return (
    <div className="checkbox-grid">
      <Checkbox
        checked={!!filters.includeAdult}
        onChange={(checked) => onFiltersChange('includeAdult', checked || undefined)}
        label="Inclure le contenu adulte"
        tooltip="Inclure le contenu adulte/18+ dans les résultats. Désactivé par défaut."
      />

      {isMovie && (
        <Checkbox
          checked={!!filters.includeVideo}
          onChange={(checked) => onFiltersChange('includeVideo', checked || undefined)}
          label="Inclure le contenu vidéo"
          tooltip="Inclure les titres marqués comme contenus vidéo dans TMDB."
        />
      )}

      <Checkbox
        checked={!!filters.randomize}
        onChange={(checked) => onFiltersChange('randomize', checked || undefined)}
        label="Résultats aléatoires"
        tooltip="Charger une page aléatoire parmi les résultats correspondants et les mélanger."
      />

      <Checkbox
        checked={!!filters.discoverOnly}
        onChange={(checked) => onFiltersChange('discoverOnly', checked || undefined)}
        label="Découverte uniquement"
        tooltip="Masquer ce catalogue de l’accueil. Il apparaîtra uniquement dans l’onglet Découvrir."
      />

      {!isMovie && (
        <Checkbox
          checked={!!filters.includeNullFirstAirDates}
          onChange={(checked) => onFiltersChange('includeNullFirstAirDates', checked || undefined)}
          label="Inclure les dates de diffusion inconnues"
          tooltip="Inclure les séries sans date de première diffusion connue."
        />
      )}

      {!isMovie && (
        <Checkbox
          checked={!!filters.screenedTheatrically}
          onChange={(checked) => onFiltersChange('screenedTheatrically', checked || undefined)}
          label="Projeté en salle"
          tooltip="Inclure les séries ayant été projetées au cinéma."
        />
      )}
    </div>
  );
});
