import { useState } from 'react';
import './App.css';
import Home from './newcom/home';
import Sub from './newcom/Sub';
import Login from './newcom/Login';
import Open from './newcom/open';
import { Routes, Route } from 'react-router-dom';
import Sign from './newcom/Sign';
import Verify from './newcom/veri';
import NotFound from './NotFound';
import './index.css';
import Logout from './newcom/Logout';
import Forgetpassword from './newcom/Forgetpassword';
import Newpassword from './newcom/newpassword';

function App() {

  return (
    <div className="App">

      <Routes>
          <Route component={NotFound} />
          <Route path='/' element={<Home />}/>
          <Route path='/sub' element={<Sub />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/open' element={<Open />}/>
          <Route path='/signup' element={<Sign />}/>
          <Route path='/verification' element={<Verify />}/>
          <Route path='/logout' element={<Logout />}/>
          <Route path='/fgpassword' element={<Forgetpassword />}/>
          <Route path='/newpassword' element={<Newpassword />}/>
      </Routes>
    </div>
  )
}

export default App