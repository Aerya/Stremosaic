import { AlertTriangle, Home, LogIn } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';

export function ConfigMismatchModal({ isOpen, onGoToOwn, onLoginNew }) {
  const modalRef = useModalA11y(isOpen, onGoToOwn);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Accès restreint"
        style={{ maxWidth: '450px' }}
      >
        <div className="modal-header">
          <div className="modal-icon warning">
            <AlertTriangle size={24} />
          </div>
          <h2 className="modal-title">Accès restreint</h2>
        </div>

        <div className="modal-body">
          <p className="text-secondary" style={{ marginBottom: '20px', lineHeight: '1.5' }}>
            Cette configuration a été créée avec une autre clé API TMDB. Pour des raisons de sécurité, vous pouvez accéder uniquement aux configurations associées à votre clé API actuelle.
          </p>

          <div className="alert alert-info" style={{ marginBottom: '24px' }}>
            <strong>Que souhaitez-vous faire ?</strong>
          </div>
        </div>

        <div
          className="modal-footer"
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onGoToOwn}
          >
            <Home size={18} />
            Aller à mes configurations
          </button>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onLoginNew}
          >
            <LogIn size={18} />
            Se connecter avec une autre clé
          </button>
        </div>
      </div>
    </div>
  );
}
