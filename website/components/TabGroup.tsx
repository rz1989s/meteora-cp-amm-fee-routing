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
      {/* Horizontal scrollable tabs container with shadow indicators */}
      <div className="relative mb-6">
        {/* Left shadow indicator (visible on all screens) */}
        <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10" style={{
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0) 100%)'
        }} />

        {/* Right shadow indicator (visible on all screens) with subtle glow */}
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 pointer-events-none z-10" style={{
          background: 'linear-gradient(270deg, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 40%, rgba(15, 23, 42, 0) 100%)',
          boxShadow: 'inset -2px 0 4px rgba(99, 102, 241, 0.1)'
        }} />

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
