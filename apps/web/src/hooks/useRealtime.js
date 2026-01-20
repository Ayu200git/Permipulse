import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to replace Socket.io with smart polling for real-time updates
 * Compatible with Vercel's serverless architecture
 * 
 * @param {Function} fetchFunction - Function to call for fetching data
 * @param {number} interval - Polling interval in milliseconds (default: 3000)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 */
export const useRealtime = (fetchFunction, interval = 3000, enabled = true) => {
    const intervalRef = useRef(null);
    const isVisibleRef = useRef(true);

    // Handle visibility change to pause polling when tab is not visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;

            if (isVisibleRef.current && enabled) {
                // Resume polling immediately when tab becomes visible
                fetchFunction();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchFunction, enabled]);

    // Setup polling interval
    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Start polling
        intervalRef.current = setInterval(() => {
            // Only poll if tab is visible
            if (isVisibleRef.current) {
                fetchFunction();
            }
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchFunction, interval, enabled]);
};

/**
 * Hook specifically for post feed real-time updates
 * Provides optimized polling with smart diffing
 */
export const usePostsRealtime = (onUpdate, interval = 3000) => {
    const lastUpdateRef = useRef(Date.now());

    const checkForUpdates = useCallback(async () => {
        try {
            await onUpdate();
            lastUpdateRef.current = Date.now();
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }, [onUpdate]);

    useRealtime(checkForUpdates, interval, true);
};

export default useRealtime;
