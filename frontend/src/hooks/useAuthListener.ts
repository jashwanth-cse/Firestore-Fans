import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Global Auth Listener
 * Syncs Firebase Auth state with Zustand store
 */
export function useAuthListener() {
    const { setUser, setRole, setLoading, setHostelerStatus } = useAuthStore();

    useEffect(() => {
        console.log('🔌 Initializing Auth Listener...');

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('👤 Auth State Changed:', user ? `User ${user.uid}` : 'Logged Out');

            if (user) {
                // 1. Set User Basic Info
                setUser(user);

                // 2. Fetch Extra Claims / Firestore Data (Role)
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setRole(userData.role || 'student');
                        setHostelerStatus(userData.isHosteler || false);
                        console.log('🎭 Role Sync:', userData.role);
                    } else {
                        // Default if doc missing
                        setRole('student');
                        console.warn('⚠️ User doc missing, default role: student');
                    }
                } catch (error) {
                    console.error('❌ Error fetching user role:', error);
                    // Fallback to prevent infinite loading
                    setRole('student');
                }
            } else {
                // Logout cleanup
                setUser(null);
                setRole(null);
                setHostelerStatus(false);
            }

            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [setUser, setRole, setLoading, setHostelerStatus]);
}
