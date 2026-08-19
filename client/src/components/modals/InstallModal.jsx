import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import { logger } from '../../utils/logger';
import { SocialButtons } from '../social/SocialButtons.jsx';

export function InstallModal({ isOpen, onClose, installUrl, stremioUrl, onDonateClick }) {
  const [copied, setCopied] = useState(false);
  const modalRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const handleInstall = () => {
    if (stremioUrl) {
      window.location.href = stremioUrl;
      return;
    }
    const url = new URL(installUrl);
    url.protocol = 'stremio:';
    window.location.href = url.toString();
  };

  const manifestUrl = installUrl;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Installer votre addon"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Installer votre addon</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Votre configuration a été enregistrée ! Utilisez l’une de ces options pour ajouter vos
            catalogues personnalisés à Stremio.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <button
              className="btn btn-primary w-full"
              onClick={handleInstall}
              style={{ padding: '16px 24px', fontSize: '16px' }}
            >
              <Download size={20} />
              Installer dans Stremio
            </button>
            <p className="text-sm text-muted text-center" style={{ marginTop: '8px' }}>
              Ceci ouvrira Stremio pour installer l’addon
            </p>
          </div>

          <div className="install-link-box">
            <div className="install-link-label">URL du manifeste de l’addon</div>
            <div className="install-link">{manifestUrl}</div>
            <button
              className="btn btn-secondary btn-sm copy-button"
              onClick={() => handleCopy(manifestUrl)}
            >
              {copied ? (
                <>
                  <Check size={14} className="success-icon" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copier l’URL
                </>
              )}
            </button>
          </div>

          <div
            style={{
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginTop: '16px',
            }}
          >
            <p className="text-sm">
              <strong>Astuce :</strong> Vous pouvez toujours revenir sur cette page pour modifier vos
              catalogues. Stremio peut mettre en cache les données — si vos changements n’apparaissent pas, rafraîchissez les addons ou redémarrez Stremio.
            </p>
          </div>
          <div className="setup-support-row" style={{ marginTop: '24px' }}>
            <SocialButtons onDonateClick={onDonateClick} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
          <a
            href={`https://web.stremio.com/#/addons?addon=${encodeURIComponent(manifestUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Ouvrir Stremio Web
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
