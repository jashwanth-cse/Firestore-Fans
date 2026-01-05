import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import react-icons only for web
let FaCalendarCheck: any, FaPlane: any, FaUser: any, FaComments: any, FaMapMarkerAlt: any;
let FaClock: any, FaCheckCircle: any, FaBuilding: any, FaExclamationCircle: any, FaClipboard: any;
let FaUsers: any, FaWrench: any, FaCheck: any, FaInfoCircle: any, FaPencilAlt: any, FaArrowRight: any;
let FaShieldAlt: any, FaChevronRight: any, FaPaperPlane: any, FaLightbulb: any, FaSignOutAlt: any;
let FaCheckSquare: any, FaRegLightbulb: any, FaRegCheckCircle: any;
let FaEye: any, FaEyeSlash: any;

if (Platform.OS === 'web') {
    const fa = require('react-icons/fa');
    FaCalendarCheck = fa.FaCalendarCheck;
    FaPlane = fa.FaPlane;
    FaUser = fa.FaUser;
    FaComments = fa.FaComments;
    FaMapMarkerAlt = fa.FaMapMarkerAlt;
    FaClock = fa.FaClock;
    FaCheckCircle = fa.FaCheckCircle;
    FaBuilding = fa.FaBuilding;
    FaExclamationCircle = fa.FaExclamationCircle;
    FaClipboard = fa.FaClipboard;
    FaUsers = fa.FaUsers;
    FaWrench = fa.FaWrench;
    FaCheck = fa.FaCheck;
    FaInfoCircle = fa.FaInfoCircle;
    FaPencilAlt = fa.FaPencilAlt;
    FaArrowRight = fa.FaArrowRight;
    FaShieldAlt = fa.FaShieldAlt;
    FaChevronRight = fa.FaChevronRight;
    FaPaperPlane = fa.FaPaperPlane;
    FaLightbulb = fa.FaLightbulb;
    FaSignOutAlt = fa.FaSignOutAlt;
    FaCheckSquare = fa.FaCheckSquare;
    FaRegLightbulb = fa.FaRegLightbulb;
    FaRegCheckCircle = fa.FaRegCheckCircle;
    FaEye = fa.FaEye;
    FaEyeSlash = fa.FaEyeSlash;
}

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
}

/**
 * Platform-aware Icon component
 * Uses react-icons on web, MaterialCommunityIcons on native
 */
export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
    if (Platform.OS === 'web') {
        // Map Material icon names to React Icons
        const iconMap: Record<string, any> = {
            'calendar-check': FaCalendarCheck,
            'airplane': FaPlane,
            'account': FaUser,
            'chat-processing': FaComments,
            'map-marker-multiple': FaMapMarkerAlt,
            'map-marker': FaMapMarkerAlt,
            'clock-outline': FaClock,
            'clock': FaClock,
            'check-circle': FaCheckCircle,
            'office-building': FaBuilding,
            'alert-circle': FaExclamationCircle,
            'clipboard-text': FaClipboard,
            'calendar': FaCalendarCheck,
            'account-group': FaUsers,
            'wrench': FaWrench,
            'check': FaCheck,
            'information': FaInfoCircle,
            'information-outline': FaInfoCircle,
            'pencil': FaPencilAlt,
            'arrow-right': FaArrowRight,
            'shield-account': FaShieldAlt,
            'chevron-right': FaChevronRight,
            'send': FaPaperPlane,
            'lightbulb-on': FaLightbulb,
            'lightbulb-on-outline': FaRegLightbulb,
            'logout': FaSignOutAlt,
            'checkbox-marked-circle-outline': FaRegCheckCircle,
            'eye': FaEye,
            'eye-off': FaEyeSlash,
        };

        const IconComponent = iconMap[name] || FaInfoCircle;

        return <IconComponent size={size} color={color} style={style} />;
    }

    // Native: Use MaterialCommunityIcons
    return (
        <MaterialCommunityIcons
            name={name as any}
            size={size}
            color={color}
            style={style}
        />
    );
};

export default Icon;
