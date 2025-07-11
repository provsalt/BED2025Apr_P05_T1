import rateLimit from "express-rate-limit";

const getRealIP = (req) => {
    // In production with Caddy reverse proxy, use X-Real-IP header
    // In development, fallback to connection remoteAddress
    return req.headers["x-real-ip"] || 
           req.headers["x-forwarded-for"]?.split(",")[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.ip;
};

export const createRateLimit = ({
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 500, // limit each IP to 100 requests per windowMs
    message = "Too many requests from this IP, please try again later",
    standardHeaders = true,
    legacyHeaders = false,
} = {}) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders,
        legacyHeaders,
        keyGenerator: getRealIP,
        skip: (req) => {
            // future prometheus feature
            return req.path === "/health" || req.path === "/api/health";
        }
    });
};

export const defaultRateLimit = createRateLimit();

// Stricter rate limiter for auth endpoints
export const authRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth
    message: "Too many authentication attempts, please try again later"
});

export const openaiRateLimit = createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: "Too many OpenAI requests, please try again later"
});