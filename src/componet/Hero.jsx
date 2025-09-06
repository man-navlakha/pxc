import React from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion
import { ArrowRight, Sparkles } from 'lucide-react'; // Import icons

const Hero = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/auth/login");
    };

    // Animation variants for a staggered effect
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <div className='mesh_hero w-full min-h-screen flex items-center justify-center p-4 -mt-20'>
            <motion.div
                className='text-center flex flex-col items-center gap-6'
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Feature Ribbon */}
                <motion.div
                    variants={itemVariants}
                    className='bg-gray-800/50 border border-white/10 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg'
                >
                    <span className='bg-gradient-to-b from-teal-800 via-blue-800 to-purple-800 text-white font-bold px-2 py-0.5 text-xs rounded-full'>
                        NEW
                    </span>
                    <span className='text-sm text-gray-300'>Pixel Class 2.0 is here</span>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    variants={itemVariants}
                    className='text-4xl sm:text-5xl lg:text-7xl font-extrabold bg-clip-text bg-gradient-to-br from-white to-zinc-400 text-transparent ccf max-w-4xl'
                >
                    Access Top-Quality PDF Notes Instantly
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    variants={itemVariants}
                    className='text-lg lg:text-xl text-white/70 max-w-2xl'
                >
                    Unlock a world of curated study materials. Upload your notes, download what you need, and collaborate with peers—all in one place. 🚀
                </motion.p>

                {/* Call-to-Action Buttons */}
                <motion.div
                    variants={itemVariants}
                    className='flex flex-col sm:flex-row items-center gap-4 mt-4'
                >
                    <button
                        onClick={handleGetStarted}
                        className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-blue-600/60 rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    >
                        Let's Get Started
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <button
                        onClick={() => navigate("/faq")} // Or any other secondary action
                        className="px-8 py-3 text-lg font-semibold text-white/80 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors duration-300"
                    >
                        Learn More
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Hero;