import React from 'react'
import { motion, AnimatePresence } from "framer-motion";


function LightboxModal({ openData, onClose }) {
    return (
        <AnimatePresence>
            {openData?.url && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="relative z-10 max-w-[90vw] max-h-[90vh]"
                    >
                        <div className="rounded-lg overflow-hidden bg-black">
                            {openData.type === "image" && (
                                <img
                                    src={openData.url}
                                    alt="preview"
                                    className="max-w-[90vw] max-h-[90vh] object-contain"
                                />
                            )}
                            {openData.type === "video" && (
                                <video controls className="max-w-[90vw] max-h-[90vh]">
                                    <source src={openData.url} />
                                </video>
                            )}
                        </div>
                        <button
                            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}


export default LightboxModal
