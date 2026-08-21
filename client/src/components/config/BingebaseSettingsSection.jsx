import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';

export function BingebaseSettingsSection({ userId, onAddCatalog, addToast }) {
  const [status, setStatus] = useState({ connected: false, username: '' });
  const [username, setUsername] = useState('');
  const [lists, setLists] = useState([]);
  const [auth, setAuth] = useState(null);
  const timer = useRef(null);
  useEffect(() => {
    if (!userId) return;
    api
      .bingebaseStatus(userId)
      .then((s) => {
        setStatus(s);
        setUsername(s.username || '');
      })
      .catch(() => {});
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [userId]);
  const connect = async () => {
    try {
      const d = await api.bingebaseDeviceCode(userId);
      setAuth(d);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(
        async () => {
          try {
            const r = await api.bingebaseDeviceToken(userId, d.device_code);
            if (r.connected) {
              clearInterval(timer.current);
              timer.current = null;
              setStatus((x) => ({ ...x, connected: true }));
              setAuth(null);
              addToast?.('Bingebase connecté');
            }
          } catch {
            /* Le device-code peut rester en attente jusqu'à son autorisation. */
          }
        },
        Math.max(3, d.interval || 5) * 1000
      );
    } catch (e) {
      addToast?.(e.message, 'error');
    }
  };
  const loadLists = async () => {
    try {
      const r = await api.bingebaseLists(userId, username);
      setLists(r.lists || []);
      setStatus((x) => ({ ...x, username }));
      if (!(r.lists || []).length) addToast?.('Aucune liste publique trouvée', 'info');
    } catch (e) {
      addToast?.(e.message, 'error');
    }
  };
  const add = (l) => {
    onAddCatalog?.({
      name: `Bingebase - ${l.name}`,
      type: 'movie',
      source: 'bingebase',
      enabled: true,
      filters: { bingebaseListUrl: l.url },
    });
    addToast?.(`Catalogue ajouté : ${l.name}`);
  };
  return (
    <div className="settings-card">
      <div className="settings-row">
        <div className="settings-row-info">
          <span className="settings-label">Compte Bingebase</span>
          <span className="settings-desc">
            Connexion officielle par device-code. Aucun mot de passe Bingebase n'est stocké.
          </span>
        </div>
        <div className="settings-row-control">
          {status.connected ? (
            <button
              className="btn"
              onClick={async () => {
                await api.bingebaseDisconnect(userId);
                setStatus({ connected: false, username: '' });
                setLists([]);
              }}
            >
              Déconnecter
            </button>
          ) : (
            <button className="btn btn-primary" onClick={connect}>
              Connecter Bingebase
            </button>
          )}
        </div>
      </div>
      {auth && (
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-label">Autorisation</span>
            <span className="settings-desc">Ouvre bingebase.com/activate et saisis le code.</span>
          </div>
          <div className="settings-row-control">
            <strong style={{ fontSize: '1.25rem', letterSpacing: '0.12em' }}>
              {auth.user_code}
            </strong>
          </div>
        </div>
      )}
      <div className="settings-row">
        <div className="settings-row-info">
          <span className="settings-label">Listes publiques du profil</span>
          <span className="settings-desc">
            Nom d'utilisateur Bingebase, puis charge les listes visibles publiquement.
          </span>
        </div>
        <div className="settings-row-control" style={{ display: 'flex', gap: '8px' }}>
          <input
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
          <button className="btn" onClick={loadLists} disabled={!username.trim()}>
            Charger
          </button>
        </div>
      </div>
      {lists.length > 0 && (
        <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
          {lists.map((l) => (
            <div key={l.url} className="settings-row">
              <div className="settings-row-info">
                <span className="settings-label">{l.name}</span>
                <span className="settings-desc">{l.url}</span>
              </div>
              <button className="btn" onClick={() => add(l)}>
                Ajouter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
