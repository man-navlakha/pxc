import React, { useState } from 'react';

const feqq = () => {

    const [openSection, setOpenSection] = useState(null);

    const toggleContent = (id) => {
      setOpenSection(openSection === id ? null : id);
    };
  
  return (
    
    <div className="bg-black text-white">
      <div className="text-center py-10">
        <h1 className="text-2xl">FREQUENTLY ASKED</h1>
        <h2 className="text-4xl">QUESTIONS</h2>
      </div>
      {/* <div className="flex justify-center space-x-4 mb-10">
        <button className="border border-white px-4 py-2">SHIPPING + RETURNS</button>
        <button className="border border-white px-4 py-2">PRODUCT</button>
        <button className="border border-white px-4 py-2 bg-white text-black">PAYMENTS</button>
        <button className="border border-white px-4 py-2">MISCELLANEOUS</button>
      </div> */}
      <div className="bg-white 
      text-black p-10">
        <div className="border-b border-pink-500 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('payment-methods')}
          >
            <h3 className="text-lg font-bold">WHAT IS PIXEL CLASSES</h3>
            <i
              id="icon-payment-methods"
              className={`fas ${openSection === 'payment-methods' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
            ></i>
          </div>
          <p id="content-payment-methods" className={`mt-2 ${openSection === 'payment-methods' ? '' : 'hidden'}`}>
          A education notes sharing platform there you can share your notes and get notes of your course.
          </p>
        </div>
        <div className="border-b border-gray-300 pb-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleContent('refund-time')}
          >
            <h3 className="text-lg font-bold">HOW TO SIGNUP</h3>
            <i
              id="icon-refund-time"
              className={`fas ${openSection === 'refund-time' ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}`}
            ></i>
          </div>
          <p id="content-refund-time" className={`mt-2 ${openSection === 'refund-time' ? '' : 'hidden'}`}>
            <ul>
                <li>Go to <a className='text-blue-800' href="/signup">Sign Up</a> page.</li>
            <img src="https://ik.imagekit.io/pxc/Enter%20a%20new%20username.png" alt="Sing-up page" srcset="" />
                <li><br /></li>
                <li>Follow this steps
                    <ul>
                        <li>Enter the required information 
                            <ul>
                                <li>Like : username , email, password</li>
                            </ul>
                        </li>
                        <li>Click on Signup button</li>
                    </ul>
                </li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  )
}

export default feqq
