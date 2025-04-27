import React, { useState, useEffect } from 'react';

const Bettary = () => {
    const [battery, setBattery] = useState({ level: null, charging: null });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let batteryObject = null; // Declare inside useEffect

        const updateBatteryInfo = () => {
            if (batteryObject) {
                setBattery({
                    level: batteryObject.level * 100,
                    charging: batteryObject.charging,
                });
                setIsLoading(false); // Data is loaded
            }
        };

        const getBatteryStatus = async () => {
            if (!('getBattery' in navigator)) {
                setError('Battery API not supported in this browser.');
                setIsLoading(false); //  Still need to stop loading
                return;
            }

            try {
                batteryObject = await navigator.getBattery();
                updateBatteryInfo(); // Initial update

                batteryObject.addEventListener('chargingchange', updateBatteryInfo);
                batteryObject.addEventListener('levelchange', updateBatteryInfo);
            } catch (err) {
                setError(`Error accessing Battery API: ${err.message}`);
                setIsLoading(false); // Stop loading on error
            }
        };

        getBatteryStatus(); // Call immediately

        return () => {
            // Cleanup: remove listeners
            if (batteryObject) {
                batteryObject.removeEventListener('chargingchange', updateBatteryInfo);
                batteryObject.removeEventListener('levelchange', updateBatteryInfo);
            }
        };
    }, []);

    return (
      <>
         {battery.charging ? (
                <p className="w-screen text-center p-2 bg-red-500 text-white">Do not use while charging you mobile</p>
            ) : (
                <></>
            )}
            {battery.level < 20 ? (
                <p className="hidden md:block lg:hidden w-screen text-center p-2 bg-red-500 text-white">Do not use while charging you mobile</p>
            ) : (
                <></>
            )}
      </>
    );
};

export default Bettary;