import React, { useState, useEffect } from 'react';

const Timer = () => {
    const [seconds, setSeconds] = useState(59);

    useEffect(() => {
        if (seconds > 0) {
            const timer = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [seconds]);

    return (
        <div className="flex flex-col items-center justify-center h-screen dark:bg-blue-600 dark:text-white bg-white text-blue-600">
            <h1 className='-p-3'>Please wait! while our free render server is on</h1>
                <img 
                    src="https://ik.imagekit.io/pxc/Loader.gif" 
                    alt="Timer Icon" 
                    className="w-64 h-64"
                />
            <div className=" rounded-full bg-blue-500 flex items-center justify-center">
            </div>
        </div>
    );
};

export default Timer;