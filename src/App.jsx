import { useEffect } from "react";
import { useLocation } from "react-router-dom";
// import { deleteNonVerifiedUsers } from "./utils/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import NotFound from './NotFound';
import Sign from './newcom/Sign';
import Verify from './newcom/veri';
import Login from './newcom/Login';
import Home from './newcom/home';
import Subj from './newcom/Subj';
import Sub from './newcom/Sub';
import Open from './newcom/open';
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

function App() {
  // const location = useLocation();

  // useEffect(() => {
  //   // Call API immediately when page loads
  //   deleteNonVerifiedUsers();

  //   // Set interval to call API every 1 minute
  //   const interval = setInterval(() => {
  //     deleteNonVerifiedUsers();
  //   }, 86400000); // 86,400,000ms = 24 hours

  //   // Cleanup interval when component unmounts or route changes
  //   return () => clearInterval(interval);
  // }, [location.pathname]); // Runs on every page change

  return (
    <div className="App 
    
     dotted-background 
    ">
      <Routes>
        
          <Route path='*' element={<Maintainces />} />
          <Route path='/test' element={<Home />}/>
          <Route path='/sub' element={<Subj />}/>
          <Route path='/sem' element={<Subject />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/open' element={<Open />}/>
          <Route path='/signup' element={<Sign />}/>
          <Route path='/verification' element={<Verify />}/>
          <Route path='/logout' element={<Logout />}/>
          <Route path='/fgpassword' element={<Forgetpassword />}/>
          <Route path='/newpassword/:token' element={<Newpassword />} />
          <Route path='/footer' element={<Footer />}/>
          <Route path='/team' element={<Team />}/>
          <Route path='/faq' element={<Faq />}/>
          <Route path='/career' element={<Career />}/>
          <Route path='/ns' element={<NotesSharingPage />}/>
          <Route path='/help' element={<Help />}/>
          <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App;