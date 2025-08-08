"use client";

import React, { useEffect, useState } from 'react';

const Snowfall: React.FC = () => {
    const [flakes, setFlakes] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const createFlakes = () => {
            const newFlakes = Array.from({ length: 100 }).map((_, i) => {
                const style: React.CSSProperties = {
                    left: `${Math.random() * 100}vw`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: Math.random(),
                    transform: `scale(${Math.random()})`,
                };
                return <div key={i} className="snowflake" style={style}></div>;
            });
            setFlakes(newFlakes);
        };

        createFlakes();
    }, []);

    return (
        <>
            <style jsx global>{`
                .snowflake {
                    position: absolute;
                    top: -20px;
                    width: 5px;
                    height: 5px;
                    background: white;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: fall linear infinite;
                    z-index: 0;
                }

                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
            `}</style>
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]">
                {flakes}
            </div>
        </>
    );
};

export default Snowfall;
