// Event Types and Interfaces

export type EventStatus = 'pending' | 'approved' | 'rejected';
export type VenueStatus = 'available' | 'occupied';

export interface TimeSlot {
    date: string; // ISO date string
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
}

export interface Event {
    id: string;
    name: string;
    description?: string;
    date: string; // ISO date string
    startTime: string; // HH:mm format
    duration: number; // minutes
    requiredSeats: number;
    facilities: string[];
    status: EventStatus;
    venueId?: string;
    venueName?: string;
    createdBy?: string;
    createdAt?: string;
    calendarEventId?: string | null; // Google Calendar event ID
}

export interface Venue {
    id: string;
    name: string;
    capacity: number;
    facilities: string[];
    isAvailable: boolean;
    occupiedTimes: TimeSlot[];
    building?: string;
    floor?: number;
}

export interface ExtractedEventData {
    eventName: string;
    date: string;
    startTime: string;
    duration: number;
    requiredSeats: number;
    facilities: string[];
}

export interface AlternativeVenueSuggestion {
    venue: Venue;
    reason: string;
    matchScore: number; // 0-100
}
