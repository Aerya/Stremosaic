export function MdblistFilterPanel({ localCatalog, onFiltersChange }) {
  const filters = localCatalog?.filters || {};
  return (
    <div className="settings-card">
      <div className="settings-row">
        <div className="settings-row-info">
          <span className="settings-label">Liste publique MDBList</span>
          <span className="settings-desc">
            Collez l’URL publique d’une liste MDBList. Seul le domaine mdblist.com est autorisé.
          </span>
        </div>
        <div className="settings-row-control" style={{ minWidth: '420px' }}>
          <input
            className="form-input"
            type="url"
            placeholder="https://mdblist.com/lists/utilisateur/ma-liste"
            value={filters.mdblistListUrl || ''}
            onChange={(event) =>
              onFiltersChange({ ...filters, mdblistListUrl: event.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
