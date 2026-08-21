import { useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

const BINGEBASE_ACTIVATE_URL = 'https://bingebase.com/activate';

export function BingebaseSettingsSection({ userId, onAddCatalog, addToast }) {
  const [status, setStatus] = useState({ connected: false, username: '' });
  const [auth, setAuth] = useState(null);
  const [username, setUsername] = useState('');
  const [lists, setLists] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    if (!userId) return undefined;
    api.bingebaseStatus(userId)
      .then((value) => {
        setStatus(value);
        setUsername(value.username || '');
      })
      .catch(() => {});
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [userId]);

  const connect = async () => {
    try {
      const data = await api.bingebaseDeviceCode(userId);
      setAuth(data);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(async () => {
        try {
          const result = await api.bingebaseDeviceToken(userId, data.device_code);
          if (result.connected) {
            clearInterval(timer.current);
            timer.current = null;
            setStatus((current) => ({ ...current, connected: true }));
            setAuth(null);
            addToast?.('Bingebase connecté');
          }
        } catch {
          // Le polling continue tant que l'autorisation n'est pas terminée.
        }
      }, Math.max(3, data.interval || 5) * 1000);
    } catch (error) {
      addToast?.(error.message, 'error');
    }
  };

  const loadLists = async () => {
    try {
      const result = await api.bingebaseLists(userId, username);
      setLists(result.lists || []);
      setStatus((current) => ({ ...current, username }));
      if (!(result.lists || []).length) addToast?.('Aucune liste publique trouvée', 'info');
    } catch (error) {
      addToast?.(error.message, 'error');
    }
  };

  const add = (list) => {
    onAddCatalog?.({
      name: `Bingebase - ${list.name}`,
      type: 'movie',
      source: 'bingebase',
      enabled: true,
      filters: { bingebaseListUrl: list.url },
    });
    addToast?.(`Catalogue ajouté : ${list.name}`);
  };

  const copyCode = async () => {
    if (!auth?.user_code) return;
    try {
      await navigator.clipboard.writeText(auth.user_code);
      addToast?.('Code Bingebase copié');
    } catch {
      addToast?.('Impossible de copier le code', 'error');
    }
  };

  return (
    <div className="settings-card">
      <div className="settings-row">
        <div className="settings-row-info">
          <span className="settings-label">Compte Bingebase</span>
          <span className="settings-desc">
            Connexion officielle par code d’appareil. Aucun mot de passe Bingebase n’est stocké.
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
            <button className="btn btn-primary" onClick={connect}>Connecter Bingebase</button>
          )}
        </div>
      </div>

      {auth && (
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-label">Autorisation</span>
            <span className="settings-desc">
              Ouvrez la page d’activation Bingebase, connectez-vous puis saisissez ce code.
            </span>
            <a href={BINGEBASE_ACTIVATE_URL} target="_blank" rel="noreferrer" className="settings-link">
              Ouvrir bingebase.com/activate <ExternalLink size={13} />
            </a>
          </div>
          <div className="settings-row-control" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <strong style={{ fontSize: '1.25rem', letterSpacing: '0.12em' }}>{auth.user_code}</strong>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyCode} title="Copier le code">
              <Copy size={14} /> Copier
            </button>
          </div>
        </div>
      )}

      {status.connected && (
        <div className="settings-row">
          <div className="settings-row-info">
            <span className="settings-label">Listes Bingebase</span>
            <span className="settings-desc">Chargez vos listes publiques Bingebase pour les ajouter à Stremosaic.</span>
          </div>
          <div className="settings-row-control" style={{ display: 'flex', gap: '8px' }}>
            <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nom d’utilisateur Bingebase" />
            <button className="btn btn-secondary" onClick={loadLists}>Charger les listes</button>
          </div>
        </div>
      )}

      {lists.length > 0 && (
        <div className="settings-row" style={{ alignItems: 'stretch' }}>
          <div className="settings-row-info"><span className="settings-label">Listes disponibles</span></div>
          <div className="settings-row-control" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {lists.map((list) => (
              <button key={list.url || list.name} className="btn btn-secondary" onClick={() => add(list)}>
                Ajouter {list.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
