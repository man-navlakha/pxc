import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import './App.css';

// Beta configs

// chats
import Chat from './page/chat/chat';
import Chatlist from './page/chat/Listuser';



import Password from './auth/password';
import Verification from './auth/verification';
import Signup from './auth/signup';
import Blogin from './auth/Login';
import Sem from './page/Sem';
import Prof from './page/Profile';
import Search_user from './page/user_search';

import Ns from "./page/mainpages/Ns";
import Nss from "./page/mainpages/Nss";
import Select from "./page/mainpages/Select";

import MainPage from "./MainPage";

//Normal 
import NotFound from './NotFound';
import Logout from './old/newcom/Logout';

import './index.css';

import Team from './old/pages/Team';
import Career from './old/pages/Career';
import Search from "./old/pages/Search";
import ProtectedRoute from "./ProtectedRoute";
import Protected from "./ProtectedRoute_new";


import Homeo from './old/newcom/home';
import Subj from './old/newcom/Subj';
import Choose from "./old/pages/Choose";
import Login from './old/newcom/Login';
import Pdfs from "./old/pages/pdfs";
import NotesSharingPage from './old/newcom/NotesSharingPage';
import Exam from "./old/pages/exam";
import Profile from "./old/pages/profile";
import Forgetpassword from "./auth/Forgetpassword";
import FollowingPage from "./page/FollowingPage";
import FollowersPage from "./page/FollowersPage";

// import Sign from './old/newcom/Sign';
// import Verify from './old/newcom/veri';
// import Sub from './old/newcom/Sub';
// import Open from './old/newcom/open';
// import Forgetpassword from './pages/Forgetpassword';
// import Newpassword from './old/newcom/newpassword';
// import Load from './old/componets/Timer'
// import Bettary from "./utils/Bettary";
// import Footer from './old/componets/Footer';
// import Maintainces from "./pages/MaintenancePage";
// import Faq from './old/pages/Faq';
// import Help from './old/pages/Help';


function App() {
    const [loading, setLoading] = useState(true); // Add loading state
    const [userName, setUserName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [courses, setCourses] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);


    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup: Remove event listeners when the component unmounts
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Empty dependency array means this effect runs only once on mount


    useEffect(() => {
        // Retrieve the 'username' cookie value
        const storedUserName = Cookies.get("username");

        if (storedUserName && storedUserName !== "undefined") {
            setUserName(storedUserName); // Set the username from cookie
            setIsLoggedIn(true); // Mark the user as logged in
        } else {
            setUserName("Guest"); // Default name if cookie is not found
            setIsLoggedIn(false); // Mark the user as not logged in
        }

        axios.post("https://pixel-classes.onrender.com/api/home/courses", {})
            .then(response => {
                setCourses(response.data.CourseList); // Set the courses state with the fetched data
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch(error => {
                console.error("Error fetching courses:", error);
                setLoading(false); // Set loading to false in case of error
            });
    }, []);

    return (
        <>
            {isOnline ? (
                <></>
            ) : (
                <p className="transition-all duration-500 ease-in-out w-screen text-center p-2 bg-red-500 text-white">You are offline!</p>
            )}
            {/* <p className={` ${loading ? 'visible ':'hidden'} w-screen text-center p-2 bg-blue-500 text-white`} ><span className="m-2">Please wait!</span> <span className="m-2">Please wait!</span> <span className="m-2">Please wait!</span></p> */}

            <div className="App transition-all duration-500 ease-in-out dark:bg-[#1e1e1e] dark:text-white bg-black">
                <Routes>
                    <Route path="*" element={<NotFound />} />

                    {/* Beta */}
                    <Route
                        path="/search"
                        element={
                            <Protected>
                                <Search_user />
                            </Protected>
                        }
                    />
                    <Route path="/following" element={<Protected> <FollowingPage /></Protected>} />
                    <Route path="/follwers" element={<Protected> <FollowersPage /></Protected>} />

                    <Route path="/chat" element={<Protected> <Chatlist /></Protected>} />
                    <Route path="/chat/:RECEIVER" element={<Protected> <Chat /></Protected>} />


                    <Route path="/auth/forgetpassword" element={<Forgetpassword />} />
                    <Route path="/auth/password/:token" element={<Password />} />
                    <Route path="/auth/verification" element={<Verification />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/login" element={<Blogin />} />
                    <Route path="/" element={<MainPage />} />
                    <Route path="/sem" element={<Protected> <Sem /></Protected>} />
                    <Route path="/profile" element={<Protected> <Prof /></Protected>} />
                    <Route path="/profile/:nameFromUrl" element={<Protected> <Prof /></Protected>} />
                    <Route path="/ns" element={<Protected> <Ns /></Protected>} />
                    <Route path="/nss" element={<Protected> <Nss /></Protected>} />
                    <Route path="/select" element={<Protected> <Select /></Protected>} />



                    <Route path="/logout" element={<Logout />} />
                    <Route path="/old" element={<Homeo />} />
                    <Route path="/old/sub" element={<Subj />} />
                    <Route path="/old/login" element={<Login />} />

                    {/* <Route path="/old/open" element={<Open />} />
                            <Route path="/old/signup" element={<Sign />} />
                            <Route path="/old/verification" element={<Verify />} />
                            <Route path="/old/fgpassword" element={<Forgetpassword />} />
                            <Route path="/old/newpassword/:token" element={<Newpassword />} />
                            <Route path="/old/footer" element={<Footer />} />  */}

                    <Route path="/team" element={<Team />} />
                    {/* <Route path="/faq" element={<Faq />} /> */}
                    <Route path="/career" element={<Career />} />
                    {/* <Route path="/help" element={<Help />} /> */}

                    <Route
                        path="old/choose"
                        element={
                            <ProtectedRoute>
                                <Choose />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/old/select"
                        element={
                            <ProtectedRoute>
                                <Pdfs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/old/ns"
                        element={
                            <ProtectedRoute>
                                <NotesSharingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/old/nss"
                        element={
                            <ProtectedRoute>
                                <Exam />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/searchpdf"
                        element={
                            <ProtectedRoute>
                                <Search />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="old/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </>
    );
}

export default App;