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

// PUT: Update a community event (only by the creator) - sets approved_by_admin_id to NULL for re-approval
export async function updateCommunityEvent(eventId, eventData, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        // Update the event and set approved_by_admin_id to NULL for re-approval
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
                    date = @date, time = @time, description = @description,
                    approved_by_admin_id = NULL
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
            message: 'Community event updated successfully and pending admin approval'
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
    };
};

// POST: Sign up a user for a community event
export async function signUpForCommunityEvent(userId, eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        //check if user is already signed up for this event
        const signupResult = await connection.request()
            .input('userId', sql.Int, userId)
            .input('eventId', sql.Int, eventId)
            .query(`
                SELECT user_id, community_event_id, signed_up_at
                FROM CommunityEventSignup 
                WHERE user_id = @userId AND community_event_id = @eventId
            `);

        if (signupResult.recordset.length > 0) {
            return {
                success: false,
                message: 'User is already signed up for this event'
            };
        }

        // Check if event exists
        const eventResult = await connection.request()
            .input('eventId', sql.Int, eventId)
            .query(`
                SELECT CommunityEvent.*, Users.name as created_by_name
                FROM CommunityEvent
                JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEvent.id = @eventId
            `);

        if (eventResult.recordset.length === 0) {
            return {
                success: false,
                message: 'Event not found'
            };
        }

        const event = eventResult.recordset[0];
        if (!event.approved_by_admin_id) {
            return {
                success: false,
                message: 'Event is not approved'
            };
        }

        // Check if event is in the past
        const eventDate = event.date;
        const eventTime = event.time;

        const eventDateObj = new Date(eventDate);

        // Parse the time 
        if (eventTime) {
            let hours, minutes, seconds;

            if (eventTime instanceof Date) {
                const utcHours = eventTime.getUTCHours();
                const utcMinutes = eventTime.getUTCMinutes();
                const utcSeconds = eventTime.getUTCSeconds();

                hours = utcHours;
                minutes = utcMinutes;
                seconds = utcSeconds;
            } else {
                // If eventTime is a string, parse it
                const timeString = eventTime.toString();
                if (timeString.includes(':')) {
                    const timeParts = timeString.split(':');
                    if (timeParts.length >= 2) {
                        hours = parseInt(timeParts[0], 10);
                        minutes = parseInt(timeParts[1], 10);
                        seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
                    }
                }
            }

            // Set the time if we successfully parsed it
            if (hours !== undefined && minutes !== undefined) {
                eventDateObj.setHours(hours, minutes, seconds || 0, 0);
            }
        }

        const eventDateTime = eventDateObj;
        const currentDateTime = new Date();

        //convert both to UTC timestamps for accuracy
        const eventTimestamp = eventDateTime.getTime();
        const currentTimestamp = currentDateTime.getTime();

        //round both timestamps to the nearest minute (60 seconds * 1000 milliseconds)
        const eventTimestampRounded = Math.floor(eventTimestamp / 60000) * 60000;
        const currentTimestampRounded = Math.floor(currentTimestamp / 60000) * 60000;


        //check if event is in the past or happening now (less than or equal to current time)
        if (eventTimestampRounded <= currentTimestampRounded) {
            return {
                success: false,
                message: 'Event is in the past or happening now'
            };
        }


        //dont allow user to sign up for their own event
        if (event.user_id === userId) {
            return {
                success: false,
                message: 'You cannot sign up for your own event'
            };
        }

        // Insert the signup record
        try {
            await connection.request()
                .input('userId', sql.Int, userId)
                .input('eventId', sql.Int, eventId)
                .query(`
                    INSERT INTO CommunityEventSignup (user_id, community_event_id)
                    VALUES (@userId, @eventId)
                `);
        } catch (insertError) {
            throw insertError;
        }

        return {
            success: true,
            message: 'Successfully signed up for event',
            eventName: event.name
        };

    } catch (error) {
        console.error('Error in signUpForEvent:', error);
        return {
            success: false,
            message: 'Database error occurred'
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// GET: Get all events that a user has signed up for
export async function getUserSignedUpEvents(userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    CommunityEvent.id,
                    CommunityEvent.name,
                    CommunityEvent.location,
                    CommunityEvent.category,
                    CommunityEvent.date,
                    CommunityEvent.time,
                    CommunityEvent.description,
                    CommunityEventSignup.signed_up_at,
                    Users.name as created_by_name
                FROM CommunityEventSignup 
                INNER JOIN CommunityEvent ON CommunityEventSignup.community_event_id = CommunityEvent.id
                INNER JOIN Users ON CommunityEvent.user_id = Users.id
                WHERE CommunityEventSignup.user_id = @userId
                ORDER BY CommunityEvent.date ASC, CommunityEvent.time ASC
            `);

        return {
            success: true,
            events: result.recordset
        };

    } catch (error) {
        console.error('Error in getUserSignedUpEvents:', error);
        return {
            success: false,
            message: 'Database error occurred'
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

        // Get all images for this event that are NOT in keepImageIds
        let imagesToDelete;
        if (keepImageIds.length === 0) {
            // If no images to keep, delete all images for this event
            imagesToDelete = await connection.request()
                .input('eventId', sql.Int, eventId)
                .query(`
                    SELECT id, image_url 
                    FROM CommunityEventImage 
                    WHERE community_event_id = @eventId
                `);
        } else {
            // If there are images to keep, delete only the unwanted ones
            const keepIdsParam = keepImageIds.join(',');
            imagesToDelete = await connection.request()
                .input('eventId', sql.Int, eventId)
                .query(`
                    SELECT id, image_url 
                    FROM CommunityEventImage 
                    WHERE community_event_id = @eventId 
                    AND id NOT IN (${keepIdsParam})
                `);
        }

        const deletedUrls = [];

        // Delete each unwanted image
        for (const image of imagesToDelete.recordset) {
            await connection.request()
                .input('imageId', sql.Int, image.id)
                .query(`
                    DELETE FROM CommunityEventImage WHERE id = @imageId
                `);
            deletedUrls.push(image.image_url);
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
    }
}

// DELETE: Cancel a user's signup for a community event
export async function cancelCommunityEventSignup(userId, eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        // Check if user is signed up for this event
        const signupResult = await connection.request()
            .input('userId', sql.Int, userId)
            .input('eventId', sql.Int, eventId)
            .query(`
                SELECT user_id, community_event_id, signed_up_at
                FROM CommunityEventSignup 
                WHERE user_id = @userId AND community_event_id = @eventId
            `);

        if (signupResult.recordset.length === 0) {
            return {
                success: false,
                message: 'User is not signed up for this event'
            };
        }

        // Delete the signup record
        await connection.request()
            .input('userId', sql.Int, userId)
            .input('eventId', sql.Int, eventId)
            .query(`
                DELETE FROM CommunityEventSignup 
                WHERE user_id = @userId AND community_event_id = @eventId
            `);

        return {
            success: true,
            message: 'Successfully cancelled event signup'
        };

    } catch (error) {
        console.error('Error in cancelEventSignup:', error);
        return {
            success: false,
            message: 'Database error occurred'
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

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

