'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabGroupProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function TabGroup({ tabs, defaultTab }: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Horizontal scrollable tabs container with fade indicators */}
      <div className="relative mb-6">
        {/* Left fade indicator (visible on all screens) - using Tailwind bracket notation */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0F172A] to-transparent pointer-events-none z-10" />

        {/* Right fade indicator (visible on all screens) - using Tailwind bracket notation */}
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-[#0F172A] via-[#0F172A]/80 to-transparent pointer-events-none z-10 shadow-[inset_-2px_0_4px_rgba(99,102,241,0.1)]" />

        {/* Scrollable tabs with padding to show partial next tab */}
        <div className="overflow-x-auto scrollbar-hide border-b border-slate-700 pr-16 md:pr-20">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTabContent}
      </motion.div>
    </div>
  );
}
