import sql from "mssql";
import {dbConfig} from "../../config/db.js";

// POST
export async function createMedicationReminder(medicationData) {
    let connection;
    try {
        // Connect to the database
        connection = await sql.connect(dbConfig);

        // Store just the time as TIME type
        const medicineTime = medicationData.timeToTake; // Keep as "HH:MM" format

        // Insert medication reminder into the database
        const result = await connection.request()
            .input('userId', sql.Int, medicationData.userId)
            .input('medicationName', sql.VarChar(255), medicationData.medicationName)
            .input('reason', sql.VarChar(255), medicationData.reason)
            .input('dosage', sql.VarChar(100), medicationData.dosage)
            .input('medicineTime', sql.VarChar(8), medicineTime)
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
        if (connection) {
            await connection.close();
        }
    }
}

//GET
export async function getMedicationRemindersByUser(userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT id, medicine_name, reason, dosage, medicine_time, frequency_per_day, image_url, created_at
                FROM Medication
                WHERE user_id = @userId
                ORDER BY created_at DESC;
            `);
        return {
            success: true,
            reminders: result.recordset
        };
    } catch (error) {
        console.error('Error fetching medication reminders:', error);
        return {
            success: false,
            message: 'Failed to fetch medication reminders',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
//GET
export async function getAllRemindersWithUsers() {
    let connection;
    try {
        connection = new sql.ConnectionPool(dbConfig); // Using dedicated connection so that after, it only closes its own pool
        await connection.connect();
        const result = await connection.request().query(`
            SELECT r.*, u.email, u.name
            FROM Medication r
            LEFT JOIN [Users] u ON r.user_id = u.id
        `);
        return result.recordset;
    } catch (error) {
        console.error('Error in getAllRemindersWithUsers:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();   
        }
    }
} 

// UPDATE
export async function updateMedicationReminder(reminderId, updateData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('reminderId', sql.Int, reminderId)
            .input('medicationName', sql.VarChar(255), updateData.medicationName)
            .input('reason', sql.VarChar(255), updateData.reason)
            .input('dosage', sql.VarChar(100), updateData.dosage)
            .input('medicineTime', sql.VarChar(8), updateData.timeToTake)
            .input('frequencyPerDay', sql.Int, updateData.frequencyPerDay)
            .input('imageUrl', sql.VarChar(255), updateData.imageUrl)
            .query(`
                UPDATE Medication
                SET medicine_name = @medicationName,
                    reason = @reason,
                    dosage = @dosage,
                    medicine_time = @medicineTime,
                    frequency_per_day = @frequencyPerDay,
                    image_url = @imageUrl
                WHERE id = @reminderId;
            `);
        return {
            success: true,
            message: 'Medication reminder updated successfully'
        };
    } catch (error) {
        console.error('Error updating medication reminder:', error);
        return {
            success: false,
            message: 'Failed to update medication reminder',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// DELETE
export async function deleteMedicationReminder(reminderId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('reminderId', sql.Int, reminderId)
            .input('userId', sql.Int, userId)
            .query(`
                DELETE FROM Medication
                WHERE id = @reminderId AND user_id = @userId;
            `);
        if (result.rowsAffected[0] > 0) {
            return { success: true, message: 'Medication reminder deleted successfully' };
        } else {
            return { success: false, message: 'Medication reminder not found or not authorized' };
        }
    } catch (error) {
        console.error('Error deleting medication reminder:', error);
        return { success: false, message: 'Failed to delete medication reminder', error: error.message };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
} 
