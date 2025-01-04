import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';

const newpassword = () => {
     const [loading, setLoading] = useState(false);
          const navigate = useNavigate();

          
  const handleLogin = () => {
    navigate('/Login');
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-100">
       <div className="p-6 w-full max-w-sm">
         <div className="mb-6">
           <h1 className="text-2xl font-ff font-bold">Set your new password of,</h1>
           <div className="flex items-center justify-center mt-2">
             <Link to={'/'}>
               <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
             </Link>
           </div>
         </div>
         <form className="space-y-4" >
         
           <div>
             <label className="font-ff block text-sm font-medium text-gray-700">Enter password</label>
             <input type="password" name="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Enter your new password" required />
           </div>
           <div>
             <label className="font-ff block text-sm font-medium text-gray-700">Reenter password</label>
             <input type="cpassword" name="cpassword" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Re - Enter your new password" required />
           </div>
   
           <div className="flex items-center justify-between">
             <button type="button" className="text-blue-600 hover:underline" onClick={handleLogin}>
             Log in
             </button>
             <button
               type="submit"
               className="w-lg flex items-center px-4 py-2 bg-green-700 text-white font-ff rounded-md hover:bg-green-800"
               disabled={loading} // Disable button while loading
             >
               {loading ? (
                 <div className="loader"></div> // Loading spinner
               ) : (
                 <>
                   Send password
                   <i className="fas fa-arrow-right ml-2"></i>
                 </>
               )}
             </button>
           </div>
         </form>
   
       </div>
     </div>
  )
}

export default newpassword
