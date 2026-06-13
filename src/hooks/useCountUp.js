/**
 * CUSTOM HOOK - ANIMATES A NUMERIC VALUE COUNTING FROM 0 UPTO TARGET  
 * 
 * USED IN - PROFILE SECTION TO SHOW STATS (TOTAL UPVOTES, QUESTION COUNT, ANSWER COUNT)
 * 
 * How it works:
 * 1. Uses `requestAnimationFrame` to create a smooth 60fps animation.
 * 2. Calculates the progress of the animation based on elapsed time.
 * 3. Applies a cubic ease‑out function (`1 - (1 - progress)^3`) for a natural deceleration.
 * 4. Updates the displayed value on every frame until progress reaches 1.
 * 5. Cleans up the animation frame when the component unmounts or target/duration changes.
 * 
 * @param {number} target - The final number to count up to.
 * @param {number} duration - Animation duration in milliseconds (default: 1200ms).
 * @returns {number} - The current animated value (starts at 0, increments to target).
*/

import { useState, useEffect } from "react";

export function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let start = null;
        let frame;

        const step = (timestamp) => {
            if(!start) {
                start = timestamp;
            }

            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            
            if(progress < 1) {
                frame = requestAnimationFrame(step);
            }
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}