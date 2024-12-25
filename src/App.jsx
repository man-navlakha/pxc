import { useState } from 'react'
import './App.css'
import Home from './newcom/home'
import Sub from './newcom/Sub'
import Login from './newcom/login'
import Open from './newcom/open'
import { Routes, Route, Link } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 bg-[#e8e8e8ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
     
    <div className="text-white text-5xl font-bold">
     <Link to={'/'}>
        <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018" alt="Company logo with a stylized letter 'A' in blue and white" className="h-10"/>
        </Link>
    </div>
    <div className="flex items-center">
        <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile photo of a person with short hair and glasses" className="h-10 w-10 rounded-full border-2"/>
    </div>
</nav>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/sub' element={<Sub />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/open' element={<Open />}/>
        {/* <Route path='/about' element={<About />}/>
        <Route path='/user/:userId' element={<UserDetail />}/>
        <Route path='/profile' element={<UserProfile />}/> */}
      </Routes>
    </div>
  )
}

export default App