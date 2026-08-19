import { useState } from 'react';
import { Key, Loader, ArrowRight, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { SocialButtons } from '../social/SocialButtons.jsx';
import { api } from '../../services/api';

export function ApiKeySetup({ onLogin, isSessionExpired = false, returnUserId = null }) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Veuillez saisir votre clé API TMDB');
      return;
    }
    if (!/^[a-f0-9]+$/i.test(trimmed)) {
      setError('La clé API doit contenir uniquement des caractères hexadécimaux (0-9, a-f)');
      return;
    }
    if (trimmed.length !== 32) {
      setError(`La clé API doit contenir 32 caractères (actuellement ${trimmed.length})`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.login(apiKey.trim(), returnUserId, rememberMe);
      if (result.token && onLogin) {
        onLogin(result.userId, result.configs || []);
      }
    } catch (err) {
      setError(err.message || 'Échec de l’authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-icon">
          <Key size={40} />
        </div>

        <h2>{isSessionExpired ? 'Session expirée' : 'Connexion'}</h2>
        <p>
          {isSessionExpired
            ? 'Votre session a expiré. Saisissez à nouveau votre clé API pour continuer.'
            : "Saisissez votre clé API TMDB pour accéder à Stremosaic et créer vos catalogues."}
        </p>

        <form className="api-key-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="apiKey">Clé API TMDB</label>
            <div className="input-wrapper">
              <Key size={18} className="input-icon input-icon-overlay" />
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                className={`input input-with-icons ${error ? 'error' : ''}`}
                placeholder="Saisissez votre clé API…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="input-toggle-btn"
                title={showApiKey ? 'Masquer la clé API' : 'Afficher la clé API'}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="input-hint">
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
              >
                Obtenir une clé API gratuite <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
              </a>
            </p>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="input-group mt-2">
            <label className="checkbox-label checkbox-flex">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              Se souvenir de moi
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Connexion…
              </>
            ) : (
              <>
                Continuer
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="setup-support-row">
            <SocialButtons />
          </div>
        </form>
      </div>
    </div>
  );
}
