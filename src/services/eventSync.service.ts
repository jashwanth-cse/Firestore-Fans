import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from './firebase';

// Backend API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add Firebase ID token to all requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - could trigger logout here
            console.error('Authentication error - token may be expired');
        }
        return Promise.reject(error);
    }
);

/**
 * EventSync API Service
 */
export const eventSyncAPI = {
    /**
     * Extract event data from natural language
     */
    extractEvent: async (userText: string) => {
        const response = await apiClient.post('/api/events/extract', { userText });
        return response.data;
    },

    /**
     * Find available venues matching requirements
     */
    findAvailableVenues: async (requirements: {
        date: string;
        startTime: string;
        durationHours: number;
        seatsRequired: number;
        facilitiesRequired: string[];
    }) => {
        const response = await apiClient.post('/api/events/findAvailable', requirements);
        // Helper to consistently return array even if malformed
        return response.data?.venues || [];
    },

    /**
     * Get AI-powered venue suggestions
     */
    suggestAlternatives: async (eventRequirements: any) => {
        const response = await apiClient.post('/api/events/suggestAlternative', eventRequirements);
        return response.data;
    },

    /**
     * Submit event request for admin approval
     */
    submitRequest: async (eventData: {
        eventName: string;
        description?: string;
        date: string;
        startTime: string;
        durationHours: number;
        seatsRequired: number;
        facilitiesRequired: string[];
        venueId: string;
    }) => {
        const response = await apiClient.post('/api/events/submitRequest', eventData);
        return response.data;
    },

    /**
     * Get user's pending event requests
     */
    getPendingEvents: async (userId: string) => {
        const response = await apiClient.get(`/api/events/pending/${userId}`);
        return response.data;
    },

    /**
     * Get user's approved events
     */
    getApprovedEvents: async (userId: string) => {
        const response = await apiClient.get(`/api/events/approved/${userId}`);
        return response.data;
    },

    /**
     * Sync approved event to Google Calendar
     */
    syncToCalendar: async (approvedEventId: string) => {
        const response = await apiClient.post('/api/events/syncCalendar', { approvedEventId });
        return response.data;
    },

    // Admin endpoints
    admin: {
        /**
         * Approve pending request
         */
        approveRequest: async (requestId: string) => {
            const response = await apiClient.post('/api/admin/approve', { requestId });
            return response.data;
        },

        /**
         * Reject pending request
         */
        rejectRequest: async (requestId: string, reason?: string) => {
            const response = await apiClient.post('/api/admin/reject', { requestId, reason });
            return response.data;
        },

        /**
         * Get all pending requests (admin view)
         */
        getAllPending: async () => {
            const response = await apiClient.get('/api/admin/pending');
            return response.data;
        },
    },
};

export default apiClient;
