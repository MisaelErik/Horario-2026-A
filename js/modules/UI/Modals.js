/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { DOM } from './DOM.js';

export const Modals = {
    showConflictModal(message, onReplace, onCancel) {
        const conflictMessage = DOM.getElement('conflictMessage');
        const conflictModal = DOM.getElement('conflictModal');
        const modalContent = DOM.getElement('modalContent');

        conflictMessage.textContent = message;
        conflictModal.classList.remove('hidden');
        conflictModal.classList.add('flex');

        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);

        const replaceBtn = document.getElementById('replace-course-btn');
        const cancelBtn = document.getElementById('cancel-conflict-btn');

        // Clone to remove old listeners
        const newReplace = replaceBtn.cloneNode(true);
        const newCancel = cancelBtn.cloneNode(true);

        replaceBtn.parentNode.replaceChild(newReplace, replaceBtn);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

        newReplace.addEventListener('click', () => {
            onReplace();
            this.closeModal();
        });

        newCancel.addEventListener('click', () => {
            onCancel();
            this.closeModal();
        });
    },

    closeModal() {
        const conflictModal = DOM.getElement('conflictModal');
        const modalContent = DOM.getElement('modalContent');

        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            conflictModal.classList.add('hidden');
            conflictModal.classList.remove('flex');
        }, 200);
    }
};
