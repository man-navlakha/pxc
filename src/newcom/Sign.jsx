import React from 'react'
import { useNavigate,Link } from 'react-router-dom';


const Sign = () => {
  const navigate = useNavigate(); // hook for redirecting

  const handleClick = () => {
    navigate('/Login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className=" p-6 w-full max-w-sm">
      <div className=" mb-6">
        <h1 className="text-2xl font-ff font-bold">Welcome to the,</h1>
        <div className="flex items-center justify-center mt-2">
        <Link to={'/'}>
          <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
          </Link>
         
        </div>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            placeholder="Enter username"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            placeholder="Enter email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Conformation Password</label>
          <input
            type="password"
            placeholder="Enter Conformation Password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <button 
           onClick={handleClick}
           type="button" className="text-blue-600 hover:underline">
            I have an account 
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Sign up
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </form>
      <div className="mt-6">
        <button
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <img src="https://ik.imagekit.io/pxc/g-logo.png" alt="Google logo" className="mr-2 h-6 w-6" />
          Sign Up with Google
        </button>
      </div>
    </div>
  </div>
  
  )
}

export default Sign
