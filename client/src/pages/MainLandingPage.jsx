import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

import { useNavigate } from 'react-router-dom';
import {
  School, Shield, ArrowRight, Layers, Sparkles, CheckCircle,
  ExternalLink, Users, BookOpen, BarChart3, Globe, Zap,
  Star, ChevronRight, Menu, X, Building2, GraduationCap,
  CreditCard, Bell, Calendar, Lock, Award, TrendingUp,
  Clock, Check, Play, Phone, Mail, MapPin, ChevronDown
} from 'lucide-react';
import logo from '../assets/logo.svg';

/* ── Inline social SVG icons (lucide-react doesn't export these) ── */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

/* ─────────── tiny animation hook ─────────── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ─────────── Counter animation ─────────── */
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─────────── Main Component ─────────── */
const MainLandingPage = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/api/v1/tenants`)
      .then(r => setSchools(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingSchools(false));
  }, []);

  const launchTenant = (subdomain) => {
    const { protocol, hostname, port } = window.location;
    window.open(`${protocol}//${subdomain}.${hostname}:${port}`, '_blank');
  };

  /* ── data ── */
  const features = [
    { icon: Users, color: 'blue', title: 'Multi-Tenant Architecture', desc: 'Every school gets its own isolated environment, subdomain, branding, and data space — zero cross-contamination.' },
    { icon: GraduationCap, color: 'violet', title: 'Student Portal', desc: 'Students access attendance, assignments, fees, timetable, exams, and results from a single dashboard.' },
    { icon: BookOpen, color: 'emerald', title: 'Academic Management', desc: 'Manage classes, sections, subjects, homework, syllabus, and exam schedules with ease.' },
    { icon: CreditCard, color: 'amber', title: 'Fees & Payments', desc: 'Automated invoicing, online payment gateway integration, receipts, and overdue reminders.' },
    { icon: BarChart3, color: 'rose', title: 'Analytics & Reports', desc: 'Real-time dashboards and exportable PDF/Excel reports for attendance, performance, and finances.' },
    { icon: Bell, color: 'indigo', title: 'Notifications & Alerts', desc: 'Push notifications, SMS, and email alerts for announcements, results, and due payments.' },
    { icon: Lock, color: 'slate', title: 'Role-Based Access', desc: 'Fine-grained permissions for Super Admins, School Admins, Teachers, Students, and Parents.' },
    { icon: Globe, color: 'cyan', title: 'Custom Branding', desc: 'White-label every portal with custom logos, brand colors, domain names, and school identity.' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-100 text-blue-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'bg-violet-100 text-violet-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-100 text-amber-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'bg-rose-100 text-rose-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'bg-indigo-100 text-indigo-600' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'bg-slate-100 text-slate-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'bg-cyan-100 text-cyan-600' },
  };

  const steps = [
    { num: '01', title: 'Create School Account', desc: 'Log in to the Super Admin panel and click "Onboard New School" to launch the guided setup wizard.' },
    { num: '02', title: 'Configure Identity & Brand', desc: 'Set your school name, upload a logo, pick brand colors, choose a subdomain and subscription plan.' },
    { num: '03', title: 'Set Admin Credentials', desc: "Create the school administrator's login credentials — they get instant access to the school admin dashboard." },
    { num: '04', title: 'Go Live Instantly', desc: 'Your school portal is live at your subdomain. Add teachers, enroll students, and start managing everything.' },
  ];

  const plans = [
    {
      name: 'Starter', price: '₹1,999', period: '/month', badge: null, accent: 'slate',
      desc: 'Perfect for small schools just getting started.',
      features: ['Up to 200 students', '5 Teacher accounts', 'Attendance & Homework', 'Fee Management', 'Email support'],
      cta: 'Get Started Free',
    },
    {
      name: 'Professional', price: '₹4,499', period: '/month', badge: 'Most Popular', accent: 'blue',
      desc: 'The complete package for growing institutions.',
      features: ['Up to 1,000 students', '25 Teacher accounts', 'All Starter features', 'Analytics & Reports', 'SMS Notifications', 'Priority support'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise', price: 'Custom', period: '', badge: null, accent: 'violet',
      desc: 'For large institutions & school chains.',
      features: ['Unlimited students', 'Unlimited teachers', 'All Pro features', 'Custom integrations', 'Dedicated SLA', '24/7 phone support'],
      cta: 'Contact Sales',
    },
  ];

  const faqs = [
    { q: 'Can each school have its own subdomain?', a: 'Yes! Every school gets a unique subdomain (e.g. greenwood.educore.app). You can also map a custom domain.' },
    { q: 'Is data isolated between schools?', a: 'Absolutely. Each tenant (school) has completely isolated data — no school can see another school\'s data.' },
    { q: 'How long does onboarding take?', a: 'Under 5 minutes! Fill the wizard, submit, and the school portal is immediately live.' },
    { q: 'Can we customize the branding per school?', a: 'Yes — each school can have its own logo, primary color, secondary color, and school name throughout the portal.' },
    { q: 'Is there a free trial?', a: 'Yes! The Professional plan includes a 14-day free trial — no credit card required.' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Principal, Greenwood Academy', text: "EduCore transformed our administration. Parents love the fee payment portal and teachers appreciate the homework tracking.", rating: 5 },
    { name: 'Rajesh Kumar', role: 'Director, Sunrise Public School', text: "We onboarded in minutes. The branded portal gave us a professional online presence we couldn't have built ourselves.", rating: 5 },
    { name: 'Anjali Mehta', role: 'IT Coordinator, Excel International', text: "The multi-tenant architecture means complete data privacy. Worth every rupee. Student attendance tracking alone saves us hours daily.", rating: 5 },
  ];

  /* ── helpers ── */
  const [featRef, featInView] = useInView();
  const [statsRef, statsInView] = useInView();

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden antialiased">

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="EduCore Logo" className="h-15" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Schools', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/super-admin')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <Shield className="w-4 h-4" /> Admin Login
            </button>
            <button
              onClick={() => navigate('/super-admin')}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3 shadow-lg">
            {['Features', 'How It Works', 'Schools', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-50">
                {item}
              </a>
            ))}
            <button onClick={() => navigate('/super-admin')} className="w-full mt-2 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl">
              Get Started Free
            </button>
          </div>
        )}
      </header>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50/60 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-r from-blue-100/40 to-violet-100/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-10 right-0 w-72 h-72 bg-blue-100/30 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            India's #1 School Management SaaS Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.08] mb-6 max-w-5xl mx-auto">
            Run Your School
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mt-1">
              Like a Pro, Online.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-slate-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            EduCore gives every school its own fully-branded online portal — attendance, fees, homework, exams, and more — set up in under 5 minutes.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/super-admin')}
              className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Start for Free <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all"
            >
              <Play className="w-4 h-4 text-blue-600 fill-blue-600" /> See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="font-semibold text-slate-700">4.9/5</span> from 200+ schools
            </div>
            <span className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <span className="w-px h-4 bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Live in 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS BAR ══════════════════ */}
      <section ref={statsRef} className="bg-gradient-to-r from-blue-600 to-violet-600 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { val: 500, suf: '+', label: 'Schools Onboarded' },
            { val: 120000, suf: '+', label: 'Active Students' },
            { val: 99, suf: '.9%', label: 'Uptime SLA' },
            { val: 5, suf: ' min', label: 'Average Setup Time' },
          ].map(({ val, suf, label }) => (
            <div key={label}>
              <div className="text-3xl md:text-4xl font-black mb-1">
                {statsInView ? <AnimatedCounter target={val} suffix={suf} /> : `0${suf}`}
              </div>
              <div className="text-blue-100 text-sm font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="py-24 bg-white" ref={featRef}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Heading */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-5">
              <Layers className="w-3.5 h-3.5" /> Everything You Need
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              One Platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">All Your Needs.</span>
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
              From student enrollment to final result cards — EduCore covers every workflow in a modern school.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, color, title, desc }, i) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  className={`${c.bg} border ${c.border} rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm mb-2 leading-snug">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-bold uppercase tracking-widest mb-5">
              <Zap className="w-3.5 h-3.5" /> Simple Setup
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              From Sign-Up to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">Live in Minutes</span>
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              No technical knowledge needed. Our step-by-step wizard handles everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* connector line */}
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-200 via-violet-200 to-blue-200 hidden md:block" />

            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative text-center">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-blue-100 shadow-md flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:border-blue-400 transition-colors">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-violet-600">{num}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm mb-2">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">{desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="absolute top-8 -right-3 w-5 h-5 text-blue-300 hidden md:block" />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <button
              onClick={() => navigate('/super-admin')}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Create Your School Portal <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-slate-400 text-xs mt-3">No credit card • No commitment • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ══════════════════ SCHOOL REGISTRY ══════════════════ */}
      <section id="schools" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-5">
              <Building2 className="w-3.5 h-3.5" /> Live Portals
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Active School Portals
            </h2>
            <p className="text-slate-500 text-base">Click any school below to launch their live portal.</p>
          </div>

          {loadingSchools ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium">Loading school directory...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-600 mb-2">No Schools Yet</h3>
              <p className="text-slate-400 text-sm mb-6">Be the first to onboard your school on EduCore.</p>
              <button onClick={() => navigate('/super-admin')} className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all">
                Onboard First School
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map(school => (
                <div key={school._id || school.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                      <img
                        src={school.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=3B82F6&color=fff&size=56&bold=true&format=svg`}
                        alt={school.schoolName}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=3B82F6&color=fff&size=56&bold=true&format=svg`; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-800 text-sm leading-tight truncate">{school.schoolName}</h3>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {school.plan || 'Starter'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-5 pb-5 border-b border-slate-100">
                    <span className="font-medium">
                      🌐 <strong className="text-slate-700">{school.subdomain}.localhost</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {school.primaryColor && (
                        <span className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: school.primaryColor }} />
                      )}
                      {school.secondaryColor && (
                        <span className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: school.secondaryColor }} />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => launchTenant(school.subdomain)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    Launch Portal <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Trusted by Schools
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Loved by Principals & Admins
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all">
                <div className="flex mb-4">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">{name}</div>
                    <div className="text-slate-400 text-xs">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-5">
              <CreditCard className="w-3.5 h-3.5" /> Pricing Plans
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Pricing</span>
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">Start free, scale when you need. No hidden fees, ever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map(({ name, price, period, badge, accent, desc, features: feats, cta }) => {
              const isPro = badge !== null;
              return (
                <div key={name} className={`relative rounded-3xl p-8 flex flex-col ${isPro ? 'bg-gradient-to-b from-blue-600 to-violet-700 text-white shadow-2xl shadow-blue-500/30 scale-105' : 'bg-white border border-slate-200 text-slate-800 shadow-sm hover:shadow-lg transition-shadow'}`}>
                  {badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-400 text-amber-900 text-xs font-black uppercase tracking-wider rounded-full shadow-lg">
                      {badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`font-black text-xl mb-1 ${isPro ? 'text-white' : 'text-slate-800'}`}>{name}</h3>
                    <p className={`text-sm leading-relaxed ${isPro ? 'text-blue-100' : 'text-slate-500'}`}>{desc}</p>
                  </div>

                  <div className="mb-8">
                    <span className={`text-4xl font-black ${isPro ? 'text-white' : 'text-slate-900'}`}>{price}</span>
                    <span className={`text-sm font-medium ml-1 ${isPro ? 'text-blue-200' : 'text-slate-400'}`}>{period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {feats.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isPro ? 'text-blue-200' : 'text-blue-500'}`} />
                        <span className={isPro ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/super-admin')}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isPro ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg' : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30'}`}
                  >
                    {cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-bold text-slate-800 text-sm pr-4">{q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5" /> Ready to get started?
          </div>
          <h2 className="text-3xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Give Your School the Digital Edge It Deserves
          </h2>
          <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join 500+ schools already running on EduCore. Set up your portal today — it's free to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/super-admin')}
              className="flex items-center gap-2 px-8 py-4 text-base font-bold text-blue-700 bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <a href="#schools" className="flex items-center gap-2 px-8 py-4 text-base font-bold text-white border border-white/30 rounded-2xl hover:bg-white/10 transition-all">
              Browse Active Schools <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-[17px] font-black tracking-tight text-white">Edu<span className="text-blue-400">Core</span></span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 mb-5">
                India's leading multi-tenant school management SaaS — empowering educational institutions to go digital.
              </p>
              <div className="flex items-center gap-3">
                {[FacebookIcon, TwitterIcon, LinkedinIcon, InstagramIcon].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Product</h4>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'Changelog', 'Roadmap', 'API Docs'].map(l => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'].map(l => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" /> dhruvjpatel5@gmail.com
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" /> +91 98249 34361
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" /> Surat, Gujarat, India
                </li>
              </ul>
              <button
                onClick={() => navigate('/super-admin')}
                className="mt-5 flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Dashboard
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} EduCore Multi-Tenant ERP. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MainLandingPage;
