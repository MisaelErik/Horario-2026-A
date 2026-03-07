/*
© 2026 ErikMisael. Todos los derechos reservados.
Creado por ErikMisael. El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/

import { coursesData as localCoursesData } from '../data/courses.js?v=11';
import { Storage } from './modules/Storage.js?v=11';
import { State } from './modules/State.js?v=11';
import { TimeUtils } from './modules/TimeUtils.js?v=11';
import { UI } from './modules/UI.js?v=11';
import { Export } from './modules/Export.js?v=11';
import { FirebaseSync } from './modules/Firebase.js?v=11';

let activeCoursesData = localCoursesData;
let facultySelector = null; // Declare it here for access across functions

// Setup backwards compatibility during refactoring
window.Schedule = State;
window.TimeUtils = TimeUtils;
window.facultyNames = {
    'FCA': 'Facultad de Ciencias Administrativas',
    'FCC': 'Facultad de Ciencias Contables',
    'FIEE': 'Facultad de Ingeniería Eléctrica y Electrónica',
    'FCE': 'Facultad de Ciencias Económicas',
    'FIIS': 'Facultad de Ingeniería Industrial y de Sistemas',
    'FIME': 'Facultad de Ingeniería Mecánica y de Energía',
    'FIQ': 'Facultad de Ingeniería Química',
    'FCS': 'Facultad de Ciencias de la Salud',
    'FIARN': 'Facultad de Ingeniería Ambiental y de Recursos Naturales',
    'FCNM': 'Facultad de Ciencias Naturales y Matemática',
    'FIPA': 'Facultad de Ingeniería Pesquera y de Alimentos'
};

function updateSubtitle(facultyId) {
    const subtitle = document.getElementById('faculty-subtitle');
    if (subtitle) {
        const name = window.facultyNames[facultyId] || ('Facultad ' + facultyId);
        subtitle.textContent = `${name} - UNAC`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init UI
    UI.init();
    facultySelector = document.getElementById('faculty-selector');

    // 2. Initial Sync/Check Faculty OR Load Shared
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('share');

    let initialSyncComplete = false;

    if (sharedId) {
        UI.showToast("Cargando horario compartido...", "info", true);
        const sharedData = await FirebaseSync.getSharedSchedule(sharedId);
        if (sharedData && sharedData.data && sharedData.faculty) {
            const syncResult = await syncFacultyData(sharedData.faculty);
            if (syncResult) {
                State.setSelectedCourses(sharedData.data);
                updateUI();
                renderCourses();
                UI.showToast("¡Horario compartido cargado!", "success");

                if (facultySelector) {
                    facultySelector.classList.add('hidden');
                }
                localStorage.setItem('selected-faculty', sharedData.faculty);
                initialSyncComplete = true;

                // Send to GA
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'load_shared_schedule', {
                        'faculty': sharedData.faculty,
                        'share_id': sharedId
                    });
                }
            } else {
                if (facultySelector && !localStorage.getItem('selected-faculty')) {
                    facultySelector.classList.remove('hidden');
                }
            }
        } else {
            UI.showToast("Enlace de horario inválido o expirado.", "error");
            if (facultySelector && !localStorage.getItem('selected-faculty')) {
                facultySelector.classList.remove('hidden');
            }
        }
    }

    if (!initialSyncComplete) {
        const savedFaculty = localStorage.getItem('selected-faculty');
        if (savedFaculty) {
            const syncResult = await syncFacultyData(savedFaculty);
            if (syncResult && facultySelector) {
                facultySelector.classList.add('hidden');
            }
        }
    }

    // Initial Render (if not handled by sync)
    UI.populateCycleFilter(activeCoursesData);
    renderCourses();

    // 3. Load Saved Schedules
    const savedSchedules = Storage.getSavedSchedules();
    UI.renderSavedSchedules(savedSchedules, {
        load: loadSchedule,
        delete: deleteSchedule
    });

    // Event Listeners
    setupEventListeners();
});

async function syncFacultyData(facultyId) {
    if (facultyId === 'FCA') {
        activeCoursesData = localCoursesData;
        UI.populateCycleFilter(activeCoursesData);
        renderCourses();
        updateSubtitle('FCA');
        return true;
    }

    UI.showToast(`Sincronizando ${facultyId}...`, "info", true);

    // Check cache
    const cached = localStorage.getItem(`cache-courses-${facultyId}`);
    if (cached) {
        activeCoursesData = JSON.parse(cached);
        UI.populateCycleFilter(activeCoursesData);
        renderCourses();
    }

    // Sync from Firebase
    const remoteData = await FirebaseSync.getFacultyData(facultyId);
    if (remoteData) {
        activeCoursesData = remoteData;
        localStorage.setItem(`cache-courses-${facultyId}`, JSON.stringify(remoteData));
        UI.populateCycleFilter(activeCoursesData);
        renderCourses();
        updateSubtitle(facultyId);
        UI.showToast(`${facultyId} actualizado`, "success");
        return true;
    } else if (cached) {
        return true; // We have cache at least
    } else {
        window.location.href = `falta-horario.html?fac=${facultyId}`;
        return false;
    }
}

function setupEventListeners() {
    // Theme Change Re-render
    window.addEventListener('theme-changed', () => {
        updateUI();
    });

    // Color Palette Selector
    const paletteSelector = document.getElementById('palette-selector');
    if (paletteSelector) {
        paletteSelector.value = State.activePalette;
        paletteSelector.addEventListener('change', (e) => {
            State.setPalette(e.target.value);
            updateUI();
            renderCourses();
            UI.showToast("Paleta actualizada", "success");
        });
    }

    // Schedule-updated global event (triggered by custom color picker)
    window.addEventListener('schedule-updated', () => {
        updateUI();
    });

    // Course Selection (Delegated)
    UI.elements.courseList.addEventListener('change', (e) => {
        if (e.target.matches('input[name^="course-"]')) {
            const courseCode = e.target.dataset.courseCode;
            const sectionId = e.target.dataset.sectionId;
            handleCourseSelection(courseCode, sectionId);
        }
    });

    // Cycle Filter
    UI.elements.cycleFilter.addEventListener('change', () => {
        renderCourses();
    });

    // Clear Schedule
    document.getElementById('clear-schedule-btn').addEventListener('click', () => {
        if (confirm('¿Borrar todo el horario actual?')) {
            State.clearSchedule();
            updateUI();
            document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
            renderCourses();
        }
    });

    // Save Schedule
    document.getElementById('save-schedule-btn').addEventListener('click', async () => {
        const schedule = Schedule.getSelectedCourses();
        if (schedule.length === 0) return alert("Selecciona cursos primero.");

        const name = prompt("Nombre del horario:");
        if (!name) return;

        try {
            const container = document.getElementById('schedule-container');
            // Temporary style fix for capture
            const originalOverflow = container.style.overflow;
            container.style.overflow = 'visible';

            const canvas = await window.html2canvas(container, { scale: 0.5, backgroundColor: '#ffffff' });
            container.style.overflow = originalOverflow;

            const thumbnail = canvas.toDataURL('image/png');

            Storage.saveSchedule({
                id: Date.now(),
                name,
                courses: schedule,
                thumbnail,
                faculty: localStorage.getItem('selected-faculty') || 'FCA'
            });

            UI.renderSavedSchedules(Storage.getSavedSchedules(), { load: loadSchedule, delete: deleteSchedule });
            UI.showToast("Horario guardado correctamente");

            // Send GA event
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'save_schedule', {
                    'faculty': localStorage.getItem('selected-faculty') || 'FCA',
                    'count_courses': schedule.length
                });
            }
        } catch (error) {
            console.error(error);
            alert("Error al guardar.");
        }
    });

    // Share Schedule
    const shareBtn = document.getElementById('share-schedule-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const schedule = Schedule.getSelectedCourses();
            if (schedule.length === 0) return alert("Selecciona cursos para compartir.");

            UI.showToast("Generando enlace...", "info", true);
            shareBtn.disabled = true;
            shareBtn.classList.add('opacity-50');

            const currentFaculty = localStorage.getItem('selected-faculty') || 'FCA';
            const shareId = await FirebaseSync.shareSchedule(schedule, currentFaculty);

            if (shareId) {
                const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;

                // Track with GA
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'share', {
                        'method': 'Link_Generated',
                        'content_type': 'schedule',
                        'faculty': currentFaculty
                    });
                }

                try {
                    await navigator.clipboard.writeText(shareUrl);
                    UI.showToast("¡Enlace copiado al portapapeles!", "success");
                } catch (err) {
                    prompt("Copia este enlace para compartir tu horario:", shareUrl);
                }
            } else {
                UI.showToast("Error al generar enlace.", "error");
            }

            shareBtn.disabled = false;
            shareBtn.classList.remove('opacity-50');
        });
    }

    // Exports
    const exportBtnPdf = document.getElementById('download-pdf-btn');
    const exportBtnPng = document.getElementById('download-png-btn');
    const exportBtnExcel = document.getElementById('download-excel-btn');

    if (exportBtnPdf) exportBtnPdf.addEventListener('click', () => {
        UI.showToast("Generando PDF, por favor espera...", "info", true);
        Export.downloadSchedule('pdf', 'schedule-container');
    });
    if (exportBtnPng) exportBtnPng.addEventListener('click', () => {
        UI.showToast("Generando Imagen, por favor espera...", "info", true);
        Export.downloadSchedule('png', 'schedule-container');
    });
    if (exportBtnExcel) exportBtnExcel.addEventListener('click', () => {
        UI.showToast("Generando Excel, por favor espera...", "info", true);
        Export.downloadExcel('schedule-table');
    });

    // Menú de Exportación (Dropdown)
    const downloadMenuBtn = document.getElementById('download-menu-btn');
    const downloadMenu = document.getElementById('download-menu');

    if (downloadMenuBtn && downloadMenu) {
        // Toggle menú al pulsar el botón
        downloadMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            downloadMenu.classList.toggle('hidden');
        });

        // Evitar que el menú se cierre al hacer clic dentro de él (pero no en las opciones)
        downloadMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Cerrar menú al hacer clic en cualquier otra parte del documento
        document.addEventListener('click', () => {
            downloadMenu.classList.add('hidden');
        });

        // Configurar acciones de cada opción del menú
        const exportOptions = [
            { id: 'download-png-menu', format: 'png', msg: 'Generando Imagen...' },
            { id: 'download-pdf-menu', format: 'pdf', msg: 'Generando PDF...' },
            { id: 'download-excel-menu', format: 'excel', msg: 'Generando Excel...' },
            { id: 'download-ics-menu', format: 'ics', msg: 'Generando Calendario...' }
        ];

        exportOptions.forEach(opt => {
            const el = document.getElementById(opt.id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    downloadMenu.classList.add('hidden'); // Cerrar menú al elegir
                    UI.showToast(opt.msg, "info", true);

                    if (opt.format === 'excel') {
                        Export.downloadExcel('schedule-table');
                    } else if (opt.format === 'ics') {
                        Export.downloadICS();
                    } else {
                        Export.downloadSchedule(opt.format, 'schedule-container');
                    }
                });
            }
        });
    }

    // Trim/Recortar schedule
    document.getElementById('trim-schedule-btn')?.addEventListener('click', () => {
        const selected = State.getSelectedCourses();
        if (selected.length === 0) {
            UI.showToast('Primero selecciona cursos para recortar el horario', 'error', true);
            return;
        }
        const { start, end } = UI.getScheduleBounds(selected);
        UI.renderScheduleGrid(start, end);
        UI.renderScheduleEvents(selected);
        UI.showToast(`Horario ajustado: ${start}:00 a ${end}:00 ✂️`);
    });

    // Faculty Selector & Persistence
    // Crear iconos para el modal de facultades (especialmente si se inyectaron vía script)
    if (window.lucide) window.lucide.createIcons();

    document.querySelectorAll('.faculty-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const faculty = btn.dataset.faculty;
            const prevFaculty = localStorage.getItem('selected-faculty');

            if (State.getSelectedCourses().length > 0 && prevFaculty !== faculty) {
                const confirmed = confirm("¡Advertencia! Si cambias de facultad perderás tu horario actual si no lo has guardado. ¿Deseas continuar?");
                if (!confirmed) return;
            }

            // Step 1: Sync or Load
            const success = await syncFacultyData(faculty);

            // Step 2: ONLY close if success
            if (success) {
                if (prevFaculty !== faculty) {
                    State.clearSchedule();
                    updateUI();
                }
                localStorage.setItem('selected-faculty', faculty);

                // Track GA
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'select_content', {
                        'content_type': 'faculty',
                        'item_id': faculty
                    });
                }

                // Animation and close
                facultySelector.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    facultySelector.classList.add('hidden');
                    facultySelector.classList.remove('opacity-0', 'scale-95');
                }, 300);

                UI.showToast(`Bienvenido a ${faculty}`, "success");
            }
        });
    });

    // Cambiar Facultad desde el Footer
    const changeFacultyBtn = document.getElementById('change-faculty-footer-btn');
    if (changeFacultyBtn) {
        changeFacultyBtn.addEventListener('click', () => {
            facultySelector.classList.remove('hidden', 'opacity-0', 'scale-95');
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Verificar si ya existe preferencia
    if (localStorage.getItem('selected-faculty') === 'FCA') {
        facultySelector.classList.add('hidden');
    }
}

function renderCourses() {
    UI.renderCourseList(activeCoursesData, State.getSelectedCourses());
}

function handleCourseSelection(courseCode, sectionId) {
    const course = activeCoursesData.find(c => c.codigo === courseCode);
    const section = course.secciones.find(s => s.id === sectionId);

    // Verifica no solo el curso, sino si esa sección en particular ya está seleccionada
    const alreadySelected = State.getSelectedCourses().some(c => c.curso.codigo === courseCode && c.seccion.id === sectionId);

    if (alreadySelected) {
        // Si ya está seleccionada esta sección exacta, no hacemos nada (evita remociones accidentales)
        return;
    }

    // Check conflicts
    let conflict = null;
    const currentSelected = State.getSelectedCourses();

    for (const newClass of section.clases) {
        for (const selected of currentSelected) {
            if (selected.curso.codigo === courseCode) continue;

            for (const existingClass of selected.seccion.clases) {
                if (existingClass.dia === newClass.dia) {
                    const newRange = TimeUtils.parseTimeRange(newClass.hora);
                    const existingRange = TimeUtils.parseTimeRange(existingClass.hora);

                    if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
                        conflict = selected;
                        break;
                    }
                }
            }
            if (conflict) break;
        }
        if (conflict) break;
    }

    if (conflict) {
        UI.showConflictModal(
            `El curso ${course.nombre} se cruza con ${conflict.curso.nombre}.`,
            () => { // Replace
                State.removeCourse(conflict.curso.codigo);
                State.addCourse({ curso: course, seccion: section });
                UI.showToast(`${course.nombre} agregado`);
                updateUI();
                renderCourses(); // Updates radio buttons visually
            },
            () => { // Cancel
                renderCourses(); // Revert radio selection
            }
        );
    } else {
        State.addCourse({ curso: course, seccion: section });
        UI.showToast(`${course.nombre} agregado`);
        updateUI();
        renderCourses();
    }
}

function removeCourseCallback(courseCode) {
    State.removeCourse(courseCode);
    UI.showToast(`Curso removido`, 'info');
    updateUI();
    renderCourses();
}

function updateUI() {
    const selectedFields = State.getSelectedCourses();
    const { start, end } = UI.getScheduleBounds(selectedFields);
    UI.renderScheduleGrid(start, end);
    UI.renderScheduleEvents(selectedFields);
    UI.renderSelectedList(selectedFields, removeCourseCallback);
}

async function loadSchedule(id) {
    const saved = Storage.getSavedSchedules().find(s => s.id === id);
    if (saved) {
        const currentFaculty = localStorage.getItem('selected-faculty') || 'FCA';
        const targetFaculty = saved.faculty || 'FCA'; // Retro-compatibility for older schedules

        if (currentFaculty !== targetFaculty) {
            const confirmed = confirm(`Este horario pertenece a otra facultad (${targetFaculty}). ¿Deseas cambiar de facultad para cargarlo?`);
            if (!confirmed) return;

            const success = await syncFacultyData(targetFaculty);
            if (success) {
                localStorage.setItem('selected-faculty', targetFaculty);
            } else {
                return; // Sync failed, don't load schedule
            }
        }

        State.setSelectedCourses(saved.courses);
        updateUI();
        renderCourses();
        UI.showToast(`Horario cargado`);
    }
}

function deleteSchedule(id) {
    if (confirm("¿Eliminar este horario?")) {
        Storage.deleteSchedule(id);
        UI.renderSavedSchedules(Storage.getSavedSchedules(), { load: loadSchedule, delete: deleteSchedule });
    }
}
