import { Heart, Coffee } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';

export function DonateModal({ isOpen, onClose }) {
  const modalRef = useModalA11y(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal donate-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Soutenir le projet" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <Heart size={22} />
          <div><h2 className="modal-title">Soutenir Stremosaic</h2><p className="text-secondary">Merci pour votre soutien ❤️</p></div>
        </div>
        <div className="modal-body">
          <a href="https://ko-fi.com/upandclear" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}><Coffee size={18}/> Ko-fi / UpAndClear</a>
        </div>
      </div>
    </div>
  );
}
