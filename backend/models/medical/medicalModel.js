import sql from "mssql";
import {dbConfig} from "../../config/db.js";

async function createMedicationReminder(medicationData) {
    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Insert medication reminder into the database
        const result = await pool.request()
            .input('medicationName', sql.NVarChar, medicationData.medicationName)
            .input('reason', sql.NVarChar, medicationData.reason)
            .input('dosage', sql.NVarChar, medicationData.dosage)
            .input('timeToTake', sql.Time, medicationData.timeToTake)
            .input('frequencyPerDay', sql.Int, medicationData.frequencyPerDay)
            .query(`
                INSERT INTO Medication (medicine_name, dosage, medicine_time, frequency_per_day, reason)
                VALUES (@medicationName, @dosage, @timeToTake, @frequencyPerDay, @reason);
            `);

        return { success: true, message: 'Medication reminder created successfully' };
    } catch (error) {
        console.error('Error creating medication reminder:', error);
        return { success: false, message: 'Failed to create medication reminder' };
    } finally {
        // Close the database connection
        await sql.close();
    }
}

module.exports = {
    createMedicationReminder
}