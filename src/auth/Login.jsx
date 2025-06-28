import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import Cookies from "js-cookie";
import { useNavigate, useLocation, Link } from "react-router-dom";
import '../new.css'





const login = () => {

    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const [last, setLast] = useState(Cookies.get("last") || null);
    const [sucsses, setSucsses] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    // ✅ Handle redirection if user is already logged in
    useEffect(() => {
        const token = Cookies.get("access_token");
        if (token) {
            setTimeout(() => {
                navigate(location?.state?.from || " ", { replace: true });
            }, 100);
        }
    }, [navigate, location]);

    // ✅ Toggle password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };




    const googlelogin = async (credentialResponse) => {
        try {
            const res = await axios.post('https://pixel-classes.onrender.com/api/user/google-login/', {
                token: credentialResponse.credential,
            });
            if (res.data.message === "Login successful!") {
                Cookies.set("access_token", res.data.access_token);
                Cookies.set("username", res.data.username);

                setSucsses("Login Sucssesful");
                Cookies.set("last","Google");
                setTimeout(() => {

                    const redirectTo = " ";
                    navigate(redirectTo, { replace: true });
                }, 100)
            } else {
                setError("Invalid login credentials.");
            }
        } catch (e) {
            setError("Invalid login credentials.");
            setError(e.response?.data?.error || "An error occurred");
        }

    }

    console.error(last)

   const logmein = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const ress = await axios.post('https://pixel-classes.onrender.com/api/user/login/', {
            username: e.target.email.value.toLowerCase(), // use email input
            password: e.target.password.value,
        });
        console.log(ress.data);
        if (ress.data.message === "Login successful!") { // use ress
            Cookies.set("access_token", ress.data.access_token);
            Cookies.set("username", ress.data.username);

            setSucsses("Login Sucssesful");
            Cookies.set("last","email");
            setTimeout(() => {
                const redirectTo = " ";
                navigate(redirectTo, { replace: true });
            }, 100);
        } else {
            setError("Invalid login credentials.");
        }
    } catch (e) {
        console.error("Login error:", e);
        setError(e.response?.data?.error || "An error occurred"); // fix typo
    } finally {
        setLoading(false);
    }
    console.error(last)

}
    return (
        <>
            <div className="bg-pattern "></div>

            <div className='ccf flex flex-col bg-[#000]/20' style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}>

                <div className='flex items-center flex-col  min-h-screen justify-center p-6'>
                    <div>
                        <div className="flex items-center justify-center mt-2 max-w-[360px]">
                            <Link to={'/'}>
                                <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-full " />
                            </Link>
                        </div>
                    </div>
                    <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '>


                        {error && <p className="text-red-600 font-bold m-2 text-md">{error}</p>}
                        {sucsses && <p className="text-green-600 text-center font-bold m-2 text-md">{sucsses}</p>}

       {loading ? <div className="flex justify-center">
<div className=" border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                                </div> :
                                
                                
                                <>

                        <GoogleLogin
                            onSuccess={googlelogin}
                            onError={() => console.log('Login Failed')}
                            />
                        


                        <div className='flex my-4 items-center gap-2 text-center text-gray-500 '>
                            <span className='border-b-2 border-gray-200 flex-1'></span>
                            <div className='text-xs'>Or use email</div>
                            <span className='border-b-2 border-gray-200 flex-1'></span>
                        </div>



                        <div>
                         
                            <form onSubmit={logmein} className={`flex flex-col ${last === "email" ? 'border border-green-500 p-2' : '' } gap-3 ${loading ? 'hidden' : ''}`}>
                                {last === "email" ? "Last Used" : ""}
                                <div className='flex flex-col gap-1'>
                                    <div>

                                        <label htmlFor="email" className='text-sm font-semibold text-gray-1k'>Email</label>
                                    </div>
                                    <div>

                                        <input type="text"
                                            onChange={(e) => e.target.value = e.target.value.toLowerCase()}
                                            className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   " id="email" placeholder="you@youremail.com" />
                                    </div>

                                </div>
                                <div className='flex flex-col gap-1'>
                                    <div>

                                        <label htmlFor="password" className='text-sm font-semibold text-gray-1k'>Password</label>
                                    </div>
                                    <div className="relative"><input type={passwordVisible ? "text" : "password"} className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   " id="password" placeholder="At least 8 characters." autoComplete="off" aria-autocomplete="list" data-rr-is-password="true" />
                                        <button onClick={togglePasswordVisibility} type="button" aria-label="view-password" className="absolute right-0 p-2 text-gray-500 cursor-pointer hover:text-gray-1k">
                                            {passwordVisible ?
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12.85c3.6-7.8 14.4-7.8 18 0m-9 4.2a2.4 2.4 0 110-4.801 2.4 2.4 0 010 4.801z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg>
                                                :
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7c3.6 7.8 14.4 7.8 18 0m-3.22 3.982L21 15.4m-9-2.55v4.35m-5.78-6.218L3 15.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg>
                                            }
                                        </button></div>

                                </div>

                                <button type="submit" className="w-full mt-6 justify-center  flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10">Login <span className="-mr-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg></span></button>
                    
                            </form>
                        </div>
                                </>
                }
                    </div>

<p className="mt-4 text-gray-400 dark:text-gray-900 font-normal text-sm text-center">I don't have an profile? <a className="text-gray-300 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href=" /auth/signup">Sign Up</a></p>
                </div>




            </div>
        </>
    )
}

export default login
