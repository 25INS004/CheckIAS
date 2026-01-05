import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, CheckCircle, BarChart2, Zap, BookOpen, Users, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewCarousel from '../components/ReviewCarousel';
import SectionSeparator from '../components/SectionSeparator';
import useEmblaCarousel from 'embla-carousel-react';

const pricingPlans = [
  {
    id: 'free',
    title: 'Free',
    description: 'Try before you commit.',
    price: '₹0',
    period: '/ lifetime',
    billingNote: 'No Credit Card Required',
    buttonText: 'Get Started',
    link: '/login',
    features: [
      { text: '2 Submissions (Lifetime)', included: true },
      { text: 'Basic Feedback', included: true },
      { text: 'Model Answers', included: false },
      { text: 'Mentor Call', included: false }
    ]
  },
  {
    id: 'starter',
    title: 'Starter',
    description: 'Great for occasional evaluation.',
    price: '₹999',
    period: '/ month',
    billingNote: 'Billed Monthly',
    buttonText: 'Get Started',
    link: '/login?plan=starter',
    features: [
      { text: 'Unlimited Submissions', included: true },
      { text: 'Basic Feedback', included: true },
      { text: '24h Turnaround', included: true },
      { text: '2 calls per month', included: true }
    ]
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'For serious aspirants.',
    price: '₹2,499',
    period: '/ 3 months',
    billingNote: 'Billed Quarterly',
    buttonText: 'Get Started',
    link: '/login?plan=pro',
    isPopular: true,
    features: [
      { text: 'Unlimited Submissions', included: true },
      { text: 'Detailed Feedback', included: true },
      { text: 'Model Answers', included: true },
      { text: '6 calls per 3 months', included: true }
    ]
  },
  {
    id: 'achiever',
    title: 'Achiever',
    description: 'For rank holders.',
    price: '₹4,999',
    period: '/ 6 months',
    billingNote: 'Billed Biannually',
    buttonText: 'Get Started',
    link: '/login?plan=achiever',
    features: [
      { text: 'Unlimited Submissions', included: true },
      { text: 'Personal Mentor', included: true },
      { text: 'Daily Targets', included: true },
      { text: 'Live Evaluation', included: true },
      { text: '12 calls per 6 months', included: true }
    ]
  }
];

