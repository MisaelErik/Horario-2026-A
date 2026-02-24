/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/

const STORAGE_KEY = 'savedSchedules';

export const Storage = {
    getSavedSchedules() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    },

    saveSchedule(schedule) {
        const savedSchedules = this.getSavedSchedules();
        savedSchedules.push(schedule);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSchedules));
    },

    deleteSchedule(id) {
        let savedSchedules = this.getSavedSchedules();
        savedSchedules = savedSchedules.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSchedules));
    },

    updateSchedule(updatedSchedule) { // If needed for future editing
        let savedSchedules = this.getSavedSchedules();
        const index = savedSchedules.findIndex(s => s.id === updatedSchedule.id);
        if (index !== -1) {
            savedSchedules[index] = updatedSchedule;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSchedules));
        }
    }
};
