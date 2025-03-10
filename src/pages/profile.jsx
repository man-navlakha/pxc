import React from 'react';
import 'tailwindcss/tailwind.css';
import Cookies from 'js-cookie';
import GoBack from '../componets/GoBack';
import LastF from '../componets/LastF';
import Footer from '../componets/Footer';
const username = Cookies.get('username') || 'John Doe';

const Profile = () => {
    return (
        <>
        <GoBack />
        <div className="flex flex-col items-center p-6  min-h-screen">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <div className="flex flex-col items-center">
                    <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile" className="w-32 h-32 rounded-full mb-4" />
                    <h1 className="text-2xl font-bold mb-2">{username}</h1>
                

                </div>
                <div className="profile-content">
                    {/* Add your profile content here */}
                </div>
            </div>
        </div>
        <LastF />
        <Footer />
        </>
       
    );
}

export default Profile;