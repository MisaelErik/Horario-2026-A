/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { TimeUtils } from './TimeUtils.js';

export const State = {
    selectedCourses: [],
    colorsLight: ['#d1fae5', '#e0f2fe', '#fef3c7', '#fee2e2', '#f3e8ff', '#ffedd5', '#ccfbf1', '#cffafe', '#fef08a', '#fce7f3'],
    colorsDark: ['#065f46', '#075985', '#92400e', '#991b1b', '#6b21a8', '#9a3412', '#115e59', '#155e75', '#854d0e', '#831843'],
    courseColorMap: {},
    colorIndex: 0,

    getConflict(newClass) {
        const newRange = TimeUtils.parseTimeRange(newClass.hora);
        for (const selected of this.selectedCourses) {
            for (const existingClass of selected.seccion.clases) {
                if (existingClass.dia === newClass.dia) {
                    const existingRange = TimeUtils.parseTimeRange(existingClass.hora);
                    if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
                        return selected;
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

        // Assign color if not already assigned
        if (!this.courseColorMap[courseData.curso.codigo]) {
            this.courseColorMap[courseData.curso.codigo] = {
                light: this.colorsLight[this.colorIndex % this.colorsLight.length],
                dark: this.colorsDark[this.colorIndex % this.colorsDark.length]
            };
            this.colorIndex++;
        }

        this.selectedCourses.push(courseData);
    },

    removeCourse(courseCode) {
        this.selectedCourses = this.selectedCourses.filter(c => c.curso.codigo !== courseCode);
    },

    clearSchedule() {
        this.selectedCourses = [];
    },

    getSelectedCourses() {
        return this.selectedCourses;
    },

    setSelectedCourses(courses) {
        this.selectedCourses = courses;
        // Re-populate color map to ensure consistency when loading
        courses.forEach(c => {
            if (!this.courseColorMap[c.curso.codigo]) {
                this.courseColorMap[c.curso.codigo] = {
                    light: this.colorsLight[this.colorIndex % this.colorsLight.length],
                    dark: this.colorsDark[this.colorIndex % this.colorsDark.length]
                };
                this.colorIndex++;
            }
        });
    },

    getColor(courseCode, forceLight = false) {
        const colorObj = this.courseColorMap[courseCode];
        if (!colorObj) return '#e5e7eb';
        if (forceLight) return colorObj.light;
        const isDark = document.documentElement.classList.contains('dark');
        return isDark ? colorObj.dark : colorObj.light;
    },

    darkenColor(hex, amount) {
        let usePound = false;
        if (hex[0] == "#") {
            hex = hex.slice(1);
            usePound = true;
        }
        let num = parseInt(hex, 16);
        let r = (num >> 16) + amount;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let g = ((num >> 8) & 0x00FF) + amount;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        let b = (num & 0x0000FF) + amount;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
};
