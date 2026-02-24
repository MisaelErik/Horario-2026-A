/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
export const Toasts = {
    showToast(message, type = 'success', isImportant = false) {
        // En móviles, solo mostrar mensajes importantes (descargas, errores críticos)
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !isImportant) return;

        const toast = document.createElement('div');
        // Ajuste de estilo en móviles para que tape menos: más pequeño y centrado
        const mobileClasses = isMobile ? 'left-1/2 -translate-x-1/2 bottom-10 w-[90%] max-w-[300px] text-center text-sm px-4 py-2' : 'bottom-4 right-4 px-6 py-3';
        const typeClasses = type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
            type === 'info' ? 'bg-indigo-600' : 'bg-red-500';

        toast.className = `fixed ${mobileClasses} rounded-xl text-white font-bold shadow-xl transform translate-y-20 opacity-0 transition-all duration-300 z-50 flex items-center justify-center gap-2 ${typeClasses}`;
        toast.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-20', 'opacity-0');
            if (isMobile) toast.classList.add('-translate-x-1/2');
        });

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, isImportant ? 4000 : 3000); // Dar más tiempo a los importantes
    }
};
