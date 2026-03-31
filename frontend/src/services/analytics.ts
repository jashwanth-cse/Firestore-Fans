import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from './firebase';
import { Platform } from 'react-native';

/**
 * Analytics Service for NexSync
 * Provides typed event logging functions for Firebase Analytics
 * 
 * Note: Firebase Analytics JS SDK works best on web platform.
 * On native platforms, basic event logging is supported but advanced features may be limited.
 */

/**
 * Check if analytics is available
 */
const isAnalyticsAvailable = (): boolean => {
    return analytics !== null && Platform.OS === 'web';
};

/**
 * Log a custom event to Firebase Analytics
 * @param eventName - Name of the event
 * @param params - Optional parameters for the event
 */
export const logAnalyticsEvent = (eventName: string, params?: Record<string, any>) => {
    if (!isAnalyticsAvailable()) {
        console.log(`📊 Analytics (${Platform.OS}):`, eventName, params);
        return;
    }

    try {
        logEvent(analytics!, eventName, params);
        console.log('✅ Analytics event logged:', eventName, params);
    } catch (error) {
        console.error('❌ Analytics event error:', error);
    }
};

/**
 * Log a screen view event
 * @param screenName - Name of the screen
 * @param screenClass - Optional class/category of the screen
 */
export const logScreenView = (screenName: string, screenClass?: string) => {
    logAnalyticsEvent('screen_view', {
        firebase_screen: screenName,
        firebase_screen_class: screenClass || screenName,
    });
};

/**
 * Set the user ID for analytics
 * @param userId - Unique user identifier
 */
export const setAnalyticsUserId = (userId: string | null) => {
    if (!isAnalyticsAvailable()) {
        console.log(`📊 Analytics UserId (${Platform.OS}):`, userId);
        return;
    }

    try {
        setUserId(analytics!, userId);
        console.log('✅ Analytics user ID set:', userId);
    } catch (error) {
        console.error('❌ Analytics setUserId error:', error);
    }
};

/**
 * Set user properties for analytics
 * @param properties - User properties to set
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
    if (!isAnalyticsAvailable()) {
        console.log(`📊 Analytics UserProperties (${Platform.OS}):`, properties);
        return;
    }

    try {
        setUserProperties(analytics!, properties);
        console.log('✅ Analytics user properties set:', properties);
    } catch (error) {
        console.error('❌ Analytics setUserProperties error:', error);
    }
};

// ============================================
// Predefined Event Functions
// ============================================

/**
 * Log user sign up event
 * @param method - Sign up method (e.g., 'email', 'google')
 */
export const logSignUp = (method: string = 'email') => {
    logAnalyticsEvent('sign_up', { method });
};

/**
 * Log user login event
 * @param method - Login method (e.g., 'email', 'google')
 */
export const logLogin = (method: string = 'email') => {
    logAnalyticsEvent('login', { method });
};

/**
 * Log user logout event (custom event)
 */
export const logLogout = () => {
    logAnalyticsEvent('logout', {
        platform: Platform.OS,
    });
};

/**
 * Log event creation in EventSync
 * @param eventType - Type of event created
 * @param venueId - Optional venue ID
 */
export const logEventCreation = (eventType: string, venueId?: string) => {
    logAnalyticsEvent('event_created', {
        event_type: eventType,
        venue_id: venueId,
    });
};

/**
 * Log event approval in EventSync
 * @param eventId - ID of the approved event
 * @param status - Approval status ('approved' or 'rejected')
 */
export const logEventApproval = (eventId: string, status: 'approved' | 'rejected') => {
    logAnalyticsEvent('event_approval', {
        event_id: eventId,
        approval_status: status,
    });
};

/**
 * Log calendar sync action
 * @param eventCount - Number of events synced
 */
export const logCalendarSync = (eventCount: number) => {
    logAnalyticsEvent('calendar_sync', {
        event_count: eventCount,
    });
};

/**
 * Log travel group creation
 * @param destination - Destination of travel
 * @param participantCount - Number of participants
 */
export const logTravelGroupCreation = (destination: string, participantCount: number) => {
    logAnalyticsEvent('travel_group_created', {
        destination,
        participant_count: participantCount,
    });
};

/**
 * Log profile update
 * @param fieldsUpdated - Array of field names that were updated
 */
export const logProfileUpdate = (fieldsUpdated: string[]) => {
    logAnalyticsEvent('profile_updated', {
        fields: fieldsUpdated.join(','),
        field_count: fieldsUpdated.length,
    });
};
