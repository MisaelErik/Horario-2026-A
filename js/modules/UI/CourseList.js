/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { DOM } from './DOM.js';

export const CourseList = {
    romanToInt(s) {
        const map = { 'I': 1, 'V': 5, 'X': 10 };
        let result = 0;
        for (let i = 0; i < s.length; i++) {
            const current = map[s[i]];
            const next = map[s[i + 1]];
            if (next > current) {
                result += next - current;
                i++;
            } else {
                result += current;
            }
        }
        return result;
    },

    populateCycleFilter(coursesData) {
        const cycleFilter = DOM.getElement('cycleFilter');
        const cycles = [...new Set(coursesData.map(c => c.ciclo))].sort((a, b) => this.romanToInt(a) - this.romanToInt(b));
        cycleFilter.innerHTML = '<option value="">Todos los ciclos</option>';
        cycles.forEach(cycle => {
            const option = document.createElement('option');
            option.value = cycle;
            option.textContent = `Ciclo ${cycle}`;
            cycleFilter.appendChild(option);
        });
    },

    renderCourseList(coursesData, selectedCourses) {
        const cycleFilter = DOM.getElement('cycleFilter');
        const courseList = DOM.getElement('courseList');

        const selectedCycle = cycleFilter.value;
        let filtered = selectedCycle ? coursesData.filter(c => c.ciclo === selectedCycle) : coursesData;

        // Group by cycle
        const byCycle = filtered.reduce((acc, c) => {
            if (!acc[c.ciclo]) acc[c.ciclo] = [];
            acc[c.ciclo].push(c);
            return acc;
        }, {});

        // Save currently open cycles BEFORE updating innerHTML
        const currentlyOpenCycles = Array.from(courseList.querySelectorAll('.cycle-content:not(.hidden)'))
            .map(el => el.dataset.cycle);

        courseList.innerHTML = Object.keys(byCycle)
            .sort((a, b) => this.romanToInt(a) - this.romanToInt(b))
            .map(ciclo => {
                const coursesHTML = byCycle[ciclo].map(course => {
                    const sectionsHTML = course.secciones.map(section => {
                        const isSelected = selectedCourses.some(sc => sc.curso.codigo === course.codigo && sc.seccion.id === section.id);
                        return `
                        <label class="flex items-start px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors duration-150 gap-2.5 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}">
                            <input type="radio" 
                                   name="course-${course.codigo}" 
                                   value="${section.id}" 
                                   class="mt-0.5 form-radio h-3.5 w-3.5 text-indigo-600 transition duration-150 ease-in-out shrink-0" 
                                   ${isSelected ? 'checked' : ''}
                                   data-course-code="${course.codigo}"
                                   data-section-id="${section.id}">
                            <div class="text-xs w-full">
                                <p class="font-semibold text-slate-700 dark:text-slate-200 leading-tight">Sección ${section.id}</p>
                                <p class="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">${section.docente}</p>
                                <div class="mt-1 space-y-0.5">
                                    ${section.clases.map(c =>
                            `<div class="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                        <span class="font-semibold text-slate-500 dark:text-slate-400 w-7 shrink-0">${c.dia}</span>
                                        <span>${c.hora}</span>
                                        <span class="ml-auto bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">${c.aula}</span>
                                    </div>`
                        ).join('')}
                                </div>
                            </div>
                        </label>
                    `}).join('');

                    return `
                    <div class="border border-slate-100 dark:border-slate-700/60 rounded-xl overflow-hidden bg-white dark:bg-slate-800/60">
                        <div class="flex justify-between items-start px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80">
                            <div class="min-w-0 mr-2">
                                <p class="font-semibold text-slate-700 dark:text-slate-200 text-xs leading-snug">${course.nombre}</p>
                                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">CODE: ${course.codigo}</p>
                            </div>
                            <span class="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-md shrink-0">${course.creditos} Cr.</span>
                        </div>
                        <div class="divide-y divide-slate-100 dark:divide-slate-700/40">${sectionsHTML}</div>
                    </div>
                `;
                }).join('');

                const isCycleOpen = currentlyOpenCycles.includes(ciclo) || selectedCycle;

                return `
                <div class="mb-1">
                    <button class="w-full px-3 py-2 rounded-lg flex justify-between items-center transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-700/30 cycle-toggle text-left">
                        <span class="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Ciclo ${ciclo}</span>
                        <svg class="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0" style="transform: rotate(${isCycleOpen ? 180 : 0}deg)" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div class="space-y-1.5 pt-1 pb-1 ${isCycleOpen ? '' : 'hidden'} cycle-content" data-cycle="${ciclo}">
                        ${coursesHTML}
                    </div>
                </div>
            `;
            }).join('');

        // Re-attach toggle listeners
        document.querySelectorAll('.cycle-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const content = e.currentTarget.nextElementSibling;
                const icon = e.currentTarget.querySelector('svg');
                content.classList.toggle('hidden');
                icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        });
    }
};
