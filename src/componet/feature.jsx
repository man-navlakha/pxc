import React from 'react';
import { motion } from 'framer-motion';
import { Book, Edit, MessageSquare, FileQuestion, GraduationCap, Users, Lock, ChevronRight } from 'lucide-react';
import '../new.css'; // Your base styles

// --- Animation Variants ---
// Defined here so the component can access them
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};


const Feature = () => {
    // Centralized data for all features
    const mainFeatures = [
        { icon: <Book size={28} className="text-blue-400" />, title: "Comprehensive Notes", description: "Access detailed, topic-by-topic notes to clarify complex subjects." },
        { icon: <Edit size={28} className="text-purple-400" />, title: "Assignment Solutions", description: "Find complete and well-explained assignment solutions to guide you." },
        { icon: <FileQuestion size={28} className="text-orange-400" />, title: "Important Questions", description: "Focus your study efforts with a curated list of high-yield questions." },
        { icon: <GraduationCap size={28} className="text-green-400" />, title: "Past Exam Papers", description: "Practice with previous years' exam papers to master the format and timing." },
        { icon: <Users size={28} className="text-teal-400" />, title: "Collaborate on the Go", description: "Discuss projects and brainstorm ideas with peers in real-time." },
        { icon: <Lock size={28} className="text-pink-400" />, title: "Secure & Fun Chat", description: "Enjoy private messaging with a user-friendly and engaging design." },
    ];

    return (
        // Main container for the entire feature showcase
        <div className="">
            {/* --- Main Features Section --- */}
            <section className='ccf mesh py-20 px-4 sm:px-6 lg:px-8'>
                <motion.div
                    className='max-w-6xl mx-auto text-center'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                >
                    <motion.div variants={itemVariants}>
                        <h2 className="text-base font-semibold text-blue-400 tracking-wider uppercase">Features</h2>
                        <p className="mt-2 text-4xl sm:text-5xl font-extrabold text-white">
                            What Makes Us Different
                        </p>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/60">
                            Everything you need to excel, built with a modern and collaborative approach.
                        </p>
                    </motion.div>

                    <motion.div
                        className='mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        variants={listVariants}
                    >
                        {mainFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="text-left p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-lg"
                                variants={itemVariants}
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-800/60 border border-white/10 mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className='text-xl font-bold text-white'>{feature.title}</h3>
                                <p className='mt-2 text-white/70 leading-relaxed'>{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* --- Chat "Call to Action" Section --- */}
            <motion.section
                className="px-6 py-20 bg-grid-pattern flex items-center justify-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
            >
                <div className="bg-gray-900/50 backdrop-blur-xl max-w-4xl w-full p-10 rounded-3xl shadow-2xl text-center border border-white/10">
                    <motion.h1
                        className="text-4xl md:text-5xl font-extrabold text-white mb-6"
                        variants={itemVariants}
                    >
                        Start Chatting Today
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-gray-300 mb-8"
                        variants={itemVariants}
                    >
                        Connect in real-time with classmates and friends. Fast, secure, and built for students.
                    </motion.p>
                    <motion.a
                        href="/chat"
                        className="inline-flex items-center gap-2 bg-white text-black font-semibold py-3 px-8 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                        variants={itemVariants}
                    >
                        Launch Chat <ChevronRight size={20} />
                    </motion.a>
                </div>
            </motion.section>
        </div>
    );
};

export default Feature;