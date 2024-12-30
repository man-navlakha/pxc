import React from 'react'

const veri = () => {
   const [otp, setOtp] = React.useState(new Array(4).fill(""));
  
              const handleChange = (element, index) => {
                  if (isNaN(element.value)) return false;
                  setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
  
                  // Focus next input
                  if (element.nextSibling) {
                      element.nextSibling.focus();
                  }
              };
  
              return (
                  <div className="min-h-screen flex flex-col items-center justify-center  bg-white p-8 rounded-lg">
                      <h2 className="text-2xl font-bold mb-6">OTP Verification</h2>
                      <p className="text-gray-600 mb-4">Enter the 4-digit code sent to your phone</p>
                      <div className="flex space-x-2 mb-6">
                          {otp.map((data, index) => {
                              return (
                                  <input
                                      className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      type="text"
                                      name="otp"
                                      maxLength="1"
                                      key={index}
                                      value={data}
                                      onChange={e => handleChange(e.target, index)}
                                      onFocus={e => e.target.select()}
                                  />
                              );
                          })}
                      </div>
                      <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200">Verify</button>
                  </div>
  )
}

export default veri
