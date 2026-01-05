import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { validateSeceEmail } from '../utils/validation';
import {
    logSignUp,
    logLogin,
    logLogout,
    setAnalyticsUserId,
    setAnalyticsUserProperties
} from './analytics';

interface UserProfile {
    uid: string;
    email: string;
    role: 'student' | 'faculty' | 'admin';
    isHosteler: boolean;
    createdAt: string;
    displayName?: string;
    department?: string;
    year?: number;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
    email: string,
    password: string,
    profile: Partial<UserProfile>
): Promise<UserCredential> => {
    // Validate SECE email domain
    if (!validateSeceEmail(email)) {
        throw new Error('Only @sece.ac.in emails are allowed');
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user profile in Firestore
        const userProfile: UserProfile = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            role: profile.role || 'student',
            isHosteler: profile.isHosteler || false,
            createdAt: new Date().toISOString(),
            displayName: profile.displayName || '',
            department: profile.department || '',
            year: profile.year || 1,
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

        // Track signup event in analytics
        logSignUp('email');
        setAnalyticsUserId(userCredential.user.uid);
        setAnalyticsUserProperties({
            role: userProfile.role,
            is_hosteler: userProfile.isHosteler,
            user_type: userProfile.role,
        });

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign up');
    }
};

/**
 * Sign in an existing user
 */
export const signIn = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Track login event in analytics
        logLogin('email');
        setAnalyticsUserId(userCredential.user.uid);

        // Fetch and set user properties for analytics
        try {
            const profile = await getUserProfile(userCredential.user.uid);
            if (profile) {
                setAnalyticsUserProperties({
                    role: profile.role,
                    is_hosteler: profile.isHosteler,
                    user_type: profile.role,
                });
            }
        } catch (error) {
            console.warn('Failed to set analytics user properties:', error);
        }

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in');
    }
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
    try {
        // Track logout event before signing out
        logLogout();
        setAnalyticsUserId(null);

        await signOut(auth);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign out');
    }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to get user profile');
    }
};
