import React,
{
    useState,
    useEffect,
    useRef
}
from "react";
import Cookies from "js-cookie";
import axios from "axios";
import '../new.css';
import {
    useNavigate
}
from "react-router-dom";
import {
    motion,
    AnimatePresence
}
from "framer-motion";

const Semester = () => {
    const [selectedSem, setSelectedSem] = useState(Cookies.get("latest_sem") || null);
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const Semesters = ["3", "4", "5", "6"];

    useEffect(() => {
        const fetchSubjects = async () => {
            if (selectedSem) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.post('https://pixel-classes.onrender.com/api/home/QuePdf/Get_Subjact', {
                        sem: selectedSem,
                        course_name: "B.C.A",
                    });
                    setApiResponse(response.data);
                } catch (err) {
                    setError(`Failed to load subjects. Please try again.`);
                    setApiResponse(null);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSubjects();
    }, [selectedSem]);


    const handleSemClick = (sem) => {
        setSelectedSem(sem);
        Cookies.set("latest_sem", sem, {
            expires: 7
        });
    };

    const handleChoose = (sub) => {
        Cookies.set("sub", sub);
        nav(`/${selectedSem}/${sub}`);
    };

    const containerVariants = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: {
            y: 20,
            opacity: 0
        },
        visible: {
            y: 0,
            opacity: 1
        },
    };

    const SubjectCardSkeleton = () => (
        <div className="relative p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
            <div className="animate-pulse flex flex-col gap-4">
                <div className="h-8 w-8 rounded-lg bg-zinc-700"></div>
                <div className="h-5 w-3/4 rounded-md bg-zinc-700"></div>
                <div className="h-3 w-1/2 rounded-md bg-zinc-700"></div>
            </div>
        </div>
    );

    return (
        <div className='ccfv mt-6 px-4 min-h-screen'>
            <div className='py-16  text-center'>
                <h1 className='text-3xl md:text-5xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent ccf'>
                    Ready to Conquer Your BCA Semester?
                </h1>
                <p className='text-lg md:text-xl my-4 text-gray-300 font-medium'>
                    Select your semester to unlock curated study materials. 🚀
                </p>
            </div>

            <div className="w-full max-w-5xl mx-auto p-4 md:p-8 rounded-t-3xl bg-zinc-900/50 border-t border-x border-zinc-700/30">
                
                {/* --- RESPONSIVE FIX: Changed flex-row to flex-col and added md:flex-row --- */}
                <div className="flex flex-col md:flex-row justify-center p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/30 mb-8 gap-2 md:gap-0">
                    {Semesters.map((sem) => (
                        <button
                            key={sem}
                            onClick={() => handleSemClick(sem)}
                            className={`relative w-full px-4 py-3 text-lg font-semibold rounded-lg transition-colors duration-300 ${
                                selectedSem === sem ? "text-white" : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            {selectedSem === sem && (
                                <motion.div
                                    layoutId="activeSem"
                                    className="absolute inset-0 bg-green-600/30 border border-green-500/60 rounded-lg"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">Semester {sem}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedSem || "initial"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loading && (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {Array.from({ length: 6 }).map((_, i) => <SubjectCardSkeleton key={i} />)}
                            </motion.div>
                        )}

                        {!loading && error && (
                            <div className="text-center py-12 text-red-400">{error}</div>
                        )}

                        {!loading && !error && apiResponse && (
                            apiResponse.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {apiResponse.map((subject) => (
                                        <motion.div
                                            key={subject.id}
                                            variants={itemVariants}
                                            onClick={() => handleChoose(subject.name)}
                                            className="group relative p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/30 cursor-pointer transition-all duration-300 hover:border-green-500 hover:-translate-y-1 hover:bg-zinc-800"
                                        >
                                            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-tr from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative z-10 items-center justify-start flex flex-col">
                                                <span className="material-symbols-outlined text-green-400 text-4xl">menu_book</span>
                                                <h3 className="mt-4 text-2xl font-bold text-white">{subject.name}</h3>
                                                <p className="mt-1 text-zinc-400">View Materials →</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-5xl text-zinc-600">search_off</span>
                                    <h3 className="mt-4 text-2xl font-bold text-zinc-400">No Subjects Found</h3>
                                    <p className="mt-1 text-zinc-500">Materials for this semester may not be available yet.</p>
                                </div>
                            )
                        )}

                        {!selectedSem && !loading && (
                            <div className="text-center py-20">
                                <h2 className="text-3xl font-bold text-zinc-300">Please select a semester to begin</h2>
                                <p className="mt-2 text-zinc-500">Your subjects will appear here.</p>
                            </div>
                        )}
                   {/* <div className="absolute hidden lg:block md:hidden bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent pointer-events-none"></div> */}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Semester;