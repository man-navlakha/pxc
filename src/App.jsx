import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import './App.css';
import NotFound from './NotFound';
import Sign from './newcom/Sign';
import Verify from './newcom/veri';
import Login from './newcom/Login';
import Home from './newcom/home';
import Subj from './newcom/Subj';
import Sub from './newcom/Sub';
import Open from './newcom/open';
import NotesSharingPage from './newcom/NotesSharingPage';
import Pdfs from "./pages/pdfs";
import './index.css';
import Logout from './newcom/Logout';
import Forgetpassword from './pages/Forgetpassword';
import Newpassword from './newcom/newpassword';
import Footer from './componets/Footer';
import Team from './pages/Team';
import Faq from './pages/Faq';
import Career from './pages/Career';
import Help from './pages/Help';
import Profile from "./pages/profile";
import Maintainces from "./pages/MaintenancePage";
import Choose from "./pages/Choose";
import Search from "./pages/Search";
import Exam from "./pages/exam";
import Load from './componets/Timer'

import ProtectedRoute from "./ProtectedRoute";
import Bettary from "./utils/Bettary";

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
        console.log("Retrieved userName from cookie:", storedUserName); // Log the cookie value

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
                <p className="w-screen text-center p-2 bg-red-500 text-white">You are offline!</p>
            )}
         <Bettary/>
            {loading ? (
                <div>
                    <Load />
                </div>
            ) : (
                <>
                    <div className="App dark:bg-[#1e1e1e] dark:text-white bg-white">
                        <Routes>
                            <Route path="*" element={<NotFound />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/sub" element={<Subj />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/open" element={<Open />} />
                            <Route path="/signup" element={<Sign />} />
                            <Route path="/verification" element={<Verify />} />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/fgpassword" element={<Forgetpassword />} />
                            <Route path="/newpassword/:token" element={<Newpassword />} />
                            <Route path="/footer" element={<Footer />} />
                            <Route path="/team" element={<Team />} />
                            <Route path="/faq" element={<Faq />} />
                            <Route path="/career" element={<Career />} />
                            <Route path="/help" element={<Help />} />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/choose"
                                element={
                                    <ProtectedRoute>
                                        <Choose />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/select"
                                element={
                                    <ProtectedRoute>
                                        <Pdfs />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/ns"
                                element={
                                    <ProtectedRoute>
                                        <NotesSharingPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/nss"
                                element={
                                    <ProtectedRoute>
                                        <Exam />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/search"
                                element={
                                    <ProtectedRoute>
                                        <Search />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </div>
                </>
            )}

        </>
    );
}

export default App;