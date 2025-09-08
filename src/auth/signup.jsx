import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import Cookies from "js-cookie";
import { useNavigate, useLocation, Link } from "react-router-dom";
import '../new.css'

const signup = () => {


    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUserame] = useState(null);
    const [last_s, setlast_s] = useState(Cookies.get("last_s") || null);
    const [sucsses, setSucsses] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Handle redirection if user is already logged in
    useEffect(() => {
        const token = Cookies.get("refresh"); 
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



    const handleSubmit = async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("profile_pic");
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value; // ✅ Define it here
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!username || !email || !password || !confirmPassword) {
            alert("All fields are required.");
            return;

        }
        console.log("Username:", username);
        console.log("Email:", email); // ✅ Log email to check its value

        // ✅ Now it's safe to use `email` here
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = new FormData();
        formData.append("profile_pic", fileInput.files[0]);
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        Cookies.set("username", username, { expires: 7 });

        try {
            const response = await fetch("https://pixel-classes.onrender.com/api/user/register/", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            console.log(formData);
            console.log(response);


            if (response.ok) {
                navigate("/auth/verification", { state: { user: { username, email } } });
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Try again later.");
        }
        finally {
            setLoading(false);
            Cookies.set("username", username, { expires: 7 });
        }
    };


    // const handleSignupClick = async () => {
    //     setLoading(true);
    //     setError(null);

    //     const fileInput = document.getElementById("profile_pic");
    //     const username = document.getElementById("username").value;
    //     const email = document.getElementById("email").value;
    //     const password = document.getElementById("password").value;
    //     const confirmPassword = document.getElementById("confirmPassword").value;

    //     if (!username || !email || !password || !confirmPassword) {
    //         setError("All fields are required.");
    //         setLoading(false);
    //         return;
    //     }

    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (!emailRegex.test(email)) {
    //         setError("Please enter a valid email address.");
    //         setLoading(false);
    //         return;
    //     }

    //     if (password !== confirmPassword) {
    //         setError("Passwords do not match!");
    //         setLoading(false);
    //         return;
    //     }

    //     const formData = new FormData();
    //     if (fileInput.files[0]) {
    //         formData.append("profile_pic", fileInput.files[0]);
    //     }
    //     formData.append("username", username);
    //     formData.append("email", email);
    //     formData.append("password", password);

    //     try {
    //         const response = await fetch("https://pixel-classes.onrender.com/api/user/register/", {
    //             method: "POST",
    //             body: formData,
    //         });
    //         console.log(formData);
    //         console.log(response);

    //         const data = await response.json();

    //         if (response.ok) {
    //             setSucsses("Signup successful!");
    //             Cookies.set("last_s", "username");
    //             navigate("/auth/verification", { state: { user: { username, email } } });
    //         } else {
    //             setError(data.message || "Registration failed.");
    //         }
    //     } catch (err) {
    //         setError("Something went wrong. Try again later.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const googlelogin = async (credentialResponse) => {
        setLoading(true)
        try {
            const res = await axios.post('https://pixel-classes.onrender.com/api/user/google-signup/', {
                token: credentialResponse.credential,
            });
            if (res.data.message === "Signup successful!") {

                Cookies.set("refresh_token", res.data.refresh_token, { expires: 7 });
                Cookies.set("username", res.data.username, { expires: 7 });

                setSucsses("signup Sucssesful");
                Cookies.set("last_s", "Google");
                setTimeout(() => {
                    const redirectTo = "/";
                    navigate(redirectTo, { replace: true });
                }, 100);
            } else {
                setError("Invalid signup credentials.");
            }
        } catch (e) {
            if (e.response?.data?.error) {
                setError(e.response.data.error);
            } else {
                setError("An error occurred");
            }
        } finally {
            setLoading(false)
        }

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
                    {loading ?  <div className='flex items-center flex-col justify-center w-[360px] p-6'>
              <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '> <div className="flex justify-center">
                            <div className=" border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                        </div> 
                        </div> 
                        </div>  :
                        <div className='flex items-center flex-col justify-center p-6'>
                            <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '>

                                {error && <p className="text-red-600 font-bold m-2 text-md">{error}</p>}

                                {sucsses && (
                                    <p className="text-green-600 text-center font-bold m-2 text-md">
                                        {typeof sucsses === "string" ? sucsses : JSON.stringify(sucsses)}
                                    </p>
                                )}

                                <div className={`flex flex-col ${last_s === "Google" ? 'border border-green-500 p-2 rounded' : ''} gap-3 ${loading ? 'hidden' : ''}`}>

                                    <span className={`${last_s === "Google" ? "py-[2px] px-[5px] w-full text-green-600 max-w-max" : "hidden"} bg-green-300/30 text-[10px] border border-green-300 rounded`}>Last time used</span>

                                    <GoogleLogin
                                        onSuccess={googlelogin}
                                        onError={() => console.log('sign up Failed')}
                                    />
                                </div>



                                <div className='flex my-4 items-center gap-2 text-center text-gray-500 '>
                                    <span className='border-b-2 border-gray-200 flex-1'></span>
                                    <div className='text-xs'>Or use username</div>
                                    <span className='border-b-2 border-gray-200 flex-1'></span>
                                </div>

                                <div>

                                    <form onSubmit={handleSubmit} className={`flex flex-col ${last_s === "username" ? 'border border-green-500 p-2 rounded' : ''} gap-3 ${loading ? 'hidden' : ''}`}>
                                        {/* {last_s === "username" ? "Last Used" : ""} */}
                                        <span className={`${last_s === "username" ? "py-[2px] px-[5px] w-full text-green-600 max-w-max" : "hidden"} bg-green-300/30 text-[10px] border border-green-300 rounded`}>Last time used</span>
                                        <div className='flex flex-col gap-1'>
                                            <div>

                                                <label htmlFor="profile_pic" className='text-sm font-semibold text-gray-1k'>Profile Picture</label>
                                            </div>
                                            <div>

                                                <input
                                                    type="file"
                                                    id="profile_pic"
                                                    name="profile_pic"
                                                    accept="image/*"
                                                    className="w-full px-2 py-1.5 outline-none text-sm rounded-lg  max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input" placeholder="Enter your new username " />
                                            </div>

                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <div>

                                                <label htmlFor="username" className='text-sm font-semibold text-gray-1k'>username</label>
                                            </div>
                                            <div>

                                                <input type="text"
                                                    value={username}
                                                    onChange={(e) => setUserame(e.target.value = e.target.value.toLowerCase())}
                                                    className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   "
                                                    id="username" placeholder="Enter your new username " />
                                            </div>

                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <div>
                                                <label htmlFor="email" className='text-sm font-semibold text-gray-1k'>Email</label>
                                            </div>
                                            <div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    placeholder="Enter your email"
                                                    className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input"
                                                />
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
                                        <div className='flex flex-col gap-1'>
                                            <div>

                                                <label htmlFor="confirmPassword" className='text-sm font-semibold text-gray-1k'>Confirm Password</label>
                                            </div>
                                            <div className="relative"><input type={passwordVisible ? "text" : "password"} className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   " id="confirmPassword" placeholder="At least 8 characters." autoComplete="off" aria-autocomplete="list" data-rr-is-password="true" />
                                                <button onClick={togglePasswordVisibility} type="button" aria-label="view-password" className="absolute right-0 p-2 text-gray-500 cursor-pointer hover:text-gray-1k">
                                                    {passwordVisible ?
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12.85c3.6-7.8 14.4-7.8 18 0m-9 4.2a2.4 2.4 0 110-4.801 2.4 2.4 0 010 4.801z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg>
                                                        :
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7c3.6 7.8 14.4 7.8 18 0m-3.22 3.982L21 15.4m-9-2.55v4.35m-5.78-6.218L3 15.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg>
                                                    }
                                                </button></div>

                                        </div>

                                        <button type="submit" className="w-full mt-6 justify-center  flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10">Create Profile <span className="-mr-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg></span></button>

                                    </form>
                                </div>
                                <p className="mt-2 text-gray-500 dark:text-gray-600 font-normal text-xs  text-gray-500 text-center font-normal">By clicking "Create Profile“ you agree to our <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="legal/code-of-conduct">Code of Conduct</a>, <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="legal/terms-and-conditions">Terms of Service</a> and <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="legal/privacy-policy">Privacy Policy</a>.</p>
                            </div>

                            <p className="mt-4 text-gray-400 dark:text-gray-600 font-normal text-sm text-center">Already have a profile? <a className="text-gray-300 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href=" /auth/login">Log in</a></p>
                        </div>

                    }


                </div>
            </div>
        </>
    )
}

export default signup
