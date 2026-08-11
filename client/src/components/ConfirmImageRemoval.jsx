import ModalPortal from "./ModalPortal.jsx";

function ConfirmImageRemoval({ open, onCancel, onConfirm, busy = false }) {
  if (!open) return null;

  return (
    <ModalPortal>
      <div className="cm-modal-overlay" onClick={onCancel}>
        <div className="cm-modal" onClick={(event) => event.stopPropagation()}>
          <h3>Remove image?</h3>
          <p className="cm-hint">Are you sure you want to remove this image?</p>
          <div className="cm-btn-row">
            <button type="button" className="cm-btn cm-btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
            <button type="button" className="cm-btn cm-btn-danger-ghost" onClick={onConfirm} disabled={busy}>
              {busy ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default ConfirmImageRemoval;
