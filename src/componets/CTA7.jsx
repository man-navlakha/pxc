import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie'; // Make sure you have js-cookie installed: npm install js-cookie
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom

const CTA7 = () => {
    const [token, setToken] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const accessToken = Cookies.get('access_token');
        setToken(accessToken);

        if (accessToken) {
            // navigate('/'); // Redirect to home if already logged in. Uncomment if needed
        } else {
            // navigate('/login'); // Redirect to login if not logged in. Uncomment if needed
        }
    }, [navigate]);

    return (
        <section className="bg-gradient-to-r from-emerald-600 to-green-600 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                {token ? (
                    <>
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        Continue Your Learning Journey
                        </h2>
                        <p className="mt-4 text-lg text-indigo-100">
                        Pick up where you left off. Access your saved courses and explore new study materials.
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Join our NotesSharing Community
                        </h2>
                        <p className="mt-4 text-lg text-indigo-100">
                            Share and access valuable study notes. Join our community!
                        </p>
                        <div className="mt-8 flex justify-center">
                            <div className="inline-flex rounded-md shadow">
                                <a
                                    href="/Login"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                                >
                                    Sign Up For Free
                                </a>
                            </div>
                            <div className="ml-3 inline-flex">
                                <a
                                    href="/sub?course=B.C.A"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                                >
                                  Browse Resources
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default CTA7;