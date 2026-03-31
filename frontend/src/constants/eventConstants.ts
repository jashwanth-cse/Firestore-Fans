import { Event, Venue, EventStatus, VenueStatus } from '../types/event.types';

// Facility Types
export const FACILITIES = {
    PROJECTOR: 'Projector',
    COMPUTERS: 'Computers',
    AC: 'Air Conditioning',
    WIFI: 'WiFi',
    WHITEBOARD: 'Whiteboard',
    AUDIO_SYSTEM: 'Audio System',
    VIDEO_CONFERENCING: 'Video Conferencing',
    LAB_EQUIPMENT: 'Lab Equipment',
} as const;

// Status Colors
export const STATUS_COLORS: Record<EventStatus | VenueStatus, string> = {
    available: '#10B981', // Green
    occupied: '#EF4444', // Red
    pending: '#F59E0B', // Orange
    approved: '#4B0082', // Indigo
    rejected: '#DC2626', // Dark Red
};

// Mock Venues Data
export const MOCK_VENUES: Venue[] = [
    {
        id: 'v1',
        name: 'Main Auditorium',
        capacity: 500,
        facilities: [FACILITIES.PROJECTOR, FACILITIES.AC, FACILITIES.AUDIO_SYSTEM],
        isAvailable: true,
        occupiedTimes: [
            {
                date: '2026-01-05',
                startTime: '14:00',
                endTime: '16:00',
            },
        ],
        building: 'Admin Block',
        floor: 1,
    },
    {
        id: 'v2',
        name: 'Computer Lab 1',
        capacity: 60,
        facilities: [FACILITIES.COMPUTERS, FACILITIES.AC, FACILITIES.PROJECTOR],
        isAvailable: true,
        occupiedTimes: [],
        building: 'CSE Block',
        floor: 2,
    },
    {
        id: 'v3',
        name: 'Seminar Hall',
        capacity: 200,
        facilities: [
            FACILITIES.PROJECTOR,
            FACILITIES.AC,
            FACILITIES.WIFI,
            FACILITIES.AUDIO_SYSTEM,
        ],
        isAvailable: false,
        occupiedTimes: [
            {
                date: '2026-01-03',
                startTime: '09:00',
                endTime: '17:00',
            },
        ],
        building: 'Admin Block',
        floor: 2,
    },
    {
        id: 'v4',
        name: 'Open Air Theater',
        capacity: 300,
        facilities: [FACILITIES.AUDIO_SYSTEM],
        isAvailable: true,
        occupiedTimes: [],
        building: 'Campus Grounds',
    },
    {
        id: 'v5',
        name: 'Conference Room',
        capacity: 50,
        facilities: [
            FACILITIES.WHITEBOARD,
            FACILITIES.AC,
            FACILITIES.VIDEO_CONFERENCING,
            FACILITIES.WIFI,
        ],
        isAvailable: true,
        occupiedTimes: [],
        building: 'Admin Block',
        floor: 3,
    },
    {
        id: 'v6',
        name: 'Computer Lab 2',
        capacity: 80,
        facilities: [
            FACILITIES.COMPUTERS,
            FACILITIES.AC,
            FACILITIES.PROJECTOR,
            FACILITIES.LAB_EQUIPMENT,
        ],
        isAvailable: true,
        occupiedTimes: [],
        building: 'CSE Block',
        floor: 3,
    },
];

// Mock Events Data
export const MOCK_PENDING_EVENTS: Event[] = [
    {
        id: 'e1',
        name: 'AI Workshop',
        description: 'Introduction to Machine Learning',
        date: '2026-01-05',
        startTime: '10:00',
        duration: 120,
        requiredSeats: 50,
        facilities: [FACILITIES.PROJECTOR, FACILITIES.WIFI],
        status: 'pending',
        venueId: 'v5',
        venueName: 'Conference Room',
        createdAt: '2026-01-01T10:00:00Z',
    },
    {
        id: 'e2',
        name: 'Coding Contest',
        description: 'Annual programming competition',
        date: '2026-01-08',
        startTime: '09:00',
        duration: 240,
        requiredSeats: 60,
        facilities: [FACILITIES.COMPUTERS, FACILITIES.AC],
        status: 'pending',
        venueId: 'v2',
        venueName: 'Computer Lab 1',
        createdAt: '2026-01-01T11:30:00Z',
    },
];

export const MOCK_APPROVED_EVENTS: Event[] = [
    {
        id: 'e3',
        name: 'Department Seminar',
        description: 'Monthly CSE department meeting',
        date: '2026-01-04',
        startTime: '14:00',
        duration: 90,
        requiredSeats: 100,
        facilities: [FACILITIES.PROJECTOR, FACILITIES.AC],
        status: 'approved',
        venueId: 'v3',
        venueName: 'Seminar Hall',
        createdAt: '2025-12-28T09:00:00Z',
    },
    {
        id: 'e4',
        name: 'Cultural Fest Opening',
        description: 'Inauguration ceremony',
        date: '2026-01-10',
        startTime: '16:00',
        duration: 180,
        requiredSeats: 500,
        facilities: [FACILITIES.AUDIO_SYSTEM, FACILITIES.PROJECTOR],
        status: 'approved',
        venueId: 'v1',
        venueName: 'Main Auditorium',
        createdAt: '2025-12-25T14:00:00Z',
    },
    {
        id: 'e5',
        name: 'Tech Talk Series',
        description: 'Guest lecture on Cloud Computing',
        date: '2026-01-06',
        startTime: '11:00',
        duration: 60,
        requiredSeats: 45,
        facilities: [FACILITIES.PROJECTOR, FACILITIES.WHITEBOARD],
        status: 'approved',
        venueId: 'v5',
        venueName: 'Conference Room',
        createdAt: '2025-12-30T16:00:00Z',
    },
];

// Example prompts for chat input
export const EXAMPLE_PROMPTS = [
    'Next Tuesday morning I need a lab for 60 students with computers for a coding contest',
    'I need an auditorium for the annual day celebration on coming Saturday for 500 people from morning to evening',
    'I need a seminar hall with projector for 100 people tomorrow afternoon',
    'Reserve computer lab for AI workshop on Friday, 2 hours, 50 students',
];
