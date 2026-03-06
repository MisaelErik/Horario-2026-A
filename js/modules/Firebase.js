/*
© 2026 ErikMisael. Todos los derechos reservados.
*/

const firebaseConfig = {
    apiKey: "AIzaSyAjbC6qOJdLmjQM6F17NnIzQLu-E9_tVD8", // RELLENAR
    authDomain: "planificador-2026.firebaseapp.com",
    projectId: "planificador-2026",
    storageBucket: "planificador-2026.firebasestorage.app",
    messagingSenderId: "319259910274",
    appId: "1:319259910274:web:fcf792a845d0fe4726149b" // RELLENAR
};

export const FirebaseSync = {
    db: null,

    init() {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.db = firebase.firestore();
            return true;
        }
        return false;
    },

    async getFacultyData(facultyId) {
        if (!this.db) this.init();
        if (!this.db) return null;

        try {
            const doc = await this.db.collection("faculties").doc(facultyId).get();
            if (doc.exists) {
                return doc.data().courses;
            }
        } catch (error) {
            console.error("Error fetching from Firebase:", error);
        }
        return null;
    },

    async shareSchedule(scheduleData, facultyId) {
        try {
            const db = firebase.firestore();
            const shareRef = await db.collection("shared_schedules").add({
                data: scheduleData,
                faculty: facultyId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return shareRef.id;
        } catch (error) {
            console.error("Error al compartir horario:", error);
            return null;
        }
    },

    async getSharedSchedule(shareId) {
        try {
            const db = firebase.firestore();
            const doc = await db.collection("shared_schedules").doc(shareId).get();
            if (doc.exists) {
                return doc.data();
            } else {
                console.log("No se encontró el horario compartido!");
                return null;
            }
        } catch (error) {
            console.error("Error al obtener horario compartido:", error);
            return null;
        }
    }
};
