"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ClientOnly from "./ClientOnly";

export default function MOMBadge() {
  return (
    <ClientOnly>
      <motion.a
        href="https://isha.sadhguru.org/in/en/miracle-of-mind"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50
                   w-20 h-20 rounded-full
                   flex items-center justify-center
                   bg-black/80 backdrop-blur-md
                   border border-black/20 shadow-xl
                   hover:scale-110 transition-all duration-300"
        animate={{ boxShadow: ["0 0 0px #00ffbb", "0 0 15px #00ffbb"] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
      >
        <Image
          src="https://www.datocms-assets.com/46272/1739171125-logo.png"
          alt="Miracle of Mind"
          width={60}
          height={60}
          className="rounded-full "
        />
      </motion.a>
    </ClientOnly>
  );
}
