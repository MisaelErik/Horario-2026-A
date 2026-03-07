/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { TimeUtils } from './TimeUtils.js';

export const State = {
    selectedCourses: [],
    palettes: {
        'default': {
            light: ['#d1fae5', '#e0f2fe', '#fef3c7', '#fee2e2', '#f3e8ff', '#ffedd5', '#ccfbf1', '#cffafe', '#fef08a', '#fce7f3'],
            dark: ['#065f46', '#075985', '#92400e', '#991b1b', '#6b21a8', '#9a3412', '#115e59', '#155e75', '#854d0e', '#831843']
        },
        'vibrant': {
            light: ['#bef264', '#67e8f9', '#fde047', '#fca5a5', '#d8b4fe', '#fdba74', '#5eead4', '#7dd3fc', '#fef08a', '#fda4af'],
            dark: ['#4d7c0f', '#0e7490', '#a16207', '#b91c1c', '#7e22ce', '#c2410c', '#0f766e', '#0369a1', '#854d0e', '#be123c']
        },
        'pastel': {
            light: ['#bbf7d0', '#bae6fd', '#fef08a', '#fecaca', '#e9d5ff', '#fed7aa', '#99f6e4', '#a5f3fc', '#fde047', '#fbcfe8'],
            dark: ['#166534', '#0369a1', '#854d0e', '#991b1b', '#6b21a8', '#9a3412', '#115e59', '#155e75', '#713f12', '#9d174d']
        }
    },
    activePalette: localStorage.getItem('schedule-palette') || 'default',
    customColors: JSON.parse(localStorage.getItem('custom-course-colors')) || {},
    courseColorIndexMap: {},
    colorIndex: 0,

    getConflict(newClass) {
        const newRange = TimeUtils.parseTimeRange(newClass.hora);
        for (const selected of this.selectedCourses) {
            for (const existingClass of selected.seccion.clases) {
                if (existingClass.dia === newClass.dia) {
                    const existingRange = TimeUtils.parseTimeRange(existingClass.hora);
                    if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
                        return {
                            selectedCourse: selected,
                            conflictDetails: {
                                day: existingClass.dia,
                                time: existingClass.hora,
                                courseName: selected.curso.nombre
                            }
                        };
                    }
                }
            }
        }
        return null;
    },

    addCourse(courseData) {
        // Remove existing instance of this course if present (e.g., switching sections)
        const existingCourseIndex = this.selectedCourses.findIndex(c => c.curso.codigo === courseData.curso.codigo);
        if (existingCourseIndex !== -1) {
            this.selectedCourses.splice(existingCourseIndex, 1);
        }

        // Assign color and add
        if (this.courseColorIndexMap[courseData.curso.codigo] === undefined) {
            this.courseColorIndexMap[courseData.curso.codigo] = this.colorIndex;
            this.colorIndex++;
        }

        this.selectedCourses.push(courseData);
        window.dispatchEvent(new CustomEvent('schedule-updated'));
    },

    removeCourse(courseCode) {
        this.selectedCourses = this.selectedCourses.filter(c => c.curso.codigo !== courseCode);
        window.dispatchEvent(new CustomEvent('schedule-updated'));
    },

    getSelectedCourses() {
        return this.selectedCourses;
    },

    setSelectedCourses(courses) {
        this.selectedCourses = courses || [];
        // Re-map colors
        this.courseColorIndexMap = {};
        this.colorIndex = 0;

        this.selectedCourses.forEach(c => {
            if (this.courseColorIndexMap[c.curso.codigo] === undefined) {
                this.courseColorIndexMap[c.curso.codigo] = this.colorIndex;
                this.colorIndex++;
            }
        });
        window.dispatchEvent(new CustomEvent('schedule-updated'));
    },

    clearSchedule() {
        this.selectedCourses = [];
        this.courseColorIndexMap = {};
        this.colorIndex = 0;
        window.dispatchEvent(new CustomEvent('schedule-updated'));
    },

    getColor(courseCode) {
        if (this.customColors[courseCode]) {
            return this.customColors[courseCode];
        }

        const isDarkMode = document.documentElement.classList.contains('dark');
        const palette = this.palettes[this.activePalette] || this.palettes['default'];
        const colors = isDarkMode ? palette.dark : palette.light;

        if (this.courseColorIndexMap[courseCode] === undefined) {
            this.courseColorIndexMap[courseCode] = this.colorIndex;
            this.colorIndex++;
        }

        const index = this.courseColorIndexMap[courseCode];
        return colors[index % colors.length];
    },

    setPalette(paletteName) {
        if (this.palettes[paletteName]) {
            this.activePalette = paletteName;
            localStorage.setItem('schedule-palette', paletteName);
            window.dispatchEvent(new CustomEvent('schedule-updated'));
        }
    },

    setCustomColor(courseCode, hexColor) {
        this.customColors[courseCode] = hexColor;
        localStorage.setItem('custom-course-colors', JSON.stringify(this.customColors));
        window.dispatchEvent(new CustomEvent('schedule-updated'));
    },

    darkenColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color =>
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
        );
    }
};
