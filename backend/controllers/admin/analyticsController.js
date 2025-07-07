import {
    createUserSession,
    endUserSession,
    trackFeatureUsage,
    getUserEngagementMetrics,
    getAllUsersEngagementMetrics,
    getMostUsedFeatures,
    getDailyActiveUsers,
    getUserRetentionMetrics,
    updateEngagementSummary
} from "../../models/admin/analyticsModel.js";
import { z } from "zod/v4";

// Validation schemas
const dateRangeSchema = z.object({
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str))
});

const featureTrackingSchema = z.object({
    featureName: z.string().min(1).max(100),
    actionType: z.string().min(1).max(50),
    pageUrl: z.string().url().optional(),
    sessionId: z.number().int().positive().optional(),
    additionalData: z.string().optional()
});

/**
 * Start a new user session
 */
export const startSessionController = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const sessionData = {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            deviceType: req.body.deviceType || 'unknown'
        };

        const sessionId = await createUserSession(req.user.id, sessionData);
        res.status(201).json({ sessionId });
    } catch (error) {
        console.error("Error starting session:", error);
        res.status(500).json({ error: "Error starting session" });
    }
};

/**
 * End a user session
 */
export const endSessionController = async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId || isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
    }

    try {
        await endUserSession(parseInt(sessionId));
        res.status(200).json({ message: "Session ended successfully" });
    } catch (error) {
        console.error("Error ending session:", error);
        res.status(500).json({ error: "Error ending session" });
    }
};

/**
 * Track feature usage
 */
export const trackFeatureController = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const validate = featureTrackingSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: "Invalid tracking data", details: validate.error.issues });
    }

    try {
        await trackFeatureUsage(req.user.id, validate.data);
        res.status(201).json({ message: "Feature usage tracked" });
    } catch (error) {
        console.error("Error tracking feature usage:", error);
        res.status(500).json({ error: "Error tracking feature usage" });
    }
};

/**
 * Get user engagement metrics (Admin only)
 */
export const getUserEngagementController = async (req, res) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const metrics = await getUserEngagementMetrics(
            parseInt(userId),
            new Date(startDate),
            new Date(endDate)
        );
        res.status(200).json(metrics);
    } catch (error) {
        console.error("Error fetching user engagement metrics:", error);
        res.status(500).json({ error: "Error fetching engagement metrics" });
    }
};

/**
 * Get engagement metrics for all users (Admin only)
 */
export const getAllUsersEngagementController = async (req, res) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const metrics = await getAllUsersEngagementMetrics(
            new Date(startDate),
            new Date(endDate),
            parseInt(limit),
            parseInt(offset)
        );
        res.status(200).json(metrics);
    } catch (error) {
        console.error("Error fetching all users engagement metrics:", error);
        res.status(500).json({ error: "Error fetching engagement metrics" });
    }
};

/**
 * Get most used features (Admin only)
 */
export const getMostUsedFeaturesController = async (req, res) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const features = await getMostUsedFeatures(
            new Date(startDate),
            new Date(endDate),
            parseInt(limit)
        );
        res.status(200).json(features);
    } catch (error) {
        console.error("Error fetching most used features:", error);
        res.status(500).json({ error: "Error fetching feature usage data" });
    }
};

/**
 * Get daily active users (Admin only)
 */
export const getDailyActiveUsersController = async (req, res) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const dailyUsers = await getDailyActiveUsers(
            new Date(startDate),
            new Date(endDate)
        );
        res.status(200).json(dailyUsers);
    } catch (error) {
        console.error("Error fetching daily active users:", error);
        res.status(500).json({ error: "Error fetching daily active users" });
    }
};

/**
 * Get user retention metrics (Admin only)
 */
export const getUserRetentionController = async (req, res) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const retentionData = await getUserRetentionMetrics(
            new Date(startDate),
            new Date(endDate)
        );
        res.status(200).json(retentionData);
    } catch (error) {
        console.error("Error fetching retention metrics:", error);
        res.status(500).json({ error: "Error fetching retention metrics" });
    }
};

/**
 * Get analytics dashboard data (Admin only)
 */
export const getAnalyticsDashboardController = async (req, res) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
    }

    try {
        const [
            userMetrics,
            featuresData,
            dailyUsers,
            retentionData
        ] = await Promise.all([
            getAllUsersEngagementMetrics(new Date(startDate), new Date(endDate), 10, 0),
            getMostUsedFeatures(new Date(startDate), new Date(endDate), 5),
            getDailyActiveUsers(new Date(startDate), new Date(endDate)),
            getUserRetentionMetrics(new Date(startDate), new Date(endDate))
        ]);

        const dashboardData = {
            userEngagement: userMetrics,
            topFeatures: featuresData,
            dailyActiveUsers: dailyUsers,
            retention: retentionData,
            summary: {
                totalUsers: userMetrics.length,
                avgSessionDuration: userMetrics.reduce((sum, user) => sum + (user.avg_session_duration || 0), 0) / userMetrics.length || 0,
                totalSessions: userMetrics.reduce((sum, user) => sum + (user.total_sessions || 0), 0),
                mostPopularFeature: featuresData[0]?.feature_name || 'None'
            }
        };

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Error fetching analytics dashboard:", error);
        res.status(500).json({ error: "Error fetching analytics dashboard" });
    }
};
