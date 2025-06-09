import React from 'react';

const Footer = () => {
    return (
        <div className="bg-black">
            <div className="flex items-center content-center justify-between px-10 sm:px-10 lg:px-20 py-2 text-xs bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900/60  to-black rounded-t-3xl border-t border-gray-400/90 text-white">
                <div className="w-8">
                    <img src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555" alt="Pixel Class logo" loading="lazy" />
                </div>
                <div className="font-bold">Dhruv ✌️ Man</div>
                <div>© 2025 All rights reserved.</div>
            </div>
        </div>
    );
};

export default Footer;
