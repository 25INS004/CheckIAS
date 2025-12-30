import React, { useRef } from 'react';
import { CheckCircle, Users, Target, BookOpen, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// Wavy Bottom Edge SVG with 3D effect (curves down, creates shadow depth)
const WavyBottomEdge = ({ fillColor = "fill-gray-50 dark:fill-gray-900" }: { fillColor?: string }) => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
    <svg 
      className="relative block w-full h-20" 
      viewBox="0 0 1200 100" 
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main glow filter - subtle */}
        <filter id="glowBottom3D" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1"/>
          <feFlood floodColor="#6366f1" floodOpacity="0.5" result="color"/>
          <feComposite in="color" in2="blur1" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Shadow filter for 3D depth */}
        <filter id="shadowBottom" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.1"/>
        </filter>
      </defs>
      
      {/* Shadow layer - creates depth illusion */}
      <path 
        d="M0,50 Q50,25 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50 T900,50 T1000,50 T1100,50 T1200,50 L1200,100 L0,100 Z" 
        fill="rgba(0,0,0,0.1)"
        className="dark:opacity-30"
        transform="translate(0, 8)"
      />
      
      {/* Main fill shape */}
      <path 
        d="M0,50 Q50,25 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50 T900,50 T1000,50 T1100,50 T1200,50 L1200,100 L0,100 Z" 
        className={fillColor}
        filter="url(#shadowBottom)"
      />
      
      {/* Outer glow line */}
      <path 
        d="M0,50 Q50,25 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50 T900,50 T1000,50 T1100,50 T1200,50" 
        fill="none" 
        stroke="#4f46e5" 
        strokeWidth="4"
        strokeOpacity="0.3"
        filter="url(#glowBottom3D)"
      />
      
      {/* Main glow line */}
      <path 
        d="M0,50 Q50,25 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50 T900,50 T1000,50 T1100,50 T1200,50" 
        fill="none" 
        stroke="#818cf8" 
        strokeWidth="2"
        filter="url(#glowBottom3D)"
      />
      
      {/* Highlight line (creates 3D rim effect) */}
      <path 
        d="M0,50 Q50,25 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50 T900,50 T1000,50 T1100,50 T1200,50" 
        fill="none" 
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
        transform="translate(0, -2)"
        className="dark:opacity-20"
      />
    </svg>
  </div>
);

const AboutUs = () => {
  return (
    <div className="bg-white dark:bg-black transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white dark:bg-black transition-all duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/images/hero-background-light.png')] dark:bg-[url('/images/hero-background-dark.png')] bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-25 pointer-events-none transition-all duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div data-aos="fade-up" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            About CheckIAS
          </div>
          
          <h1 data-aos="fade-up" data-aos-delay="100" className="text-3xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Your Partner in <br className="hidden md:block"/>
            <span className="text-indigo-600 dark:text-indigo-500">UPSC Success</span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="200" className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
            We help aspirants transform their answers through expert mentorship, precise feedback, and personalized guidance.
          </p>

          <div data-aos="fade-up" data-aos-delay="300" className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
        
        {/* Wavy bottom edge */}
        <WavyBottomEdge fillColor="fill-gray-50 dark:fill-gray-900" />
      </section>

      {/* Stats Section */}
      <section className="relative pt-16 pb-32 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Copies Evaluated', value: '50,000+', icon: BookOpen },
              { label: 'Expert Mentors', value: '100+', icon: Users },
              { label: 'Success Rate', value: '94%', icon: TrendingUp },
              { label: 'User Rating', value: '4.9/5', icon: Award },
            ].map((stat, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-500 ease-out hover:-translate-y-1 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 ease-out">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500 ease-out">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Wavy bottom edge */}
        <WavyBottomEdge fillColor="fill-white dark:fill-black" />
      </section>

      {/* What We Offer Section */}
      <section className="relative pt-16 pb-32 bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Sets Us Apart</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Expert-driven evaluation that transforms your preparation.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div data-aos="fade-up" data-aos-delay="100" className="h-full">
              <FeatureCard 
                icon={<Target className="w-6 h-6 text-white" />}
                iconBg="bg-blue-500"
                title="Expert Mentors"
                description="Your answer copies are reviewed by selected candidates and subject matter experts who understand exactly what UPSC expects. Every evaluator brings years of examination insight and pedagogical expertise."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="200" className="h-full">
              <FeatureCard 
                icon={<MessageSquare className="w-6 h-6 text-white" />}
                iconBg="bg-teal-500"
                title="Quality & Depth of Feedback"
                description="We don't give generic remarks. Each copy receives detailed, constructive feedback covering content accuracy, structure, presentation, and interlinking. We tell you exactly what to improve and how."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="300" className="h-full">
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-white" />}
                iconBg="bg-purple-600"
                title="Mentorship-Driven Improvement"
                description="Feedback is just the beginning. Our 1-on-1 mentorship sessions help you understand your weaknesses, build on your strengths, and develop a personalized strategy for continuous improvement."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="400" className="h-full">
              <FeatureCard 
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                iconBg="bg-indigo-600"
                title="Positive Impact on Preparation"
                description="Our aspirants consistently report significant improvement in their Mains marks within weeks. The structured feedback loop accelerates learning and builds the confidence needed to succeed."
              />
            </div>
          </div>
        </div>
        
        {/* Wavy bottom edge */}
        <WavyBottomEdge fillColor="fill-gray-50 dark:fill-gray-900" />
      </section>

      {/* Our Approach Section */}
      <section className="relative pt-16 pb-32 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Evaluation Philosophy</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                We believe that quality feedback is the fastest path to improvement. Every answer you write is an opportunity to learn, and we're here to make sure you extract maximum value from each one.
              </p>
              
              <div className="space-y-6">
                {[
                  'Personalized attention to every single answer',
                  'Focus on presentation, distinctness, and relevance',
                  'Significant improvement in Mains marks within weeks',
                  'Direct line of communication with your mentor'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/signup" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Get Started Today
                </Link>
              </div>
            </div>

            {/* Journey Steps */}
            <div data-aos="fade-left" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Your Growth Journey</h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Submit', desc: 'Upload your answer copy through our platform' },
                  { step: '02', title: 'Evaluate', desc: 'Expert mentors review and annotate your work' },
                  { step: '03', title: 'Feedback', desc: 'Receive detailed, actionable insights' },
                  { step: '04', title: 'Improve', desc: 'Apply learnings and track your progress' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group cursor-pointer p-3 -ml-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-500 ease-out">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                      {item.step}
                    </div>
                    <div className="group-hover:translate-x-2 transition-transform duration-300">
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Wavy bottom edge */}
        <WavyBottomEdge fillColor="fill-white dark:fill-black" />
      </section>

      {/* CTA Section */}
      <section className="relative pt-16 pb-24 bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Transform Your Answers?</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10">
              Join thousands of UPSC aspirants who have improved their writing with CheckIAS.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Same FeatureCard component style as LandingPage
const FeatureCard = ({ icon, iconBg = "bg-indigo-600", title, description }: { icon: React.ReactNode, iconBg?: string, title: string, description: string }) => (
  <div className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden h-full">
    <div className={`
      absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-700/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110 group-hover:bg-gray-100 dark:group-hover:bg-gray-700
    `} />
    
    <div className={`
      relative mb-6 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:rotate-6
      ${iconBg}
    `}>
      {icon}
    </div>
    
    <div className="relative">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-300">{description}</p>
    </div>
  </div>
);

export default AboutUs;
