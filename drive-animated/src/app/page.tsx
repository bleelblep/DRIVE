'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const collections = [
  {
    id: 'music',
    name: 'MUSIC',
    description: 'DEMOS, COLLABORATIONS, UNRELEASED TRACKS',
    color: 'archive-violet',
  },
  {
    id: 'videos',
    name: 'VIDEOS',
    description: 'MUSIC VIDEOS, PERFORMANCES, DJ SETS',
    color: 'archive-cyan',
  },
  {
    id: 'photos',
    name: 'PHOTOS',
    description: 'PRESS PHOTOS, PERFORMANCE SHOTS, ARCHIVAL PHOTOGRAPHY',
    color: 'archive-pink',
  },
  {
    id: 'interviews',
    name: 'INTERVIEWS',
    description: 'AUDIO INTERVIEWS, PODCASTS, WRITTEN FEATURES',
    color: 'archive-emerald',
  },
  {
    id: 'misc',
    name: 'MISCELLANEOUS',
    description: 'ARTWORK, DOCUMENTS, EPHEMERA',
    color: 'archive-amber',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Full viewport */}
      <motion.section
        className="section-fullscreen relative flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-archive-black via-archive-charcoal to-archive-black -z-10" />

        {/* Centered content */}
        <motion.div
          className="text-center px-4 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-sm md:text-base leading-loose tracking-archive-wide mb-12">
            MUSIC PRODUCER<br />
            A COMPREHENSIVE ARCHIVE PRESERVING<br />
            THE ARTISTRY AND CREATIVE VISION OF SOPHIE
          </h1>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-xs opacity-50">SCROLL</span>
        </motion.div>
      </motion.section>

      {/* Collections Grid */}
      <section className="min-h-screen px-4 py-16 md:px-8 lg:px-16">
        <motion.h2
          className="text-2xl md:text-3xl text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          EXPLORE THE COLLECTIONS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <Link href={`/${collection.id}`}>
                <motion.div
                  className="card-minimal p-8 md:p-12 cursor-pointer h-full flex flex-col justify-center items-center text-center min-h-[300px]"
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <h3 className="text-xl md:text-2xl mb-4 tracking-archive-wider">
                    {collection.name}
                  </h3>
                  <p className="text-xs opacity-50 mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                  <motion.span
                    className="text-xs opacity-30"
                    whileHover={{ opacity: 1 }}
                  >
                    → EXPLORE
                  </motion.span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 text-center border-t border-white/10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs opacity-30"
        >
          <p className="mb-2">UNOFFICIAL FAN-MAINTAINED ARCHIVE</p>
          <p>MADE WITH 💜 BY THE COMMUNITY</p>
        </motion.div>
      </footer>
    </main>
  );
}
