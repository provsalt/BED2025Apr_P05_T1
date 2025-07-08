import sql from "mssql";
import {dbConfig} from "../../config/db.js";

async function createMedicationReminder(medicationData) {
    let pool;
    try {
        // Connect to the database
        pool = await sql.connect(dbConfig);

        // Store just the time as TIME type
        const medicineTime = medicationData.timeToTake; // Keep as "HH:MM" format

        // Insert medication reminder into the database
        const result = await pool.request()
            .input('userId', sql.Int, medicationData.userId)
            .input('medicationName', sql.VarChar(255), medicationData.medicationName)
            .input('reason', sql.VarChar(255), medicationData.reason)
            .input('dosage', sql.VarChar(100), medicationData.dosage)
            .input('medicineTime', sql.Time, medicineTime)
            .input('frequencyPerDay', sql.Int, medicationData.frequencyPerDay)
            .input('imageUrl', sql.VarChar(255), medicationData.imageUrl)
            .query(`
                INSERT INTO Medication (user_id, medicine_name, dosage, medicine_time, frequency_per_day, image_url, reason, created_at)
                VALUES (@userId, @medicationName, @dosage, @medicineTime, @frequencyPerDay, @imageUrl, @reason, GETDATE());
                
                SELECT SCOPE_IDENTITY() AS id;
            `);

        const medicationId = result.recordset[0].id;

        return { 
            success: true, 
            message: 'Medication reminder created successfully',
            medicationId: medicationId,
            imageUrl: medicationData.imageUrl
        };
    } catch (error) {
        console.error('Error creating medication reminder:', error);
        return { 
            success: false, 
            message: 'Failed to create medication reminder',
            error: error.message 
        };
    } finally {
        // Close the database connection
        if (pool) {
            await pool.close();
        }
    }
}

module.exports = {
    createMedicationReminder
}