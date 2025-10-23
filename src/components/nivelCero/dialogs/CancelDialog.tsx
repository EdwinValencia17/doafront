// src/components/nivelcero/dialogs/CancelDialog.tsx
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export function CancelDialog({
  visible, numOrden, onConfirm, onHide,
}: { visible: boolean; numOrden?: string | null; onConfirm: () => void; onHide: () => void; }) {
  return (
    <Dialog header="Confirmación" visible={visible} onHide={onHide}>
      <p>¿Cancelar la orden <b>{numOrden || '-'}</b>?</p>
      <div className="flex gap-2 justify-end mt-3">
        <Button label="Continuar" onClick={onConfirm} className="p-button-danger" />
        <Button label="Cerrar" onClick={onHide} className="p-button-text" />
      </div>
    </Dialog>
  );
}
