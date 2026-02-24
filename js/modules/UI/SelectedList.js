/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { DOM } from './DOM.js';
import { State } from '../State.js';

export const SelectedList = {
    renderSelectedList(selectedCourses, removeCallback) {
        let totalCredits = 0;
        const selectedCoursesList = DOM.getElement('selectedCoursesList');
        const creditCountBadge = DOM.getElement('creditCountBadge');

        if (selectedCourses.length === 0) {
            selectedCoursesList.innerHTML = '<p class="text-slate-400 italic">No hay cursos seleccionados.</p>';
        } else {
            selectedCoursesList.innerHTML = selectedCourses.map(s => {
                totalCredits += s.curso.creditos;
                const color = State.getColor(s.curso.codigo);
                return `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 group w-full md:w-auto flex-1 basis-80">
                    <div class="w-3 h-10 rounded-full shrink-0" style="background-color: ${color}"></div>
                    <div class="flex-grow min-w-0">
                        <p class="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">${s.curso.nombre}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Sección ${s.seccion.id} • ${s.curso.creditos} créditos</p>
                    </div>
                    <button class="remove-course-btn shrink-0 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10" data-code="${s.curso.codigo}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            }).join('');

            // Bind remove events
            selectedCoursesList.querySelectorAll('.remove-course-btn').forEach(btn => {
                btn.addEventListener('click', () => removeCallback(btn.dataset.code));
            });
        }

        creditCountBadge.textContent = `${totalCredits} créditos`;
        creditCountBadge.className = `px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm ${totalCredits > 22 ? 'bg-red-500' : 'bg-indigo-600'}`;
    }
};
