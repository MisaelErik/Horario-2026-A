/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { DOM } from './DOM.js';
import { State } from '../State.js';
import { TimeUtils } from '../TimeUtils.js';

export const ScheduleGrid = {
    _startHour: 8,
    _pixelsPerMinute: 0.9,

    renderScheduleGrid(startHour = 8, endHour = 23) {
        const scheduleBody = DOM.getElement('scheduleBody');
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const pixelsPerMinute = 0.9;

        scheduleBody.innerHTML = '';
        this._startHour = startHour;
        this._pixelsPerMinute = pixelsPerMinute;

        for (let hour = startHour; hour < endHour; hour++) {
            const row = document.createElement('tr');

            // Time cell
            const timeCell = document.createElement('td');
            timeCell.className = 'border-b border-slate-100 dark:border-slate-800/60 p-2 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 sticky left-0 bg-white/90 dark:bg-[#1a1f2e]/90 backdrop-blur-sm z-10 text-right align-top min-w-[60px] select-none';
            timeCell.style.height = `${60 * pixelsPerMinute}px`;
            timeCell.innerHTML = `<span class="text-sm font-bold">${String(hour).padStart(2, '0')}<span class="text-xs font-normal text-slate-400 dark:text-slate-500">:00</span></span>`;
            row.appendChild(timeCell);

            days.forEach(() => {
                const cell = document.createElement('td');
                cell.className = 'border-b border-l border-slate-100 dark:border-slate-800/60 relative time-slot hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-150';
                row.appendChild(cell);
            });
            scheduleBody.appendChild(row);
        }
    },

    getScheduleBounds(selectedCourses) {
        if (selectedCourses.length === 0) return { start: 8, end: 23 };

        let earliest = 23;
        let latest = 8;

        selectedCourses.forEach(({ seccion }) => {
            seccion.clases.forEach(clase => {
                const range = TimeUtils.parseTimeRange(clase.hora);
                const startHour = Math.floor(range.start / 60);
                const endHour = Math.ceil(range.end / 60);

                if (startHour < earliest) earliest = startHour;
                if (endHour > latest) latest = endHour;
            });
        });

        // Margen de seguridad y límites
        const start = Math.max(0, earliest);
        const end = Math.min(24, latest);

        return { start, end: end <= start ? start + 1 : end };
    },

    getEarliestHour(selectedCourses) {
        return this.getScheduleBounds(selectedCourses).start;
    },

    renderScheduleEvents(selectedCourses) {
        // Clear previous events
        document.querySelectorAll('.class-block').forEach(el => el.remove());

        const scheduleBody = DOM.getElement('scheduleBody');
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const startHour = this._startHour || 8;
        const pixelsPerMinute = this._pixelsPerMinute || 0.9;

        // Group all classes by day to allow merging adjacent blocks from same course
        const dayMap = {}; // dayIndex -> [{curso, seccion, clase, range}]
        days.forEach((_, i) => dayMap[i] = []);

        selectedCourses.forEach(selected => {
            const { curso, seccion } = selected;
            seccion.clases.forEach(clase => {
                const range = TimeUtils.parseTimeRange(clase.hora);
                const dayIndex = days.indexOf(clase.dia);
                if (dayIndex === -1) return;
                dayMap[dayIndex].push({ curso, seccion, clase, range });
            });
        });

        // For each day, sort by start time then merge adjacent blocks from same course
        Object.entries(dayMap).forEach(([dayIndexStr, items]) => {
            const dayIndex = parseInt(dayIndexStr);
            if (items.length === 0) return;

            // Sort by start time
            items.sort((a, b) => a.range.start - b.range.start);

            // Merge consecutive blocks from the same course
            const merged = [];
            items.forEach(item => {
                const last = merged[merged.length - 1];
                if (last && last.curso.codigo === item.curso.codigo && last.mergedEnd === item.range.start) {
                    // Extend the last block
                    last.mergedEnd = item.range.end;
                    last.aulas.push(item.clase.aula);
                } else {
                    merged.push({
                        curso: item.curso,
                        seccion: item.seccion,
                        clase: item.clase,
                        mergedStart: item.range.start,
                        mergedEnd: item.range.end,
                        aulas: [item.clase.aula],
                    });
                }
            });

            merged.forEach(block => {
                const { curso, seccion, clase, mergedStart, mergedEnd, aulas } = block;
                const isDark = document.documentElement.classList.contains('dark');
                const color = State.getColor(curso.codigo);
                const borderColor = State.darkenColor(color, isDark ? 40 : -40);
                const textColor = isDark ? '#f8fafc' : State.darkenColor(color, -100);

                const top = (mergedStart - startHour * 60) * pixelsPerMinute;
                const height = (mergedEnd - mergedStart) * pixelsPerMinute;

                const blockEl = document.createElement('div');
                blockEl.className = 'class-block absolute left-0.5 right-0.5 rounded-lg p-1.5 text-xs border-l-[3px] shadow-sm hover:shadow-md transition-all duration-200 z-20 cursor-pointer overflow-hidden';
                blockEl.style.top = `${top}px`;
                blockEl.style.height = `${height}px`;
                blockEl.style.backgroundColor = color;
                blockEl.style.borderColor = borderColor;
                blockEl.style.color = textColor;
                blockEl.style.minHeight = '35px';

                const durationMin = mergedEnd - mergedStart;
                const aulaText = [...new Set(aulas)].join(', ');
                const seccion_id = seccion.id;

                const formatTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
                const horaDisplay = `${formatTime(mergedStart)} a ${formatTime(mergedEnd)}`;

                blockEl.innerHTML = `
                    <div class="flex flex-col h-full justify-center items-center text-center gap-0 overflow-hidden">
                        <strong class="font-bold leading-[1.1] text-[9px] sm:text-[10px] block w-full" style="white-space: normal; word-break: break-all;">${curso.nombre}</strong>
                        ${durationMin > 45 ? `<span class="text-[8.5px] sm:text-[9px] font-semibold opacity-90 leading-tight truncate w-full">${aulaText} • S. ${seccion_id}</span>` : ''}
                        ${durationMin > 80 ? `<span class="text-[7.5px] sm:text-[8px] opacity-80 leading-[1.1] mt-0.5">${seccion.docente}</span>` : ''}
                        ${durationMin > 100 ? `<span class="text-[8px] sm:text-[9px] opacity-80 mt-0.5">${horaDisplay}</span>` : ''}
                    </div>
                `;

                const targetCell = scheduleBody.rows[0]?.cells[dayIndex + 1];
                if (targetCell) {
                    targetCell.appendChild(blockEl);
                }
            });
        });
    }
};