const LandingPage = () => {
  // Embla carousel for mobile pricing
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="bg-white dark:bg-black transition-colors duration-200">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[90vh] flex flex-col justify-between pt-32 md:pt-48 overflow-hidden bg-white dark:bg-black transition-all duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/images/hero-background-light.png')] dark:bg-[url('/images/hero-background-dark.png')] bg-[length:100%_100%] bg-top bg-no-repeat md:bg-cover md:bg-center opacity-10 dark:opacity-25 pointer-events-none transition-all duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex-1 flex flex-col justify-center">
          <div data-aos="fade-up" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Accepting New Submissions
          </div>
          
          <h1 data-aos="fade-up" data-aos-delay="100" className="text-3xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Expert Evaluation for <br className="hidden md:block"/>
            <span className="text-indigo-600 dark:text-indigo-500">UPSC Answer Copies</span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="200" className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
            Get detailed feedback within 24 hours.
          </p>

          <div data-aos="fade-up" data-aos-delay="300" className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started for Free
            </Link>
          </div>
        </div>

        <div className="relative z-10 w-full">
           <SectionSeparator />
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews">
        <div data-aos="fade-in" data-aos-duration="1000">
          <ReviewCarousel />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose CheckIAS?</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Everything you need to crack the Mains examination.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div data-aos="fade-up" data-aos-delay="100" className="h-full">
              <FeatureCard 
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                iconBg="bg-blue-500"
                title="Expert Review"
                description="Get your copies evaluated by selected candidates and experienced mentors."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="200" className="h-full">
              <FeatureCard 
                icon={<BarChart2 className="w-6 h-6 text-white" />}
                iconBg="bg-teal-500"
                title="Detailed Analytics"
                description="Track your performance with subject-wise analysis and progress graphs."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="300" className="h-full">
              <FeatureCard 
                icon={<Zap className="w-6 h-6 text-white" />}
                iconBg="bg-yellow-500"
                title="Fast Turnaround"
                description="Get your evaluated copies back within 24-48 hours. Guaranteed."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="400" className="h-full">
              <FeatureCard 
                icon={<BookOpen className="w-6 h-6 text-white" />}
                iconBg="bg-indigo-600"
                title="Model Answers"
                description="Access exemplary model answers for every question to identify gaps."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="500" className="h-full">
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-white" />}
                iconBg="bg-purple-600"
                title="1-on-1 Mentorship"
                description="Regular calls with experts to refine your strategy and clear doubts."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="600" className="h-full">
              <FeatureCard 
                icon={<Target className="w-6 h-6 text-white" />}
                iconBg="bg-red-500"
                title="Daily Targets"
                description="Stay disciplined with daily writing challenges and structured milestones."
              />
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white dark:bg-black relative transition-colors duration-200">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 dark:via-purple-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
           <div data-aos="fade-up" className="text-center mb-12 md:mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Transparent Pricing</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Choose the perfect plan for your preparation needs.</p>
          </div>
          
          {/* Mobile Carousel Navigation */}
          <div className="flex md:hidden items-center justify-center gap-4 mb-6">
            <button
              onClick={scrollPrev}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
              aria-label="Previous plan"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">Swipe or use arrows</span>
            <button
              onClick={scrollNext}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
              aria-label="Next plan"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="flex-[0_0_85%] pl-4 min-w-0">
                  <PricingCard 
                    title={plan.title}
                    description={plan.description}
                    price={plan.price}
                    period={plan.period}
                    billingNote={plan.billingNote}
                    buttonText={plan.buttonText}
                    link={plan.link}
                    features={plan.features}
                    isPopular={plan.isPopular}
                    customStyles={plan.isPopular 
                      ? "bg-white dark:bg-gray-900 border-2 border-indigo-500 dark:border-indigo-400 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20"
                      : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 shadow-lg"
                    }
                    buttonStyles={plan.isPopular 
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent"
                      : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`
                  h-1.5 rounded-full transition-all duration-300 
                  ${index === selectedIndex 
                    ? 'w-8 bg-indigo-600 dark:bg-indigo-400' 
                    : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'}
                `}
                aria-label={`Go to plan ${index + 1}`}
              />
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
             {/* Free Plan */}
             <div data-aos="fade-up" data-aos-delay="100" className="h-full">
               <PricingCard 
                title="Free"
                description="Try before you commit."
                price="₹0"
                period="/ lifetime"
                billingNote="No Credit Card Required"
                buttonText="Get Started"
                features={[
                  { text: '2 Submissions (Lifetime)', included: true },
                  { text: 'Basic Feedback', included: true },
                  { text: 'Model Answers', included: false },
                  { text: 'Mentor Call', included: false }
                ]}
              />
             </div>

            {/* Starter Plan */}
            <div data-aos="fade-up" data-aos-delay="200" className="h-full">
              <PricingCard 
                title="Starter"
                description="Great for occasional evaluation."
                price="₹999"
                period="/ month"
                billingNote="Billed Monthly"
                buttonText="Get Started"
                link="/login?plan=starter"
                features={[
                  { text: 'Unlimited Submissions', included: true },
                  { text: 'Basic Feedback', included: true },
                  { text: '24h Turnaround', included: true },
                  { text: '2 calls per month', included: true }
                ]}
              />
            </div>

            {/* Pro Plan (Highlighted) */}
            <div data-aos="fade-up" data-aos-delay="300" className="h-full">
              <PricingCard 
                title="Pro"
                description="For serious aspirants."
                price="₹2,499"
                period="/ 3 months"
                billingNote="Billed Quarterly"
                buttonText="Get Started"
                link="/login?plan=pro"
                isPopular
                features={[
                  { text: 'Unlimited Submissions', included: true },
                  { text: 'Detailed Feedback', included: true },
                  { text: 'Model Answers', included: true },
                  { text: '6 calls per 3 months', included: true }
                ]}
                customStyles="bg-white dark:bg-gray-900 border-2 border-indigo-500 dark:border-indigo-400 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-indigo-300 ring-8 ring-indigo-100 dark:ring-indigo-900/30"
                buttonStyles="bg-indigo-600 text-white hover:bg-indigo-700 border-transparent"
              />
            </div>

            {/* Achiever Plan */}
            <div data-aos="fade-up" data-aos-delay="400" className="h-full">
              <PricingCard 
                title="Achiever"
                description="For rank holders."
                price="₹4,999"
                period="/ 6 months"
                billingNote="Billed Biannually"
                buttonText="Get Started"
                link="/login?plan=achiever"
                features={[
                  { text: 'Unlimited Submissions', included: true },
                  { text: 'Personal Mentor', included: true },
                  { text: 'Daily Targets', included: true },
                  { text: 'Live Evaluation', included: true },
                  { text: '12 calls per 6 months', included: true }
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, iconBg = "bg-indigo-600", title, description }: { icon: React.ReactNode, iconBg?: string, title: string, description: string }) => (
  <div className="group relative p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-black dark:hover:border-indigo-500 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden h-full">
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

const PricingCard = ({ 
  title, 
  description, 
  price, 
  period,
  billingNote, 
  buttonText, 
  link,
  features, 
  isPopular = false,
  customStyles = "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:border-gray-900 dark:hover:border-gray-500",
  buttonStyles = "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
}: any) => (
  <div className={`
    p-8 rounded-[2rem] flex flex-col transition-all duration-500 ease-out transform hover:-translate-y-1 relative overflow-hidden h-full
    ${customStyles}
  `}>
    
    {isPopular && (
      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-bl-xl z-20">
        Most Popular
      </div>
    )}

    <div className="mb-6 relative z-10">
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>

    <div className="mb-6 relative z-10">
      <div className="flex items-baseline">
        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{price}</span>
        <span className="ml-1 text-xs text-gray-400">{period}</span>
      </div>
       <p className="text-[10px] mt-2 text-gray-400">*{billingNote}</p>
    </div>

    <Link to={link || '/login'} className={`
      block w-full py-3 rounded-xl font-semibold text-sm transition-all mb-8 relative z-10 text-center
      ${buttonStyles}
    `}>
      {buttonText}
    </Link>

    <div className="mt-auto relative z-10">
      <p className="text-sm font-medium mb-4 text-gray-900 dark:text-gray-200">What's included:</p>
      <ul className="space-y-3">
        {features.map((feature: any, idx: number) => (
          <li key={idx} className={`flex items-center gap-3 ${!feature.included ? 'opacity-50' : ''}`}>
            {feature.included ? (
              <Check className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            ) : (
              <X className="w-4 h-4 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            )}
            <span className={`text-sm ${feature.included ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default LandingPage;
