/*
© 2026 Misael Erik. Todos los derechos reservados.
El uso, modificación, distribución o copia no autorizada de este código o esta herramienta se encuentra terminantemente prohibido sin el previo y explícito consentimiento del autor original.
*/
export const TimeUtils = {
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    },

    parseTimeRange(horaStr) {
        const [startStr, endStr] = horaStr.split(' a ');
        return {
            start: this.timeToMinutes(startStr.trim()),
            end: this.timeToMinutes(endStr.trim().replace('.', '')),
        };
    }
};
