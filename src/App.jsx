import { useState } from 'react'
import './App.css'
import Home from './newcom/home'
import Sub from './newcom/Sub'
import Login from './newcom/Login'
import Open from './newcom/open'
import { Routes, Route, Link } from 'react-router-dom'
import Sign from './newcom/Sign'
import './index.css'

function App() {

  return (
    <div className="App">

      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/sub' element={<Sub />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/open' element={<Open />}/>
        <Route path='/signup' element={<Sign />}/>
      </Routes>
    </div>
  )
}

export default App