'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InterviewsPage() {
  return (
    <main className="min-h-screen">
      <div className="p-8 md:p-12">
        <Link href="/">
          <motion.div
            className="inline-flex items-center gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity mb-8"
            whileHover={{ x: -5 }}
          >
            <span>←</span>
            <span>BACK TO COLLECTIONS</span>
          </motion.div>
        </Link>

        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-archive-emerald to-archive-cyan bg-clip-text text-transparent">
            INTERVIEWS
          </h1>
          <p className="text-xs opacity-50">
            AUDIO INTERVIEWS, PODCASTS, WRITTEN FEATURES
          </p>
        </motion.div>
      </div>

      <div className="p-8 md:p-12">
        <motion.div
          className="card-minimal p-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm opacity-30">
            MEDIA GRID WILL BE IMPLEMENTED WITH MANIFEST DATA
          </p>
        </motion.div>
      </div>
    </main>
  );
}
