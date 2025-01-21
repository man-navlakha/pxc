import React from 'react'

const Help = () => {
  return (
    <div>
      
      <div className="p-2">

        
        <h1>Help</h1>
        <span>Contact Us</span>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            <div className="bg-green-900 col-span-1 p-6 rounded-lg text-center">
                <i className="fas fa-box-open text-4xl mb-4"></i>
                <h2 className="text-2xl font-bold mb-2">STUDENT INQUIRIES</h2>
                <p className="mb-4">We're here to help!</p>
                <button className="bg-lime-500 text-black py-2 px-4 rounded">Submit an Inquiry</button>
            </div>
            <div className="bg-green-900 col-span-1 p-6 rounded-lg text-center">
                <i className="fas fa-hamburger text-4xl mb-4"></i>
                <h2 className="text-2xl font-bold mb-2">FOR ADVERTISEMENT </h2>
                <p className="mb-4">It most was effective</p>
                <button className="bg-lime-500 text-black py-2 px-4 rounded">Submit an Inquiry</button>
            </div>
            <div className="bg-green-900 col-span-1 p-6 rounded-lg text-center">
                <i className="fas fa-globe text-4xl mb-4"></i>
                <h2 className="text-2xl font-bold mb-2">DOCUMENT REPORT</h2>
                <p className="mb-4">If any documet is not opening either not opening then we will help you</p>
                <button className="bg-lime-500 text-black py-2 px-4 rounded">Submit an Inquiry</button>
            </div>

            <div className="bg-green-900 col-span-1 p-6 rounded-lg">
                <i className="fas fa-map-marker-alt text-4xl mb-4"></i>
                <h2 className="text-2xl font-bold mb-4">LOCATIONS</h2>
                <p className="font-bold">PLANT</p>
                <p className="mb-4">2400 Maguire Blvd.<br />Columbia, MO 65201</p>
                <p className="font-bold">HEADQUARTERS</p>
                <p>888 N. Douglas Street, Suite 100<br />El Segundo, CA 90245</p>
            </div>

            <div className="bg-green-900 col-span-2 p-6 rounded-lg">
                <i className="fas fa-bullhorn text-4xl mb-4"></i>
                <h2 className="text-2xl font-bold mb-4">NORTH AMERICA MEDIA INQUIRIES</h2>
                <p className="text-lime-500 mb-4">PRESS@BEYONDMEAT.COM</p>
                <h2 className="text-2xl font-bold mb-4">EMEA MEDIA INQUIRIES</h2>
                <p className="text-lime-500 mb-4">PRESSEMEA@BEYONDMEAT.COM</p>
                <h2 className="text-2xl font-bold mb-4">CHINA MEDIA INQUIRIES</h2>
                <p className="text-lime-500 mb-4">PRESSCHINA@BEYONDMEAT.COM</p>
                <button className="bg-lime-500 text-black py-2 px-4 rounded">View Newsroom</button>
            </div>
            
        </div>
      </div>



    </div>
  )
}

export default Help
