"use client";

import { useEffect } from "react";
import { updateHeartbeat } from "@/app/actions/users";

export default function Heartbeat() {
    useEffect(() => {
        // Run once on mount
        updateHeartbeat();

        // Run every 2 minutes
        const interval = setInterval(() => {
            updateHeartbeat();
        }, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null; // Hidden component
}
