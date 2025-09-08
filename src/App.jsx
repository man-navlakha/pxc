import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import './App.css';
import './index.css';

// --- Page & Component Imports ---
import MainPage from "./MainPage";
import NotFound from './NotFound';
import Sem from './page/Sem';
import Prof from './page/Profile';
import Search_user from './page/user_search';
import Page from './page/Choose';
import FollowingPage from "./page/FollowingPage";
import FollowersPage from "./page/FollowersPage";
import Chat from './page/chat/chat';
import Chatlist from './page/chat/Listuser';
import Password from './auth/password';
import Verification from './auth/verification';
import Signup from './auth/signup';
import Blogin from './auth/Login';
import Forgetpassword from "./auth/Forgetpassword";
import Ns from "./page/mainpages/Ns";
import Nss from "./page/mainpages/Nss";
import Select from "./page/mainpages/Select";
import ResourcePage from "./page/mainpages/ResourcePage";
import Protected from "./ProtectedRoute_new";

function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Effect for handling online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <>
            {!isOnline && (
                <p className="transition-all duration-500 ease-in-out w-screen text-center p-2 bg-red-500 text-white">
                    You are offline!
                </p>
            )}

            <div className="App transition-all duration-500 ease-in-out bg-black">
                <Routes>
                    {/* --- Main & Public Routes --- */}
                    <Route path="/" element={<MainPage />} />
                    <Route path="/auth/login" element={<Blogin />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/verification" element={<Verification />} />
                    <Route path="/auth/forgetpassword" element={<Forgetpassword />} />
                    <Route path="/auth/password/:token" element={<Password />} />

                    {/* --- Protected Routes --- */}
                    <Route path="/sem" element={<Protected><Sem /></Protected>} />
                    <Route path="/search" element={<Protected><Search_user /></Protected>} />
                    <Route path="/following" element={<Protected><FollowingPage /></Protected>} />
                    <Route path="/followers" element={<Protected><FollowersPage /></Protected>} />
                    <Route path="/chat" element={<Protected><Chatlist /></Protected>} />
                    <Route path="/chat/:RECEIVER" element={<Protected><Chat /></Protected>} />
                    <Route path="/profile" element={<Protected><Prof /></Protected>} />
                    <Route path="/profile/:nameFromUrl" element={<Protected><Prof /></Protected>} />

                    {/* Resource and Subject Routes */}
                    <Route path="/:sem/:subject" element={<Protected><Page /></Protected>} />
                    <Route path="/ns" element={<Protected><ResourcePage /></Protected>} />
                    <Route path="/ns/:osubject/:ochoose" element={<Protected><Ns /></Protected>} />
                    <Route path="/nss" element={<Protected><Nss /></Protected>} />
                    <Route path="/nss/:osubject/:ochoose" element={<Protected><Nss /></Protected>} />
                    <Route path="/select/:sid" element={<Protected><Select /></Protected>} />

                    {/* Fallback Route for unmatched paths */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </>
    );
}

export default App;