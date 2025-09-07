import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

import { DownloadCloud, History, Redo } from 'lucide-react'; // Import icons

const DownloadHistory = () => {


  const [downloads, setDownloads] = useState([]);

    // Animation variants for the list and items
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
    };

  useEffect(() => {
    const data = localStorage.getItem('downloadHistory');
    if (data) {
      try {
        setDownloads(JSON.parse(data));
      } catch (error) {
        console.error('Invalid JSON in localStorage:', error);
      }
    }
  }, []);


    return (
        <aside className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-white/90 mb-4 px-3 flex items-center gap-2">
                          <History size={24} /> Download History
                        </h2>

                        <div className="glass-info p-4 m-3 rounded-2xl border border-white/10 bg-white/10">
                          {downloads.length > 0 ? (
                            <motion.ul
                              className="space-y-3"
                              variants={listVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <AnimatePresence>
                                {downloads.map((item, index) => (
                                  <motion.li
                                    key={index}
                                    layout
                                    variants={itemVariants}
                                    exit="exit"
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/20"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="flex-shrink-0">
                                        <DownloadCloud size={20} className="text-blue-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white/90 truncate">{item.pdfName} ({item.sub})</p>
                                        <p className="text-xs text-white/50">
                                          {formatDistanceToNow(new Date(item.downloadDate), { addSuffix: true })}
                                        </p>
                                      </div>
                                    </div>
                                    <a
                                      href={item.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 rounded-full bg-white/5 text-white/70 hover:bg-blue-500/50 hover:text-white transition-colors"
                                      title="Redownload"
                                    >
                                      <Redo size={18} />
                                    </a>
                                  </motion.li>
                                ))}
                              </AnimatePresence>
                            </motion.ul>
                          ) : (
                            <div className="text-center text-white/60 text-sm py-8">
                              <span className="material-symbols-outlined text-4xl text-white/20">downloading</span>
                              <p className="mt-2 font-semibold">No Recent Downloads</p>
                              <p className="text-xs text-white/40">Your downloaded files will appear here.</p>
                            </div>
                          )}
                        </div>
                      </aside>
    );
};

export default DownloadHistory;
