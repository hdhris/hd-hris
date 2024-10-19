'use client'
import React, { useEffect } from 'react';

const DebugOutline: React.FC = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                const allElements = document.querySelectorAll<HTMLElement>("*");
                allElements.forEach((element) => {
                    element.classList.toggle("outline");
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // Empty dependency array to ensure the effect runs once when the component mounts

    return null; // Since this is just an effect, return null as there's no UI to render
};

export default DebugOutline;
