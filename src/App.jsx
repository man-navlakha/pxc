import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { deleteNonVerifiedUsers } from "./utils/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './newcom/home';
import Sub from './newcom/Sub';
import Login from './newcom/Login';
import Open from './newcom/open';
import Sign from './newcom/Sign';
import Verify from './newcom/veri';
import NotFound from './NotFound';
import './index.css';
import Logout from './newcom/Logout';
import Forgetpassword from './pages/Forgetpassword'; 
import Newpassword from './newcom/newpassword';
import Footer from './componets/Footer';
import Team from './pages/Team';
import Faq from './pages/Faq';
import Career from './pages/Career';
import NotesSharingPage from './newcom/NotesSharingPage';
import Help from './pages/Help';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Call API immediately when page loads
    deleteNonVerifiedUsers();

    // Set interval to call API every 1 minute
    const interval = setInterval(() => {
      deleteNonVerifiedUsers();
    }, 86400000); // 86,400,000ms = 24 hours

    // Cleanup interval when component unmounts or route changes
    return () => clearInterval(interval);
  }, [location.pathname]); // Runs on every page change

  return (
    <div className="App 
    
     dotted-background 
    ">
      <Routes>
        
          <Route path='*' element={<NotFound />} />
          <Route path='/' element={<Home />}/>
          <Route path='/sub' element={<Sub />}/>
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
      </Routes>
    </div>
  )
}

export default App;