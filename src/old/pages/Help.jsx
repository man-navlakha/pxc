import React from 'react'
import Navbar from '../old/componets/Navbar';
import LastF from '../old/componets/LastF';
import Footer from '../old/componets/Footer';

const Help = () => {
  return (
    <div>
      <Navbar />
  <main className="max-w-4xl mx-auto p-6">
   <h1 className="text-3xl font-bold text-center mb-6">
    How can we help?
   </h1>
   <div className="relative mb-12">
    <input className="w-full p-4 pl-10 rounded-lg shadow-md border border-gray-200" placeholder="Search a topic" type="text"/>
    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
    </i>
   </div>
   <section className="mb-12">
    <h2 className="text-xl font-semibold mb-4 rounded">
     General
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Uploading Notes icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/ubffe8iMgqTlkJyM5tTNlvcMTE3JxmLrp3Cxs63po4zPgYPoA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Uploading Notes
      </h3>
      <p>
       How to upload your notes to the platform.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Downloading Notes icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/7hTr23QfOt2rRSxUr76MvK36fT9Ae5YQJRfakjfZcU0TBi9gC.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Downloading Notes
      </h3>
      <p>
       How to download notes from the platform.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Creating an Account icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/GE1Q2GOcQO62MVXzZncMTbiSKHEdoScbWUuDJehwCVQGI2DKA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Creating an Account
      </h3>
      <p>
       Steps to create a new account.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Managing Your Account icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/oem8lawJHTyf2UIDOlYE2i8UaavvZIRcDviU6kBOvsELQsHUA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Managing Your Account
      </h3>
      <p>
       How to manage your account settings.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Privacy &amp; Security icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/xD6nHVBgoqbCG9GXkabjvFdlfbKCYSvOh7X1KBiijISeKsHUA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Privacy &amp; Security
      </h3>
      <p>
       Information on how we protect your privacy.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="FAQs icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/VYd0QzugfV3bCy2ieg47qy4rde3gj9GIYKJkHvpyIOQsVYPoA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       FAQs
      </h3>
      <p>
       Answers to frequently asked questions.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Contact Support icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/rkIGXQXdC4I0Op5wA7afuwJNyWrQXgu0eLi1LFDf4JwJgYPoA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Contact Support
      </h3>
      <p>
       How to get in touch with our support team.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Using the Search Function icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/blZAj4cQx06kCVr3fwINhfkWWTFwOVN4TPGY98qf6B8QgYPoA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Using the Search Function
      </h3>
      <p>
       Tips on how to effectively search for notes.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Rating and Reviewing Notes icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/B02Sno6khooBL5ZZVor7CJ4i7JjE0nd7fQuCUcf0ENCJQsHUA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Rating and Reviewing Notes
      </h3>
      <p>
       How to rate and review notes shared by others.
      </p>
     </div>
     <div className="bg-white p-6 rounded-lg shadow-md text-center border-2 border-gray-100">
      <img alt="Sharing Notes with Others icon" className="mx-auto mb-4 rounded" height="50" src="https://storage.googleapis.com/a1aa/image/5ZZR7r51kooPNJErBkrTfa14TPZJ1saUmfrNDhOqCGfKgYPoA.jpg" width="50"/>
      <h3 className="font-semibold mb-2">
       Sharing Notes with Others
      </h3>
      <p>
       How to share notes with your peers.
      </p>
     </div>
    </div>
   </section>
  </main>
  <div className="fixed bottom-4 right-4">
   <img alt="Chat icon" className="w-12 h-12 rounded-full shadow-lg" height="50" src="https://storage.googleapis.com/a1aa/image/mPxCct7NzzoUG1BrFnzeAcqNFIZ1rfvnfyytam4e6f1lWh9gC.jpg" width="50"/>
  </div>

  <div className="lg:hidden md:block block">
      <LastF />
        
      </div>
      <div className="mt-36">
        
      <Footer />
      </div>
    </div>
  )
}

export default Help
