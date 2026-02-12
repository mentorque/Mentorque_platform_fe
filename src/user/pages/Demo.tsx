'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FileText,
  Briefcase,
  Target,
  ExternalLink,
  Sparkles,
  Code,
  Video,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';
import Protected from '@/shared/components/Protected';
import Navbar from '@/shared/components/Navbar';

type PhaseId = 'phase1' | 'phase2' | 'phase3' | 'phase4';

interface PhaseFeature {
  label: string;
  value: number; // 0-100
  icon: LucideIcon;
  link?: string;
}

interface PhaseData {
  id: PhaseId;
  label: string;
  title: string;
  duration: string;
  description: string;
  image: string;
  colors: {
    gradient: string;
    glow: string;
    ring: string;
  };
  features: PhaseFeature[];
  milestones: string[];
}

const PHASE_DATA: Record<PhaseId, PhaseData> = {
  phase1: {
    id: 'phase1',
    label: 'Phase 1',
    title: 'Resume Strategy & Build',
    duration: '',
    description: 'Build a professional, ATS-optimized resume with AI-powered insights and personalized strategy guidance.',
    image: '/resume-icon.svg',
    colors: {
      gradient: 'from-blue-600 to-indigo-900',
      glow: 'bg-blue-500',
      ring: 'border-l-blue-500/50',
    },
    features: [
      { label: 'Strategy Session', value: 100, icon: Target },
      { label: 'Smart Resume Compiler', value: 100, icon: FileText, link: 'https://tools.mentorquedu.com/' },
    ],
    milestones: [
      'Complete orientation and goal setting',
      'AI-powered resume analysis',
      'Professional resume rebuild',
      'ATS optimization',
    ],
  },
  phase2: {
    id: 'phase2',
    label: 'Phase 2',
    title: 'Portfolio & Proof Engine',
    duration: '',
    description: 'Create a standout portfolio and set up proof engine to showcase your skills and projects effectively.',
    image: '/portfolio-icon.svg',
    colors: {
      gradient: 'from-purple-600 to-pink-900',
      glow: 'bg-purple-500',
      ring: 'border-l-purple-500/50',
    },
    features: [
      { label: 'Portfolio Build', value: 100, icon: Briefcase, link: 'https://yashasvi-portfolio-website.netlify.app/' },
      { label: 'Proof Engine Setup', value: 100, icon: Code },
    ],
    milestones: [
      'Portfolio template selection',
      'Project showcase setup',
      'Proof engine configuration',
      'Portfolio review and confirmation',
    ],
  },
  phase3: {
    id: 'phase3',
    label: 'Phase 3',
    title: 'AI-Powered Outreach & Diagnostics',
    duration: '',
    description: 'Leverage AI agents for outreach, track applications, and get comprehensive interview diagnostics.',
    image: '/ai-icon.svg',
    colors: {
      gradient: 'from-blue-600 to-indigo-900',
      glow: 'bg-blue-500',
      ring: 'border-l-blue-500/50',
    },
    features: [
      { label: 'AI Agent', value: 100, icon: Sparkles, link: 'https://www.linkedin.com/jobs/collections' },
      { label: 'Interview Diagnostics', value: 100, icon: TrendingUp, link: 'https://mentorque-cheatsheet.vercel.app/Candidate-diagnosis/raajit' },
    ],
    milestones: [
      'AI-powered job matching',
      'Automated outreach setup',
      'Application tracking',
      'Interview readiness assessment',
    ],
  },
  phase4: {
    id: 'phase4',
    label: 'Phase 4',
    title: 'Structured Mock Interviews',
    duration: '',
    description: 'Structured mock interview rounds with continuous refinement to build confidence and improve performance.',
    image: '/interview-icon.svg',
    colors: {
      gradient: 'from-purple-600 to-pink-900',
      glow: 'bg-purple-500',
      ring: 'border-l-purple-500/50',
    },
    features: [
      { label: 'Structured Mock Rounds', value: 100, icon: Video },
      { label: 'Continuous Refinement', value: 100, icon: TrendingUp },
    ],
    milestones: [
      '4–5 structured mock interviews',
      'Real-time feedback',
      'Performance tracking',
      'Continuous improvement',
    ],
  },
};

const ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
  },
  image: (isLeft: boolean): Variants => ({
    initial: {
      opacity: 0,
      scale: 1.5,
      filter: 'blur(15px)',
      rotate: isLeft ? -30 : 30,
      x: isLeft ? -80 : 80,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotate: 0,
      x: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      filter: 'blur(20px)',
      transition: { duration: 0.25 },
    },
  }),
};

