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
            .query(`
                INSERT INTO CommunityEvent (name, location, category, date, time, description, user_id, created_at)
                VALUES (@name, @location, @category, @date, @time, @description, @user_id, GETDATE());
                SELECT SCOPE_IDENTITY() AS id;
            `);
        const eventId = result.recordset[0].id;
        return {
            success: true,
            message: 'Community event created successfully and pending admin approval',
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
        if (connection) {
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
                  (SELECT TOP 1 image_url FROM CommunityEventImage WHERE community_event_id = CommunityEvent.id ORDER BY uploaded_at ASC) as image_url
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.approved_by_admin_id IS NOT NULL
                AND (CommunityEvent.date > CAST(GETDATE() AS DATE) OR (CommunityEvent.date = CAST(GETDATE() AS DATE) AND CommunityEvent.time > CAST(GETDATE() AS TIME)))
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

// GET: Get all community events created by a specific user
export async function getCommunityEventsByUserId(userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT CommunityEvent.*, Users.name as created_by_name,
                  (SELECT TOP 1 image_url FROM CommunityEventImage WHERE community_event_id = CommunityEvent.id ORDER BY uploaded_at ASC) as image_url
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.user_id = @userId
                ORDER BY CommunityEvent.date DESC, CommunityEvent.time DESC
            `);
        return {
            success: true,
            events: result.recordset
        };
    } catch (error) {
        console.error('Error getting user events:', error);
        return {
            success: false,
            message: 'Failed to get user events',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// GET: Get all images for a community event
export async function getCommunityEventImages(eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`
                SELECT id, image_url, uploaded_at
                FROM CommunityEventImage
                WHERE community_event_id = @eventId
                ORDER BY uploaded_at ASC
            `);
        return { success: true, images: result.recordset };
    } catch (error) {
        return { success: false, message: 'Failed to get images', error: error.message };
    } finally {
        if (connection) await connection.close();
    }
}

// GET: Get a single community event by ID (with all images)
export async function getCommunityEventById(eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`
                SELECT CommunityEvent.*, Users.name as created_by_name
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.id = @eventId
            `);
        if (result.recordset.length === 0) {
            return { success: false, message: 'Event not found' };
        }
        const event = result.recordset[0];
        // Get all images
        const imagesResult = await getCommunityEventImages(eventId);
        if (imagesResult.success) {
            event.images = imagesResult.images;
        } else {
            event.images = [];
        }
        return { success: true, event };
    } catch (error) {
        return { success: false, message: 'Failed to get event', error: error.message };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// GET: Get image URLs for a community event
export async function getCommunityEventImageUrls(eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const imagesResult = await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`SELECT image_url FROM CommunityEventImage WHERE community_event_id = @eventId`);

        return imagesResult.recordset.map(record => record.image_url);
    } catch (error) {
        console.error('Error getting community event image URLs:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// DELETE: Delete a community event
export async function deleteCommunityEvent(eventId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        // Delete images from CommunityEventImage table first
        await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`
                DELETE FROM CommunityEventImage 
                WHERE community_event_id = @eventId
            `);

        // Delete the event from CommunityEvent table
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .input('userId', sql.Int, userId)
            .query(`
                DELETE FROM CommunityEvent 
                WHERE id = @eventId AND user_id = @userId
            `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Error deleting community event:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// PUT: Update a community event (only by the creator)
export async function updateCommunityEvent(eventId, eventData, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        // Update the event, filtering by user_id to ensure ownership
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .input('userId', sql.Int, userId)
            .input('name', sql.NVarChar(100), eventData.name)
            .input('location', sql.NVarChar(100), eventData.location)
            .input('category', sql.NVarChar(50), eventData.category)
            .input('date', sql.Date, eventData.date)
            .input('time', sql.VarChar(8), eventData.time)
            .input('description', sql.NVarChar(500), eventData.description)
            .query(`
                UPDATE CommunityEvent 
                SET name = @name, location = @location, category = @category, 
                    date = @date, time = @time, description = @description
                WHERE id = @eventId AND user_id = @userId
            `);

        // Check if any rows were affected
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                message: 'Event not found or you do not have permission to edit this event'
            };
        }

        return {
            success: true,
            message: 'Community event updated successfully'
        };
    } catch (error) {
        console.error('Error updating community event:', error);
        return {
            success: false,
            message: 'Failed to update community event',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// DELETE: Delete unwanted images from a community event
export async function deleteUnwantedImages(eventId, userId, keepImageIds) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        // First verify the user owns the event
        const eventCheck = await connection.request()
            .input('eventId', sql.Int, eventId)
            .input('userId', sql.Int, userId)
            .query(`
                SELECT id FROM CommunityEvent 
                WHERE id = @eventId AND user_id = @userId
            `);

        if (eventCheck.recordset.length === 0) {
            return {
                success: false,
                message: 'Event not found or you do not have permission to delete images from this event'
            };
        }

        // Get the image URLs that will be deleted before deleting them
        let imagesToDeleteQuery;
        if (keepImageIds.length === 0) {
            // Delete all images for this event
            imagesToDeleteQuery = `
                SELECT image_url FROM CommunityEventImage 
                WHERE community_event_id = @eventId
            `;
        } else {
            // Delete only unwanted images
            imagesToDeleteQuery = `
                SELECT image_url FROM CommunityEventImage 
                WHERE community_event_id = @eventId 
                AND id NOT IN (SELECT value FROM STRING_SPLIT(@keepImageIds, ','))
            `;
        }

        const imagesToDelete = await connection.request()
            .input('eventId', sql.Int, eventId)
            .input('keepImageIds', sql.NVarChar, keepImageIds.join(','))
            .query(imagesToDeleteQuery);

        const deletedUrls = imagesToDelete.recordset.map(record => record.image_url);

        //delete database data
        if (keepImageIds.length === 0) {
            // Delete all images for this event
            await connection.request()
                .input('eventId', sql.Int, eventId)
                .query(`
                    DELETE FROM CommunityEventImage 
                    WHERE community_event_id = @eventId
                `);
        } else {
            // Delete only unwanted images
            await connection.request()
                .input('eventId', sql.Int, eventId)
                .input('keepImageIds', sql.NVarChar, keepImageIds.join(','))
                .query(`
                    DELETE FROM CommunityEventImage 
                    WHERE community_event_id = @eventId 
                    AND id NOT IN (SELECT value FROM STRING_SPLIT(@keepImageIds, ','))
                `);
        }

        return {
            success: true,
            message: `${deletedUrls.length} images deleted successfully`,
            deletedUrls: deletedUrls
        };
    } catch (error) {
        console.error('Error deleting unwanted images:', error);
        return {
            success: false,
            message: 'Failed to delete unwanted images',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    };
};

// GET: Get all community events pending (for admin approval)
export async function getPendingEvents() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .query(`
                SELECT CommunityEvent.*, Users.name as created_by_name,
                  (SELECT TOP 1 image_url FROM CommunityEventImage WHERE community_event_id = CommunityEvent.id ORDER BY uploaded_at ASC) as image_url
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.approved_by_admin_id IS NULL
                ORDER BY CommunityEvent.created_at DESC
            `);

        return {
            success: true,
            events: result.recordset
        };
    } catch (error) {
        console.error('Error getting pending events:', error);
        return {
            success: false,
            message: 'Failed to get pending events',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// PUT: Approve a community event (as an admin)
export async function approveCommunityEvent(eventId, adminId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .input('adminId', sql.Int, adminId)
            .query(`
                UPDATE CommunityEvent 
                SET approved_by_admin_id = @adminId 
                WHERE id = @eventId AND approved_by_admin_id IS NULL;
                SELECT @@ROWCOUNT as affectedRows;
            `);

        if (result.recordset[0].affectedRows === 0) {
            return {
                success: false,
                message: 'Event not found or already approved/rejected'
            };
        }

        return {
            success: true,
            message: 'Community event approved successfully'
        };
    } catch (error) {
        console.error('Error approving community event:', error);
        return {
            success: false,
            message: 'Failed to approve community event',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// DELETE: Reject/delete a community event
export async function rejectCommunityEvent(eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`
                DELETE FROM CommunityEvent 
                WHERE id = @eventId AND approved_by_admin_id IS NULL;
                SELECT @@ROWCOUNT as affectedRows;
            `);

        if (result.recordset[0].affectedRows === 0) {
            return {
                success: false,
                message: 'Event not found or already approved'
            };
        }

        return {
            success: true,
            message: 'Community event rejected successfully'
        };
    } catch (error) {
        console.error('Error rejecting community event:', error);
        return {
            success: false,
            message: 'Failed to reject community event',
            error: error.message
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}