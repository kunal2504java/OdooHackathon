import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../firebase/config';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This listener fires whenever the user's sign-in state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in. Get their data from our Firestore 'users' collection
                const userDocRef = doc(db, `artifacts/${appId}/users`, firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                } else {
                    // If it's a new user, create a document for them in Firestore
                    const newUser = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        pointsBalance: 10, // Give every new user 10 starting points
                        role: 'user',
                        createdAt: new Date()
                    };
                    await setDoc(userDocRef, newUser);
                    setUserData(newUser);
                }
                setUser(firebaseUser);
            } else {
                // User is signed out
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });
        
        // Handle initial auth token if provided by the environment
        const handleInitialAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                }
            } catch (error) {
                console.error("Error with initial authentication:", error);
            }
        };
        
        handleInitialAuth();

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // The value provided to consuming components
    const value = { user, userData, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
    return useContext(AuthContext);
};