const BackgroundGradient = ({ phaseId }: { phaseId: PhaseId }) => {
  const phaseColors: Record<PhaseId, { left: string; right: string }> = {
    phase1: { left: 'rgba(59, 130, 246, 0.15)', right: 'rgba(59, 130, 246, 0.15)' }, // Blue
    phase2: { left: 'rgba(147, 51, 234, 0.15)', right: 'rgba(147, 51, 234, 0.15)' }, // Purple
    phase3: { left: 'rgba(59, 130, 246, 0.15)', right: 'rgba(59, 130, 246, 0.15)' }, // Blue
    phase4: { left: 'rgba(147, 51, 234, 0.15)', right: 'rgba(147, 51, 234, 0.15)' }, // Purple
  };
  
  const colors = phaseColors[phaseId];
  const isLeft = phaseId === 'phase1' || phaseId === 'phase3';
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        animate={{
          background: isLeft
            ? `radial-gradient(circle at 0% 50%, ${colors.left}, transparent 50%)`
            : `radial-gradient(circle at 100% 50%, ${colors.right}, transparent 50%)`,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      />
    </div>
  );
};

const PhaseVisual = ({ data, isLeft }: { data: PhaseData; isLeft: boolean }) => (
  <motion.div layout="position" className="relative group shrink-0 -translate-x-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring} `}
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} blur-2xl opacity-40`}
    />

    <div className="relative h-80 w-80 md:h-[450px] md:w-[450px] rounded-full border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-sm">
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={data.id}
            variants={ANIMATIONS.image(isLeft)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex items-center justify-center p-8"
          >
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br ${data.colors.gradient} flex items-center justify-center shadow-2xl`}>
              {data.id === 'phase1' && <FileText className="w-16 h-16 md:w-24 md:h-24 text-white" />}
              {data.id === 'phase2' && <Briefcase className="w-16 h-16 md:w-24 md:h-24 text-white" />}
              {data.id === 'phase3' && <Sparkles className="w-16 h-16 md:w-24 md:h-24 text-white" />}
              {data.id === 'phase4' && <Video className="w-16 h-16 md:w-24 md:h-24 text-white" />}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>

  </motion.div>
);

const PhaseDetails = ({ data, isLeft }: { data: PhaseData; isLeft: boolean }) => {
  const alignClass = isLeft ? 'items-start text-left' : 'items-end text-right';

  return (
    <motion.div
      variants={ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex flex-col ${alignClass}`}
    >
      <motion.h2 variants={ANIMATIONS.item} className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
        {data.label}
      </motion.h2>
      <motion.h1 variants={ANIMATIONS.item} className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-4">
        {data.title}
      </motion.h1>
      <motion.p variants={ANIMATIONS.item} className={`text-zinc-400 mb-8 max-w-sm leading-relaxed ${isLeft ? 'mr-auto' : 'ml-auto'}`}>
        {data.description}
      </motion.p>

      <motion.div variants={ANIMATIONS.item} className="w-full space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
        {data.features.map((feature, idx) => (
          <div key={feature.label} className="group">
            {feature.link ? (
              <a
                href={feature.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r ${data.colors.gradient} hover:scale-105 transition-all duration-200 group`}
              >
                <div className="flex items-center gap-3">
                  <feature.icon size={24} className="text-white" />
                  <div className="text-sm text-white/80 flex items-center gap-2">
                    <span>Open tool</span>
                    <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="text-lg font-semibold text-white">{feature.label}</div>
              </a>
            ) : (
              <div className={`flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 ${isLeft ? 'justify-start' : 'justify-end'}`}>
                <feature.icon size={24} className={data.colors.glow === 'bg-blue-500' ? 'text-blue-500' : 'text-purple-500'} />
                <div className="text-lg font-semibold text-zinc-200">{feature.label}</div>
              </div>
            )}
          </div>
        ))}

        <div className="pt-6 space-y-3">
          <p className="text-sm uppercase tracking-wider text-zinc-400 mb-4 font-semibold">Key Milestones</p>
          {data.milestones.map((milestone, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className={`flex items-center gap-3 text-base text-zinc-200 ${isLeft ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`w-2 h-2 rounded-full ${data.colors.glow} shrink-0`} />
              <span>{milestone}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const PhaseSwitcher = ({
  activeId,
  onToggle,
}: {
  activeId: PhaseId;
  onToggle: (id: PhaseId) => void;
}) => {
  const options = Object.values(PHASE_DATA).map((p) => ({ id: p.id, label: p.label }));

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 pointer-events-none">
      <motion.div
        layout
        className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
      >
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            whileTap={{ scale: 0.96 }}
            className="relative w-24 h-12 rounded-full flex items-center justify-center text-sm font-medium focus:outline-none"
          >
            {activeId === opt.id && (
              <motion.div
                layoutId="island-surface"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-inner"
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                activeId === opt.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {opt.label}
            </span>
            {activeId === opt.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default function Demo() {
  const [activePhase, setActivePhase] = useState<PhaseId>('phase1');

  const currentData = PHASE_DATA[activePhase];
  const isLeft = activePhase === 'phase1' || activePhase === 'phase3';

  return (
    <Protected>
      <Navbar />
      <div className="relative h-screen w-full bg-black text-zinc-100 overflow-hidden selection:bg-zinc-800 flex flex-col">
        <BackgroundGradient phaseId={activePhase} />

        <main className="relative z-10 w-full h-full py-4 pflex flex-col max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-purple-400">
              Your Journey to Success
            </h1>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto mb-12">
              A structured 4-phase program designed to land interviews faster
            </p>
          </motion.div>

          <motion.div
            layout
            transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
            className={`flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full flex-1 ${
              isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            <PhaseVisual data={currentData} isLeft={isLeft} />

            <motion.div layout="position" className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                <PhaseDetails key={activePhase} data={currentData} isLeft={isLeft} />
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </main>

        <PhaseSwitcher activeId={activePhase} onToggle={setActivePhase} />
      </div>
    </Protected>
  );
}
