import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ArrowRight, CheckCircle,
  ExternalLink, Users, BookOpen, BarChart3, Globe,
  Menu, X, Building2, GraduationCap,
  CreditCard, Bell, Lock, TrendingUp,
  Clock, Check, Phone, Mail, MapPin, ChevronDown,
  Database, Server, FileText, Zap, ArrowUpRight
} from 'lucide-react';
import logo from '../assets/logo.svg';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

/* ── Social SVG icons ── */
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

/* ── Google Fonts + CSS variables ── */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
    :root {
      --navy: #0D1B2A;
      --navy-800: #152236;
      --navy-700: #1E3A5F;
      --terra: #C4613A;
      --terra-light: #E8957A;
      --cream: #F8F5F1;
      --cream-dark: #EDE8E1;
      --stone: #8B8278;
      --ink: #2C2C2C;
    }
    .font-display { font-family: 'Instrument Serif', Georgia, serif; }
    .font-body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .ledger-bg {
      background-image: repeating-linear-gradient(180deg, transparent, transparent 47px, rgba(13,27,42,0.04) 47px, rgba(13,27,42,0.04) 48px);
    }
    .ledger-bg-dark {
      background-image: repeating-linear-gradient(180deg, transparent, transparent 47px, rgba(255,255,255,0.03) 47px, rgba(255,255,255,0.03) 48px);
    }
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1); }
    .reveal.in-view { opacity: 1; transform: translateY(0); }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .marquee-track { animation: marquee 28s linear infinite; display: flex; width: max-content; }
    .marquee-track:hover { animation-play-state: paused; }
    .nav-link { position: relative; }
    .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1.5px; background:var(--terra); transition:width 0.25s ease; }
    .nav-link:hover::after { width:100%; }
    .rule-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(13,27,42,0.12),transparent); }
    .plan-featured { outline: 2px solid var(--navy); outline-offset: -2px; }
    .faq-num { font-family:'Instrument Serif',serif; font-size:0.75rem; color:var(--terra); letter-spacing:0.05em; }
    button,a { outline:none; }
    html { scroll-behavior:smooth; }
    .counter-value { font-variant-numeric: tabular-nums; }
    .feat-tab-btn { transition: all 0.2s ease; }
  `}</style>
);

/* ── useInView hook ── */
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ── Reveal wrapper ── */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView(0.08);
  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ── Animated counter ── */
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
  return <span ref={ref} className="counter-value">{count.toLocaleString()}{suffix}</span>;
};

/* ── School logos marquee ── */
const SchoolLogos = () => {
  const schools = ['Greenwood Academy','Sunrise Public School','Excel International','Tapovan Vidhyalay','Delhi Public School Surat','St. Xavier\'s High School','Shree Swaminarayan Vidyalay','Nirman High School','National Public School','Bright Future Academy'];
  const items = [...schools, ...schools];
  return (
    <div className="overflow-hidden py-2">
      <div className="marquee-track">
        {items.map((name, i) => (
          <div key={i} className="flex items-center gap-2.5 mx-8 flex-shrink-0">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-semibold text-xs text-white flex-shrink-0" style={{ background: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>
              {name.charAt(0)}
            </div>
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Dashboard Mockup ── */
const DashboardMockup = () => (
  <div className="relative w-full">
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(13,27,42,0.15)', background: '#fff' }}>
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
        </div>
        <div className="mx-3 flex-1 rounded-md px-3 py-1 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif' }}>
          greenwood.educore.app
        </div>
      </div>
      {/* App content */}
      <div className="flex" style={{ background: 'var(--cream)', minHeight: 270 }}>
        {/* Sidebar */}
        <div className="w-36 flex-shrink-0 py-4 px-2.5" style={{ background: 'var(--navy)' }}>
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="text-white text-[10px] font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>EduCore</span>
          </div>
          {[
            { label: 'Dashboard', icon: BarChart3, active: true },
            { label: 'Students', icon: Users, active: false },
            { label: 'Attendance', icon: Check, active: false },
            { label: 'Fees', icon: CreditCard, active: false },
            { label: 'Homework', icon: BookOpen, active: false },
            { label: 'Reports', icon: FileText, active: false },
          ].map(({ label, icon: Icon, active }) => (
            <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5" style={{ background: active ? 'rgba(196,97,58,0.2)' : 'transparent', borderLeft: active ? '2px solid var(--terra)' : '2px solid transparent' }}>
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: active ? 'var(--terra-light)' : 'rgba(255,255,255,0.4)' }} />
              <span className="text-[9px]" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
            </div>
          ))}
        </div>
        {/* Main content */}
        <div className="flex-1 p-3.5">
          <div className="text-[10px] font-semibold mb-2.5" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>Good morning, Principal Sharma</div>
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            {[
              { label: 'Students', val: '1,247', color: 'var(--navy)' },
              { label: 'Present', val: '94.2%', color: '#16a34a' },
              { label: 'Fees Due', val: '₹3.2L', color: 'var(--terra)' },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-lg p-2" style={{ background: '#fff', border: '1px solid rgba(13,27,42,0.07)' }}>
                <div className="text-[8px] mb-0.5" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
                <div className="text-sm font-bold" style={{ color, fontFamily: 'DM Sans, sans-serif' }}>{val}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(13,27,42,0.07)' }}>
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(13,27,42,0.06)' }}>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>Recent Attendance</span>
              <span className="text-[9px]" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>View all →</span>
            </div>
            {[
              { name: 'Aarav Shah', cls: '10-A', status: 'Present' },
              { name: 'Priya Mehta', cls: '9-B', status: 'Absent' },
              { name: 'Rohan Patel', cls: '10-A', status: 'Present' },
              { name: 'Sana Khan', cls: '8-C', status: 'Late' },
            ].map(({ name, cls, status }) => (
              <div key={name} className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid rgba(13,27,42,0.03)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: 'var(--navy)' }}>{name.charAt(0)}</div>
                  <div>
                    <div className="text-[9px] font-medium" style={{ color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif' }}>{name}</div>
                    <div className="text-[8px]" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Class {cls}</div>
                  </div>
                </div>
                <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: status==='Present'?'#dcfce7':status==='Absent'?'#fee2e2':'#fef9c3', color: status==='Present'?'#16a34a':status==='Absent'?'#dc2626':'#a16207', fontFamily: 'DM Sans, sans-serif' }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Floating card — fee metric */}
    <div className="absolute -right-8 top-1/3 rounded-xl p-3 shadow-xl hidden lg:block" style={{ background: '#fff', border: '1px solid rgba(13,27,42,0.08)', minWidth: 130, transform: 'rotate(2deg)' }}>
      <div className="text-[9px] font-medium mb-1.5" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Fee Collection</div>
      <div className="text-base font-bold" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>₹12.4L</div>
      <div className="flex items-center gap-1 mt-1">
        <TrendingUp className="w-3 h-3" style={{ color: '#16a34a' }} />
        <span className="text-[9px]" style={{ color: '#16a34a', fontFamily: 'DM Sans, sans-serif' }}>+23% this month</span>
      </div>
    </div>
    {/* Floating card — uptime */}
    <div className="absolute -left-6 bottom-8 rounded-xl p-3 shadow-xl hidden lg:block" style={{ background: 'var(--navy)', minWidth: 110, transform: 'rotate(-2deg)' }}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[9px] font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>All systems live</span>
      </div>
      <div className="text-xs font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>99.9% uptime</div>
    </div>
  </div>
);

/* ─────────────── MAIN COMPONENT ─────────────── */
const MainLandingPage = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ loading: false, success: false, error: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, success: false, error: '' });
    try {
      await axios.post(`${API_URL}/api/v1/contacts`, contactForm);
      setContactStatus({ loading: false, success: true, error: '' });
      setContactForm({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setContactStatus(s => ({ ...s, success: false })), 5000);
    } catch (err) {
      setContactStatus({ loading: false, success: false, error: err.response?.data?.error || 'Failed to send message.' });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
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

  const featureGroups = [
    {
      tab: 'Student Management',
      icon: Users,
      headline: 'Every student. Every detail. One place.',
      body: 'Enroll students, manage profiles, track academic history, and give each student their own secure dashboard. Parents stay informed in real time.',
      bullets: ['Bulk enrollment & CSV import', 'Parent portal access', 'Academic history tracking', 'Document management'],
      data: [
        { label: 'Aarav Shah — Class 10-A — Roll #42', tag: 'Active' },
        { label: 'Priya Mehta — Class 9-B — Roll #07', tag: 'Active' },
        { label: 'Rohan Patel — Class 10-A — Roll #18', tag: 'Active' },
        { label: 'Sana Khan — Class 8-C — Roll #31', tag: 'Active' },
      ],
    },
    {
      tab: 'Attendance & Academics',
      icon: BookOpen,
      headline: 'From bell to bell — fully automated.',
      body: 'Mark attendance with one click, assign homework, manage the syllabus, and schedule exams. Less paperwork, more teaching.',
      bullets: ['One-click daily attendance', 'Homework & assignment tracker', 'Exam scheduling & results', 'Timetable management'],
      data: [
        { label: 'Present today', val: '94.2%', color: '#4ade80' },
        { label: 'Homework submitted', val: '78 / 95', color: 'var(--terra-light)' },
        { label: 'Exams this week', val: '3 scheduled', color: '#60a5fa' },
        { label: 'Syllabus completion', val: '67%', color: '#facc15' },
      ],
    },
    {
      tab: 'Fees & Finance',
      icon: CreditCard,
      headline: 'Zero overdue fees. Zero manual follow-ups.',
      body: 'Automate the full fee cycle: generate invoices, accept online payments, send overdue reminders, and export financial reports — no spreadsheets.',
      bullets: ['Automated invoicing', 'Online payment gateway', 'Overdue SMS/email alerts', 'PDF receipt generation'],
      data: [
        { label: 'Collected this term', val: '₹12.4L', color: '#4ade80' },
        { label: 'Overdue fees', val: '₹1.2L', color: 'var(--terra-light)' },
        { label: 'Invoices generated', val: '1,247', color: '#fff' },
        { label: 'Reminders sent (week)', val: '38', color: '#facc15' },
      ],
    },
    {
      tab: 'Analytics & Reports',
      icon: BarChart3,
      headline: 'Data that drives better decisions.',
      body: 'Real-time dashboards give principals a clear picture of attendance, fee collection, academic performance, and more. Export any report in one click.',
      bullets: ['Live attendance dashboard', 'Fee collection reports', 'Student performance analytics', 'PDF / Excel export'],
      data: [
        { label: 'Avg. attendance rate', val: '91.4%', color: '#4ade80' },
        { label: 'Top class', val: '10-A (96%)', color: '#fff' },
        { label: 'Reports exported (month)', val: '24', color: 'var(--terra-light)' },
        { label: 'Fee collection rate', val: '88.3%', color: '#60a5fa' },
      ],
    },
  ];

  const steps = [
    { num: '01', title: 'Create School Account', desc: 'Log in to the Super Admin panel and launch the guided onboarding wizard — takes under 2 minutes.' },
    { num: '02', title: 'Configure Identity & Brand', desc: 'Set your school name, upload a logo, pick brand colors, and choose a subdomain. Entirely your own branded space.' },
    { num: '03', title: 'Set Admin Credentials', desc: "Create the school administrator's secure login. They get instant access to the full admin dashboard." },
    { num: '04', title: 'Go Live Instantly', desc: 'Your school portal is live at your subdomain. Add teachers, enroll students, and start managing today.' },
  ];

  const plans = [
    {
      name: 'Starter', price: '₹1,999', period: '/month', featured: false,
      desc: 'For small schools getting started with digital management.',
      features: ['Up to 200 students', '5 Teacher accounts', 'Attendance & Homework', 'Fee Management', 'Email support'],
      cta: 'Get Started Free',
    },
    {
      name: 'Professional', price: '₹4,499', period: '/month', featured: true,
      desc: 'The complete package for growing institutions that need everything.',
      features: ['Up to 1,000 students', '25 Teacher accounts', 'All Starter features', 'Analytics & Reports', 'SMS Notifications', 'Priority support'],
      cta: 'Start 14-Day Trial',
    },
    {
      name: 'Enterprise', price: 'Custom', period: '', featured: false,
      desc: 'For large institutions, school chains, and district deployments.',
      features: ['Unlimited students', 'Unlimited teachers', 'All Pro features', 'Custom integrations', 'Dedicated SLA', '24/7 phone support'],
      cta: 'Contact Sales',
    },
  ];

  const faqs = [
    { q: 'Can each school have its own subdomain?', a: 'Yes — every school gets a unique subdomain (e.g. greenwood.educore.app). You can also map a fully custom domain.' },
    { q: 'Is data isolated between schools?', a: "Completely. Each school operates in its own isolated environment. No school can access another's data, ever." },
    { q: 'How long does onboarding take?', a: 'Under 5 minutes. Fill the wizard, submit, and your school portal is immediately live. No technical setup required.' },
    { q: 'Can we customize branding per school?', a: 'Yes — each school can have its own logo, primary color, secondary color, school name, and subdomain throughout the portal.' },
    { q: 'Is there a free trial?', a: 'Yes. The Professional plan includes a 14-day free trial — no credit card required.' },
    { q: 'What happens to our data if we cancel?', a: 'Your data is yours. Export everything as CSV/PDF before cancellation. We retain data for 30 days post-cancellation for recovery.' },
  ];

  const testimonials = [
    {
      quote: 'Fee collection time dropped from 3 weeks to under 4 days. Parents pay online, reminders go out automatically, and my staff finally has time for actual student support.',
      name: 'Priya Sharma', role: 'Principal', school: 'Greenwood Academy, Ahmedabad',
      metric: 'Fee collection: 3 weeks → 4 days',
    },
    {
      quote: 'We onboarded 1,100 students in a single afternoon. The branded portal gave us a professional presence we could never have built ourselves.',
      name: 'Rajesh Kumar', role: 'Director', school: 'Sunrise Public School, Surat',
      metric: '1,100 students onboarded in one day',
    },
    {
      quote: 'The multi-tenant isolation was the deciding factor. Our student data never leaves our environment. It was an easy sell to our parent community.',
      name: 'Anjali Mehta', role: 'IT Coordinator', school: 'Excel International, Vadodara',
      metric: 'Complete data isolation per school',
    },
  ];

  const [statsRef, statsInView] = useInView();
  const navItems = ['Features', 'How It Works', 'Schools', 'Pricing', 'FAQ'];

  return (
    <div className="min-h-screen overflow-x-hidden antialiased font-body" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
      <FontImport />

      {/* ══ NAVBAR ══ */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{ background: scrolled ? 'rgba(248,245,241,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(13,27,42,0.08)' : '1px solid transparent' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <img src={logo} alt="EduCore" className="h-9" />
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} className="nav-link text-sm font-medium transition-colors" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{item}</a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/super-admin')} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,27,42,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Shield className="w-3.5 h-3.5" /> Admin Login
            </button>
            <button onClick={() => navigate('/super-admin')} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all" style={{ background: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = '#B5542F'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--terra)'}>
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button className="md:hidden p-2 rounded-lg" style={{ color: 'var(--navy)' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-5 space-y-1" style={{ background: 'var(--cream)', borderTop: '1px solid rgba(13,27,42,0.08)' }}>
            {navItems.map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm font-medium" style={{ color: 'var(--navy)', borderBottom: '1px solid rgba(13,27,42,0.06)', fontFamily: 'DM Sans, sans-serif' }}>{item}</a>
            ))}
            <button onClick={() => navigate('/super-admin')} className="w-full mt-3 py-3 text-white font-semibold text-sm rounded-lg" style={{ background: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Get Started Free</button>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 ledger-bg overflow-hidden" style={{ background: 'var(--cream)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-25" style={{ backgroundImage: 'radial-gradient(circle, rgba(13,27,42,0.12) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="h-px w-10 flex-shrink-0" style={{ background: 'var(--terra)' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Trusted by 500+ schools across India</span>
              </div>
              <h1 className="font-display mb-6 leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, Georgia, serif' }}>
                Your school.<br />
                <em>Fully online.</em><br />
                <span style={{ color: 'var(--terra)' }}>Completely yours.</span>
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-9 max-w-[480px]" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>
                EduCore gives every school its own fully-branded online portal — attendance, fees, homework, exams, and analytics — ready in under 5 minutes. No IT department needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => navigate('/super-admin')} className="flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-lg transition-all" style={{ background: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#B5542F'; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--terra)'; e.currentTarget.style.transform='translateY(0)'; }}>
                  Start for Free <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#how-it-works" className="flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-lg transition-all" style={{ color: 'var(--navy)', border: '1.5px solid rgba(13,27,42,0.2)', fontFamily: 'DM Sans, sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--navy)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(13,27,42,0.2)'}>
                  See How It Works
                </a>
              </div>
              <div className="flex flex-wrap gap-5">
                {[{ icon: Check, label: 'No credit card required' }, { icon: Zap, label: 'Live in under 5 minutes' }, { icon: Shield, label: 'SOC 2 data isolation' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--terra)' }} />
                    <span className="text-sm" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Reveal delay={200} className="relative pt-8 lg:pt-0">
              <DashboardMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── School logos marquee ── */}
      <div className="py-5 border-y" style={{ borderColor: 'rgba(13,27,42,0.08)', background: '#fff' }}>
        <p className="text-xs font-medium uppercase tracking-widest text-center mb-3" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Trusted by schools across Gujarat & India</p>
        <SchoolLogos />
      </div>

      {/* ══ STATS / ROI ══ */}
      <section ref={statsRef} className="py-20 ledger-bg-dark" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-12 text-center" style={{ color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif' }}>Real numbers. Real schools.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { val: 500, suf: '+', label: 'Schools Onboarded', sub: 'Across 6 states' },
              { val: 120, suf: 'K+', label: 'Active Students', sub: 'Managed on the platform' },
              { val: 10, suf: ' hrs/week', label: 'Saved per School', sub: 'On admin paperwork' },
              { val: 99, suf: '.9%', label: 'Uptime SLA', sub: 'Guaranteed availability' },
            ].map(({ val, suf, label, sub }) => (
              <div key={label} className="text-center py-10 px-6" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#fff', fontFamily: 'Instrument Serif, serif' }}>
                  {statsInView ? <AnimatedCounter target={val} suffix={suf} /> : `0${suf}`}
                </div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#E8E0D5', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES (Tabbed) ══ */}
      <section id="features" className="py-24 ledger-bg" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Everything you need</p>
              <h2 className="font-display leading-tight max-w-xl" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>
                One platform covers every workflow in your school.
              </h2>
            </div>
          </Reveal>
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-10 pb-4" style={{ borderBottom: '1.5px solid rgba(13,27,42,0.1)' }}>
            {featureGroups.map((fg, i) => (
              <button key={fg.tab} onClick={() => setActiveFeature(i)} className="feat-tab-btn px-4 py-2 rounded-md text-sm font-medium transition-all" style={{ background: activeFeature===i ? 'var(--navy)' : 'transparent', color: activeFeature===i ? '#fff' : 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>
                {fg.tab}
              </button>
            ))}
          </div>
          {/* Feature content */}
          <div className="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-12 items-start">
            <div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: 'var(--navy)' }}>
                {React.createElement(featureGroups[activeFeature].icon, { className: 'w-5 h-5', style: { color: 'var(--terra-light)' } })}
              </div>
              <h3 className="font-display mb-4" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif', lineHeight: 1.2 }}>
                {featureGroups[activeFeature].headline}
              </h3>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>{featureGroups[activeFeature].body}</p>
              <ul className="space-y-3">
                {featureGroups[activeFeature].bullets.map(b => (
                  <li key={b} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(196,97,58,0.12)' }}>
                      <Check className="w-3 h-3" style={{ color: 'var(--terra)' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif' }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--navy)', padding: '2px' }}>
              <div className="rounded-2xl p-6" style={{ background: '#0F2236' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif' }}>{featureGroups[activeFeature].tab}</div>
                <div className="space-y-3">
                  {featureGroups[activeFeature].data.map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans, sans-serif' }}>{row.label}</span>
                      {row.tag && <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(196,97,58,0.2)', color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif' }}>{row.tag}</span>}
                      {row.val && <span className="text-xs font-bold" style={{ color: row.color || '#fff', fontFamily: 'DM Sans, sans-serif' }}>{row.val}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ══ */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>The EduCore difference</p>
              <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>Still using registers and spreadsheets?</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal delay={0}>
              <div className="rounded-2xl p-7" style={{ background: 'var(--cream)', border: '1.5px solid rgba(13,27,42,0.08)' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-5 pb-3" style={{ color: '#9C8F87', fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid rgba(13,27,42,0.08)' }}>The Old Way</div>
                {['Attendance registers filled by hand daily','Fee collection tracked across 3 spreadsheets','Homework tracked on paper & WhatsApp groups','Reports compiled manually — takes days','No parent visibility until parent-teacher day','Data lives in a local hard drive or register'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#fee2e2' }}>
                      <X className="w-2.5 h-2.5 text-red-500" />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: '#7A6F6A', fontFamily: 'DM Sans, sans-serif' }}>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-2xl p-7" style={{ background: 'var(--navy)' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-5 pb-3" style={{ color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>With EduCore</div>
                {['One-click attendance from any device, anywhere','Automated invoices, payments tracked in real time','Homework dashboard — students see assignments instantly','Reports export to PDF/Excel in seconds','Parents get live updates on attendance & fees','Encrypted cloud — zero data loss, 99.9% uptime'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(196,97,58,0.25)' }}>
                      <Check className="w-2.5 h-2.5" style={{ color: 'var(--terra-light)' }} />
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif' }}>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="rule-divider mx-auto max-w-7xl" />

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-24 ledger-bg-dark" style={{ background: 'var(--navy-800)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_58%] gap-16 items-center">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif' }}>Simple setup</p>
                <h2 className="font-display leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', fontFamily: 'Instrument Serif, serif' }}>
                  From sign-up to live portal in under 5 minutes.
                </h2>
                <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans, sans-serif' }}>
                  No IT department. No technical setup. Our guided wizard handles everything — your branded school portal is live the moment you finish.
                </p>
                <button onClick={() => navigate('/super-admin')} className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all" style={{ background: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.background='#B5542F'}
                  onMouseLeave={e => e.currentTarget.style.background='var(--terra)'}>
                  Create Your School Portal <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}>No credit card · No commitment · Cancel anytime</p>
              </div>
            </Reveal>
            <div>
              {steps.map(({ num, title, desc }, i) => (
                <Reveal key={num} delay={i * 80}>
                  <div className="flex gap-6 py-7" style={{ borderBottom: i < steps.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span className="font-display text-4xl font-normal leading-none flex-shrink-0" style={{ color: 'var(--terra)', fontFamily: 'Instrument Serif, serif', opacity: 0.7 }}>{num}</span>
                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>{title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif' }}>{desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECURITY CALLOUT ══ */}
      <section className="py-20 ledger-bg" style={{ background: 'var(--cream-dark)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-[45%_52%] gap-12 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Security & Privacy</p>
                <h2 className="font-display leading-tight mb-5" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>
                  Your students' data stays completely private.
                </h2>
                <p className="text-base leading-relaxed" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>
                  EduCore uses a strict multi-tenant isolation model. Every school's data lives in its own encrypted namespace — no school can ever access another's records. This isn't just a feature; it's architecture.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Database, title: 'Tenant-Level Isolation', desc: "Each school's data is logically isolated at the database level. Zero cross-contamination." },
                  { icon: Server, title: 'Daily Encrypted Backups', desc: 'Automated backups every 24 hours with 30-day retention. Your data is never at risk.' },
                  { icon: Lock, title: 'Role-Based Access Control', desc: 'Granular permissions for Super Admins, School Admins, Teachers, Students, and Parents.' },
                  { icon: Shield, title: '99.9% Uptime SLA', desc: 'Enterprise-grade infrastructure with guaranteed uptime and 24/7 monitoring.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(13,27,42,0.08)' }}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center mb-3" style={{ background: 'rgba(13,27,42,0.06)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                    </div>
                    <h4 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: '#7A6F6A', fontFamily: 'DM Sans, sans-serif' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ SCHOOL REGISTRY ══ */}
      <section id="schools" className="py-24" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Live Portals</p>
                <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>Schools live on EduCore</h2>
              </div>
              <p className="text-sm" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif', maxWidth: 280 }}>Click any school below to launch their live portal.</p>
            </div>
          </Reveal>
          {loadingSchools ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Loading school directory...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="py-16 text-center rounded-2xl" style={{ border: '1.5px dashed rgba(13,27,42,0.15)', background: 'var(--cream)' }}>
              <Building2 className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgba(13,27,42,0.2)' }} />
              <h3 className="font-semibold mb-2" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>No schools yet</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Be the first to onboard your school on EduCore.</p>
              <button onClick={() => navigate('/super-admin')} className="px-6 py-3 text-white font-semibold text-sm rounded-lg" style={{ background: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Onboard First School</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {schools.map(school => (
                <Reveal key={school._id || school.id}>
                  <div className="rounded-xl p-5 transition-all cursor-pointer" style={{ border: '1.5px solid rgba(13,27,42,0.08)', background: '#fff' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--navy)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(13,27,42,0.08)'; e.currentTarget.style.transform='translateY(0)'; }}>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(13,27,42,0.1)' }}>
                        <img src={school.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=0D1B2A&color=fff&size=48&bold=true&format=svg`} alt={school.schoolName} className="w-full h-full object-cover"
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=0D1B2A&color=fff&size=48&bold=true&format=svg`; }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{school.schoolName}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded" style={{ background: 'var(--cream)', color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{school.plan || 'Starter'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-xs" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>
                      <span>🌐 {school.subdomain}.localhost</span>
                      <div className="flex gap-1.5">
                        {school.primaryColor && <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: school.primaryColor }} />}
                        {school.secondaryColor && <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: school.secondaryColor }} />}
                      </div>
                    </div>
                    <button onClick={() => launchTenant(school.subdomain)} className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-lg transition-all" style={{ background: 'var(--navy)', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.background='#152236'}
                      onMouseLeave={e => e.currentTarget.style.background='var(--navy)'}>
                      Launch Portal <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-24 ledger-bg" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>From the principals themselves</p>
                <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>What school leaders say.</h2>
              </div>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, school, metric }, i) => (
              <Reveal key={name} delay={i * 100}>
                <div className="flex flex-col h-full rounded-xl p-7" style={{ background: '#fff', border: '1.5px solid rgba(13,27,42,0.08)' }}>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md mb-5 self-start" style={{ background: 'rgba(196,97,58,0.1)', color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>
                    <TrendingUp className="w-3.5 h-3.5" /> {metric}
                  </div>
                  <div className="font-display text-5xl leading-none mb-4 -ml-1" style={{ color: 'var(--cream-dark)', fontFamily: 'Instrument Serif, serif' }}>"</div>
                  <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: '#4A4440', fontFamily: 'DM Sans, sans-serif' }}>{quote}</p>
                  <div style={{ borderTop: '1px solid rgba(13,27,42,0.06)', paddingTop: '1rem' }}>
                    <div className="font-semibold text-sm" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{role}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{school}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="py-24" style={{ background: '#fff' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Pricing</p>
              <h2 className="font-display mb-4" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>Transparent pricing. No surprises.</h2>
              <p className="text-base" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>Start free, scale when you need. No hidden fees, ever.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {plans.map(({ name, price, period, featured, desc, features: feats, cta }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div className="flex flex-col h-full rounded-2xl p-7 transition-all" style={{ background: featured ? 'var(--navy)' : '#fff', border: featured ? '2px solid var(--navy)' : '1.5px solid rgba(13,27,42,0.1)', position: 'relative' }}>
                  {featured && <div className="absolute -top-px left-7 right-7 h-0.5 rounded-b" style={{ background: 'var(--terra)' }} />}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-1.5" style={{ color: featured ? '#fff' : 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>
                      {name}
                      {featured && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(196,97,58,0.2)', color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif' }}>Most chosen</span>}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: featured ? 'rgba(255,255,255,0.55)' : '#7A6F6A', fontFamily: 'DM Sans, sans-serif' }}>{desc}</p>
                  </div>
                  <div className="mb-7">
                    <span className="font-display text-4xl" style={{ color: featured ? '#fff' : 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>{price}</span>
                    {period && <span className="text-sm ml-1" style={{ color: featured ? 'rgba(255,255,255,0.4)' : 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {feats.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: featured ? 'var(--terra-light)' : 'var(--terra)' }} />
                        <span style={{ color: featured ? 'rgba(255,255,255,0.75)' : '#4A4440', fontFamily: 'DM Sans, sans-serif' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/super-admin')} className="w-full py-3 rounded-lg font-semibold text-sm transition-all" style={{ background: featured ? 'var(--terra)' : 'transparent', color: featured ? '#fff' : 'var(--navy)', border: featured ? 'none' : '1.5px solid rgba(13,27,42,0.2)', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => { if(featured) e.currentTarget.style.background='#B5542F'; else e.currentTarget.style.borderColor='var(--navy)'; }}
                    onMouseLeave={e => { if(featured) e.currentTarget.style.background='var(--terra)'; else e.currentTarget.style.borderColor='rgba(13,27,42,0.2)'; }}>
                    {cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="text-center text-sm mt-8" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>All plans include a 14-day free trial. No credit card required. Cancel anytime.</p>
          </Reveal>
        </div>
      </section>

      <div className="rule-divider" />

      {/* ══ FAQ ══ */}
      <section id="faq" className="py-24 ledger-bg" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[35%_62%] gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>FAQ</p>
                <h2 className="font-display leading-tight mb-5" style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>
                  Questions we hear from school admins.
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>
                  Can't find what you're looking for? Reach us at{' '}
                  <a href="mailto:dhruvjpatel5@gmail.com" style={{ color: 'var(--terra)', textDecoration: 'underline' }}>dhruvjpatel5@gmail.com</a>
                </p>
              </div>
            </Reveal>
            <div>
              {faqs.map(({ q, a }, i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="border-b cursor-pointer" style={{ borderColor: 'rgba(13,27,42,0.1)' }} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <div className="flex items-start gap-5 py-6">
                      <span className="faq-num mt-0.5 flex-shrink-0 w-6 text-right">{String(i+1).padStart(2,'0')}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{q}</h3>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: activeFaq===i ? 'var(--navy)' : 'rgba(13,27,42,0.08)', transform: activeFaq===i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <ChevronDown className="w-3.5 h-3.5" style={{ color: activeFaq===i ? '#fff' : 'var(--navy)' }} />
                          </div>
                        </div>
                        {activeFaq === i && (
                          <p className="text-sm leading-relaxed mt-3 pr-10" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>{a}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" className="py-24" style={{ background: '#fff', borderTop: '1px solid rgba(13,27,42,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}>Get in Touch</p>
                <h2 className="font-display leading-tight mb-6" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--navy)', fontFamily: 'Instrument Serif, serif' }}>Let's talk about your school.</h2>
                <p className="text-base leading-relaxed mb-10" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif', maxWidth: 400 }}>
                  Whether you need a custom enterprise plan or a personalized demo, our team is here to help your school go digital — without the complexity.
                </p>
                <div className="space-y-7">
                  {[
                    { icon: Mail, label: 'Email Us', value: 'dhruvjpatel5@gmail.com' },
                    { icon: Phone, label: 'Call Us', value: '+91 98249 34361' },
                    { icon: MapPin, label: 'Based in', value: 'Surat, Gujarat, India' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--cream)', border: '1px solid rgba(13,27,42,0.08)' }}>
                        <Icon className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
                        <div className="text-sm font-medium" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="rounded-2xl p-8" style={{ background: 'var(--cream)', border: '1.5px solid rgba(13,27,42,0.08)' }}>
                <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>Send a Message</h3>
                {contactStatus.success && (
                  <div className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm" style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p style={{ fontFamily: 'DM Sans, sans-serif' }}>Thanks! We'll get back to you within 24 hours.</p>
                  </div>
                )}
                {contactStatus.error && (
                  <div className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm" style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p style={{ fontFamily: 'DM Sans, sans-serif' }}>{contactStatus.error}</p>
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ key: 'firstName', label: 'First Name', ph: 'Priya' }, { key: 'lastName', label: 'Last Name', ph: 'Sharma' }].map(({ key, label, ph }) => (
                      <div key={key}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>{label}</label>
                        <input type="text" required placeholder={ph} value={contactForm[key]} onChange={e => setContactForm({ ...contactForm, [key]: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm" style={{ background: '#fff', border: '1.5px solid rgba(13,27,42,0.12)', color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor='var(--navy)'}
                          onBlur={e => e.target.style.borderColor='rgba(13,27,42,0.12)'} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Email Address</label>
                    <input type="email" required placeholder="principal@school.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm" style={{ background: '#fff', border: '1.5px solid rgba(13,27,42,0.12)', color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor='var(--navy)'}
                      onBlur={e => e.target.style.borderColor='rgba(13,27,42,0.12)'} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>Message</label>
                    <textarea required rows={4} placeholder="Tell us about your school and what you're looking for..." value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} className="w-full px-4 py-3 rounded-lg text-sm resize-none" style={{ background: '#fff', border: '1.5px solid rgba(13,27,42,0.12)', color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor='var(--navy)'}
                      onBlur={e => e.target.style.borderColor='rgba(13,27,42,0.12)'} />
                  </div>
                  <button type="submit" disabled={contactStatus.loading} className="w-full py-3.5 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60" style={{ background: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => { if(!contactStatus.loading) e.currentTarget.style.background='#152236'; }}
                    onMouseLeave={e => e.currentTarget.style.background='var(--navy)'}>
                    {contactStatus.loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-24 ledger-bg-dark relative overflow-hidden" style={{ background: 'var(--navy)' }}>
        <div className="absolute top-12 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute bottom-12 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="font-display leading-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', color: '#fff', fontFamily: 'Instrument Serif, serif' }}>
              Give your school the digital infrastructure it deserves.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans, sans-serif' }}>
              Join 500+ schools already running on EduCore. Set up your portal today — it's free to start, no credit card required.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/super-admin')} className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-lg transition-all" style={{ background: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.background='#B5542F'; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--terra)'; e.currentTarget.style.transform='translateY(0)'; }}>
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#schools" className="flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-lg transition-all" style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}>
                Browse Active Schools <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="pt-16 pb-8" style={{ background: '#060E16', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-1">
              <img src={logo} alt="EduCore" className="h-8 mb-4" style={{ filter: 'brightness(10)', opacity: 0.75 }} />
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>India's most trusted school management SaaS — giving every school a branded, secure digital home.</p>
              <div className="flex gap-3">
                {[FacebookIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-md flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}>
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
            {[
              { heading: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'How It Works', href: '#how-it-works' }, { label: 'Schools', href: '#schools' }, { label: 'Pricing', href: '#pricing' }] },
              { heading: 'Company', links: [{ label: 'Contact Us', href: '#contact' }, { label: 'Privacy Policy', href: '/privacy-policy' }, { label: 'Terms of Service', href: '/terms-of-service' }] },
              { heading: 'For Schools', links: [{ label: 'Admin Login', href: '/super-admin' }, { label: 'Onboard Your School', href: '/super-admin' }, { label: 'FAQ', href: '#faq' }] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}>{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Sans, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.color='#fff'}
                        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Sans, sans-serif' }}>
            <span>© {new Date().getFullYear()} EduCore. All rights reserved. Built with care in Surat, Gujarat.</span>
            <div className="flex gap-5">
              <a href="/privacy-policy" style={{ color: 'rgba(255,255,255,0.25)' }}>Privacy Policy</a>
              <a href="/terms-of-service" style={{ color: 'rgba(255,255,255,0.25)' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MainLandingPage;
