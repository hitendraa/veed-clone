"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export const UserDetailContext = createContext({});

export const UserDetailContextProvider = ({ children }) => {
    const { user } = useUser();
    const [userDetail, setUserDetail] = useState(null);

    useEffect(() => {
        const syncUser = async () => {
            if (user) {
                try {
                    const userData = {
                        fullName: user.fullName,
                        primaryEmailAddress: {
                            email: user.primaryEmailAddress?.emailAddress
                        },
                        imageUrl: user.imageUrl
                    };

                    console.log("Sending user data:", userData);

                    const response = await fetch("/api/user", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user: userData }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`API Error: ${errorData.error}`);
                    }

                    const data = await response.json();
                    setUserDetail(data);
                } catch (error) {
                    console.error("Failed to sync user:", error);
                }
            }
        };
        syncUser();
    }, [user]);

    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            {children}
        </UserDetailContext.Provider>
    );
};

export const useUserDetail = () => useContext(UserDetailContext);