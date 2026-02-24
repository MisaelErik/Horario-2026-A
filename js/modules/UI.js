/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
import { DOM } from './UI/DOM.js';
import { CourseList } from './UI/CourseList.js';
import { ScheduleGrid } from './UI/ScheduleGrid.js';
import { SavedSchedules } from './UI/SavedSchedules.js';
import { SelectedList } from './UI/SelectedList.js';
import { Modals } from './UI/Modals.js';
import { Toasts } from './UI/Toasts.js';

export const UI = {
    get elements() {
        return DOM.elements;
    },

    init() {
        DOM.cacheDOM();
        this.renderScheduleGrid();
    },

    // CourseList Proxies
    populateCycleFilter(coursesData) { return CourseList.populateCycleFilter(coursesData); },
    renderCourseList(coursesData, selectedCourses) { return CourseList.renderCourseList(coursesData, selectedCourses); },

    // ScheduleGrid Proxies
    renderScheduleGrid(startHour, endHour) { return ScheduleGrid.renderScheduleGrid(startHour, endHour); },
    getEarliestHour(selectedCourses) { return ScheduleGrid.getEarliestHour(selectedCourses); },
    getScheduleBounds(selectedCourses) { return ScheduleGrid.getScheduleBounds(selectedCourses); },
    renderScheduleEvents(selectedCourses) { return ScheduleGrid.renderScheduleEvents(selectedCourses); },

    // SelectedList Proxies
    renderSelectedList(selectedCourses, removeCallback) { return SelectedList.renderSelectedList(selectedCourses, removeCallback); },

    // SavedSchedules Proxies
    renderSavedSchedules(schedules, events) { return SavedSchedules.renderSavedSchedules(schedules, events); },

    // Modals & Toasts Proxies
    showConflictModal(message, onReplace, onCancel) { return Modals.showConflictModal(message, onReplace, onCancel); },
    closeModal() { return Modals.closeModal(); },
    showToast(message, type, isImportant) { return Toasts.showToast(message, type, isImportant); }
};
