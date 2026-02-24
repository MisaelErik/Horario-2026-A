import { State } from './State.js';
import { TimeUtils } from './TimeUtils.js';
import { UI } from './UI.js';

export const Export = {
    _isInAppBrowser() {
        const rules = ['FBAV', 'FBAN', 'Instagram', 'WhatsApp', 'Snapchat', 'Line', 'Threads', 'LinkedInApp', 'TikTok', 'Twitter', 'WebView'];
        return rules.some(rule => navigator.userAgent.includes(rule));
    },

    _handleBrowserSupport() {
        if (this._isInAppBrowser()) {
            UI.showToast("Las descargas no son compatibles en este navegador. Abre la página en Chrome, Safari o tu navegador principal.", "error", true);
            return false;
        }
        return true;
    },

    async downloadSchedule(format, scheduleContainerId) {
        if (!this._handleBrowserSupport()) return;

        const selectedCourses = State.getSelectedCourses();
        if (selectedCourses.length === 0) {
            UI.showToast("No hay cursos seleccionados para exportar.", "error", true);
            return;
        }

        const studentName = prompt("Ingresa tu nombre para el horario (opcional):");
        const { start: earliestHour, end: endHour } = UI.getScheduleBounds(selectedCourses);
        const isDarkMode = document.documentElement.classList.contains('dark');

        // Paleta de colores según tema
        const theme = {
            bg: isDarkMode ? '#0f172a' : '#ffffff',
            text: isDarkMode ? '#f8fafc' : '#0f172a',
            subtext: isDarkMode ? '#94a3b8' : '#64748b',
            border: isDarkMode ? '#1e293b' : '#e2e8f0',
            rowBg: isDarkMode ? '#1e293b' : '#f8fafc',
            accent: isDarkMode ? '#818cf8' : '#4f46e5',
            accentBg: isDarkMode ? '#312e81' : '#eef2ff'
        };

        const printContainer = document.createElement('div');
        printContainer.className = isDarkMode ? 'dark' : '';

        const totalWidth = 1200;
        const paddingX = 60;
        const tableWidth = totalWidth - (paddingX * 2);
        const hourColWidth = 70;
        const dayColWidth = (tableWidth - hourColWidth) / 6;
        const pixelsPerMinute = 1.0;
        const headerRowHeight = 50;

        Object.assign(printContainer.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: `${totalWidth}px`,
            padding: `40px ${paddingX}px`,
            backgroundColor: theme.bg,
            color: theme.text,
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        });

        // Header decorativo
        const customHeader = document.createElement('div');
        customHeader.style.cssText = `text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${theme.border}; padding-bottom: 20px;`;
        customHeader.innerHTML = `
            <h1 style="font-size: 34px; font-weight: 800; color: ${theme.text}; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;">
                Planificador de Horarios 2026-A
            </h1>
            <p style="font-size: 16px; font-weight: 600; color: ${theme.subtext}; margin-top: 5px;">
                FACULTAD DE CIENCIAS ADMINISTRATIVAS - UNAC
            </p>
            ${studentName ? `<div style="margin-top: 15px; font-size: 20px; font-weight: 700; color: ${theme.accent}; background: ${theme.accentBg}; display: inline-block; padding: 5px 20px; border-radius: 99px;">Estudiante: ${studentName}</div>` : ''}
        `;
        printContainer.appendChild(customHeader);

        const scheduleWrapper = document.createElement('div');
        scheduleWrapper.style.position = 'relative';

        const table = document.createElement('table');
        table.style.cssText = `width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid ${theme.border}; background: ${theme.bg};`;

        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        const thead = document.createElement('thead');
        const htr = document.createElement('tr');
        htr.style.height = `${headerRowHeight}px`;
        htr.style.backgroundColor = theme.rowBg;

        const thHour = document.createElement('th');
        thHour.textContent = 'HORA';
        thHour.style.cssText = `width: ${hourColWidth}px; border: 1px solid ${theme.border}; font-size: 11px; font-weight: 800; color: ${theme.subtext};`;
        htr.appendChild(thHour);

        days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            th.style.cssText = `border: 1px solid ${theme.border}; font-size: 12px; font-weight: 700; color: ${theme.subtext}; text-transform: uppercase;`;
            htr.appendChild(th);
        });
        thead.appendChild(htr);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let h = earliestHour; h < endHour; h++) {
            const tr = document.createElement('tr');
            tr.style.height = `${60 * pixelsPerMinute}px`;

            const tdHour = document.createElement('td');
            tdHour.textContent = `${String(h).padStart(2, '0')}:00`;
            tdHour.style.cssText = `border: 1px solid ${theme.border}; background-color: ${theme.rowBg}; text-align: center; vertical-align: top; padding-top: 5px; font-size: 11px; font-weight: 700; color: ${theme.subtext};`;
            tr.appendChild(tdHour);

            for (let d = 0; d < 6; d++) {
                const td = document.createElement('td');
                td.style.border = `1px solid ${isDarkMode ? '#1e293b' : '#f1f5f9'}`;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        scheduleWrapper.appendChild(table);

        selectedCourses.forEach(selected => {
            const { curso, seccion } = selected;
            const color = State.getColor(curso.codigo); // Usa el tema actual
            const borderColor = State.darkenColor(color, isDarkMode ? 30 : -30);
            const textColor = isDarkMode ? '#f8fafc' : State.darkenColor(color, -100);

            seccion.clases.forEach(clase => {
                const range = TimeUtils.parseTimeRange(clase.hora);
                const dayIndex = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].indexOf(clase.dia);
                if (dayIndex === -1) return;

                const topPos = (range.start - earliestHour * 60) * pixelsPerMinute + headerRowHeight;
                const heightPos = (range.end - range.start) * pixelsPerMinute;
                const leftPos = hourColWidth + (dayIndex * dayColWidth);

                const eventEl = document.createElement('div');
                eventEl.style.cssText = `
                    position: absolute;
                    top: ${topPos}px;
                    left: ${leftPos}px;
                    width: ${dayColWidth - 4}px;
                    height: ${heightPos - 2}px;
                    margin: 1px 2px;
                    background-color: ${color};
                    border-left: 4px solid ${borderColor};
                    padding: 6px 4px;
                    box-sizing: border-box;
                    border-radius: 6px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    overflow: hidden;
                    z-index: 10;
                `;

                eventEl.innerHTML = `
                    <div style="font-size: 10px; font-weight: 800; color: ${textColor}; line-height: 1.1; margin-bottom: 2px;">${curso.nombre}</div>
                    <div style="font-size: 8.5px; font-weight: 700; color: ${textColor}; opacity: 0.9;">${clase.aula} • Sec. ${seccion.id}</div>
                    <div style="font-size: 8px; font-weight: 600; color: ${textColor}; opacity: 0.8; margin-top: 1px;">${clase.hora}</div>
                `;
                scheduleWrapper.appendChild(eventEl);
            });
        });

        printContainer.appendChild(scheduleWrapper);
        document.body.appendChild(printContainer);

        await new Promise(r => setTimeout(r, 600));

        try {
            const canvas = await window.html2canvas(printContainer, {
                scale: 2,
                backgroundColor: theme.bg,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    if (isDarkMode) {
                        clonedDoc.documentElement.classList.add('dark');
                        clonedDoc.body.classList.add('dark');
                    } else {
                        clonedDoc.documentElement.classList.remove('dark');
                        clonedDoc.body.classList.remove('dark');
                    }
                }
            });

            const fileName = `Horario_2026A_${studentName ? studentName.replace(/\s+/g, '_') : 'UNAC'}`;

            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${fileName}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            } else if (format === 'pdf') {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${fileName}.pdf`);
            }
        } catch (err) {
            console.error(err);
            UI.showToast('Error al exportar el horario', 'error', true);
        } finally {
            document.body.removeChild(printContainer);
        }
    },

    downloadExcel() {
        if (!this._handleBrowserSupport()) return;

        const selectedCourses = State.getSelectedCourses();
        if (selectedCourses.length === 0) {
            UI.showToast("No hay cursos seleccionados para exportar.", "error", true);
            return;
        }

        const { start: earliestHour, end: endHour } = UI.getScheduleBounds(selectedCourses);
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const numRows = endHour - earliestHour;

        const data = [];

        // Títulos
        data.push(['PLANIFICADOR DE HORARIOS 2026-A', '', '', '', '', '', '']);
        data.push(['Facultad de Ciencias Administrativas - UNAC', '', '', '', '', '', '']);
        data.push(['']);

        // Encabezado (HORA a la IZQUIERDA)
        const startGridRow = data.length;
        data.push(['Hora', ...days]);

        // Inicializar filas
        for (let i = 0; i < numRows; i++) {
            const rowData = new Array(7).fill('');
            rowData[0] = `${String(earliestHour + i).padStart(2, '0')}:00`;
            data.push(rowData);
        }

        // Llenar con clases
        selectedCourses.forEach(selected => {
            const { curso, seccion } = selected;
            seccion.clases.forEach(clase => {
                const dayIndex = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].indexOf(clase.dia);
                if (dayIndex === -1) return;

                const range = TimeUtils.parseTimeRange(clase.hora);
                const startHourIndex = Math.floor(range.start / 60) - earliestHour;
                const endHourIndex = Math.ceil(range.end / 60) - earliestHour;

                const cellText = `${curso.nombre}\nAula: ${clase.aula} - Sec. ${seccion.id}\nHora: ${clase.hora}`;

                for (let r = startHourIndex; r < endHourIndex; r++) {
                    if (r >= 0 && r < numRows) {
                        const matrixRow = startGridRow + 1 + r;
                        const matrixCol = dayIndex + 1; // +1 porque la hora es la col 0

                        if (data[matrixRow][matrixCol]) {
                            data[matrixRow][matrixCol] += `\n\n---\n\n${cellText}`;
                        } else {
                            data[matrixRow][matrixCol] = cellText;
                        }
                    }
                }
            });
        });

        const ws = window.XLSX.utils.aoa_to_sheet(data);

        // Anchos de columna
        const colWidths = [
            { wch: 10 }, // Hora
            { wch: 25 }, { wch: 25 }, { wch: 25 },
            { wch: 25 }, { wch: 25 }, { wch: 25 }
        ];
        ws['!cols'] = colWidths;

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Horario');
        window.XLSX.writeFile(wb, 'Horario_2026A.xlsx');
    },

    downloadICS() {
        if (!this._handleBrowserSupport()) return;

        const selectedCourses = State.getSelectedCourses();
        if (selectedCourses.length === 0) {
            UI.showToast("No hay cursos seleccionados para exportar.", "error", true);
            return;
        }

        // Configuración del ciclo 2026-A (FCA - UNAC)
        const cicloStartStr = "20260401"; // Miércoles 01 de Abril
        const cicloEndStr = "20260721";   // Martes 21 de Julio

        let icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Antigravity//Horario UNAC 2026-A//ES",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:Horario UNAC 2026-A",
            "X-WR-TIMEZONE:America/Lima"
        ];

        const dayMap = {
            'Lun': { code: 'MO', jsDay: 1 },
            'Mar': { code: 'TU', jsDay: 2 },
            'Mié': { code: 'WE', jsDay: 3 },
            'Jue': { code: 'TH', jsDay: 4 },
            'Vie': { code: 'FR', jsDay: 5 },
            'Sáb': { code: 'SA', jsDay: 6 }
        };

        const cycleStartDate = new Date(2026, 3, 1); // 1 de Abril 2026

        selectedCourses.forEach(selected => {
            const { curso, seccion } = selected;

            seccion.clases.forEach(clase => {
                const dayInfo = dayMap[clase.dia];
                if (!dayInfo) return;

                const range = TimeUtils.parseTimeRange(clase.hora);

                // Calcular la fecha de la primera ocurrencia (desde el 1 de Abril)
                const diff = (dayInfo.jsDay - cycleStartDate.getDay() + 7) % 7;
                const firstOccDate = new Date(2026, 3, 1 + diff);

                const startTime = new Date(firstOccDate.getFullYear(), firstOccDate.getMonth(), firstOccDate.getDate(),
                    Math.floor(range.start / 60), range.start % 60);
                const endTime = new Date(firstOccDate.getFullYear(), firstOccDate.getMonth(), firstOccDate.getDate(),
                    Math.floor(range.end / 60), range.end % 60);

                const formatDate = (date) => {
                    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                };

                const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const uid = `${Date.now()}-${curso.codigo}-${seccion.id}-${clase.dia}@unac.edu.pe`;

                icsContent.push("BEGIN:VEVENT");
                icsContent.push(`UID:${uid}`);
                icsContent.push(`DTSTAMP:${stamp}`);
                icsContent.push(`DTSTART;TZID=America/Lima:${formatDate(startTime).replace('Z', '')}`);
                icsContent.push(`DTEND;TZID=America/Lima:${formatDate(endTime).replace('Z', '')}`);
                icsContent.push(`RRULE:FREQ=WEEKLY;UNTIL=${cicloEndStr}T235959Z;BYDAY=${dayInfo.code}`);
                icsContent.push(`SUMMARY:${curso.nombre} (Sec. ${seccion.id})`);
                icsContent.push(`LOCATION:${clase.aula}`);
                icsContent.push(`DESCRIPTION:Docente: ${seccion.docente}\\nTipo: ${clase.tipo === 'T' ? 'Teoría' : 'Práctica'}`);
                icsContent.push("END:VEVENT");
            });
        });

        icsContent.push("END:VCALENDAR");

        const blob = new Blob([icsContent.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = "Horario_UNAC_2026A.ics";
        link.click();

        UI.showToast("Archivo .ics descargado. Ábrelo para sincronizar tu calendario.", "success", true);
    }
};
