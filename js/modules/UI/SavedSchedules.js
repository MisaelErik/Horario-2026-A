/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { DOM } from './DOM.js';

export const SavedSchedules = {
    renderSavedSchedules(schedules, events) {
        const savedSchedulesList = DOM.getElement('savedSchedulesList');

        if (schedules.length === 0) {
            savedSchedulesList.innerHTML = '<p class="text-slate-500 dark:text-slate-400 col-span-full text-center p-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm border-dashed text-lg font-medium">Aún no has guardado ningún horario.</p>';
            return;
        }

        savedSchedulesList.innerHTML = schedules.map(s => `
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group flex flex-col h-full">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-bold text-lg text-slate-800 dark:text-slate-100 truncate flex-1" title="${s.name}">${s.name}</h4>
                    <span class="text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md ml-2">${new Date(s.id).toLocaleDateString()}</span>
                </div>
                <div class="aspect-video bg-slate-50 dark:bg-slate-900 rounded-xl mb-4 overflow-hidden border border-slate-100 dark:border-slate-700 relative">
                    <img src="${s.thumbnail}" alt="Preview" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="load-btn bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-slate-50 flex items-center gap-2" data-id="${s.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Cargar
                        </button>
                    </div>
                </div>
                <button class="delete-btn mt-auto w-full py-2.5 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/30 flex items-center justify-center gap-2" data-id="${s.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Eliminar
                </button>
            </div>
        `).join('');

        savedSchedulesList.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', () => events.load(Number(btn.dataset.id)));
        });

        savedSchedulesList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => events.delete(Number(btn.dataset.id)));
        });
    }
};
