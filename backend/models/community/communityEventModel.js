import sql from "mssql";
import { dbConfig } from "../../config/db.js";

// POST: Create a new community event
export async function createCommunityEvent(eventData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('name', sql.NVarChar(100), eventData.name)
            .input('location', sql.NVarChar(100), eventData.location)
            .input('category', sql.NVarChar(50), eventData.category)
            .input('date', sql.Date, eventData.date)
            .input('time', sql.VarChar(8), eventData.time)
            .input('description', sql.NVarChar(500), eventData.description)
            .input('user_id', sql.Int, eventData.user_id)
            .input('approved_by_admin_id', sql.Int, eventData.approved_by_admin_id)
            .query(`
                INSERT INTO CommunityEvent (name, location, category, date, time, description, user_id, approved_by_admin_id, created_at)
                VALUES (@name, @location, @category, @date, @time, @description, @user_id, @approved_by_admin_id, GETDATE());
                SELECT SCOPE_IDENTITY() AS id;
            `);
        const eventId = result.recordset[0].id;
        return {
            success: true,
            message: 'Community event created successfully',
            eventId: eventId
        };
    } catch (error) {
        console.error('Error creating community event:', error);
        return {
            success: false,
            message: 'Failed to create community event',
            error: error.message
        };
    } finally {
        if (connection && typeof connection.close === 'function') {
            await connection.close();
        }
    };
};

// POST: Add an image for a community event
export async function addCommunityEventImage(community_event_id, image_url) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        await connection.request()
            .input('community_event_id', sql.Int, community_event_id)
            .input('image_url', sql.NVarChar(sql.MAX), image_url)
            .query(`
                INSERT INTO CommunityEventImage (community_event_id, image_url, uploaded_at)
                VALUES (@community_event_id, @image_url, GETDATE());
            `);
        return {
            success: true,
            message: 'Community event image added successfully'
        };
    } catch (error) {
        console.error('Error adding community event image:', error);
        return {
            success: false,
            message: 'Failed to add community event image',
            error: error.message
        };
    } finally {
        if (connection){
            await connection.close();
        };
    };
};

// GET: Get all approved community events
export async function getAllApprovedEvents() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .query(`
                SELECT CommunityEvent.*, Users.name as created_by_name,
                  (SELECT TOP 1 image_url FROM CommunityEventImage WHERE community_event_id = CommunityEvent.id ORDER BY uploaded_at DESC) as image_url
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.approved_by_admin_id IS NOT NULL
                ORDER BY CommunityEvent.date ASC, CommunityEvent.time ASC
            `);
        
        return {
            success: true,
            events: result.recordset
        };
    } catch (error) {
        console.error('Error getting approved events:', error);
        return {
            success: false,
            message: 'Failed to get approved events',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// GET: Get a single community event by ID
export async function getCommunityEventById(eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`
                SELECT CommunityEvent.*, Users.name as created_by_name,
                  (SELECT TOP 1 image_url FROM CommunityEventImage WHERE community_event_id = CommunityEvent.id ORDER BY uploaded_at DESC) as image_url
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.id = @eventId AND CommunityEvent.approved_by_admin_id IS NOT NULL
            `);
        if (result.recordset.length === 0) {
            return { success: false, message: 'Event not found' };
        }
        return { success: true, event: result.recordset[0] };
    } catch (error) {
        console.error('Error getting community event by ID:', error);
        return { success: false, message: 'Failed to get event', error: error.message };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

