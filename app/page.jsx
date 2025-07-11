"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  ChevronRight,
  School,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import Image from 'next/image';

const HomePage = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLoginClick = () => {
    router.push('/login');
  };

  // School slideshow images
  const schoolImages = [
    {
      src: "/images/students.jpg",
      title: "Fazl-I-Omar Academy Students",
      description: "Students on main campus building"
    },
    // {
    //   src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    //   title: "Modern Classrooms",
    //   description: "State-of-the-art learning environments"
    // },
    {
      src: "/images/computer-lab.jpeg",
      title: "Computer Laboratory",
      description: "Equipped with the best technology for digital learning"
    },
    // {
    //   src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    //   title: "Library & Study Hall",
    //   description: "Quiet spaces for learning and research"
    // },
    {
      src: "/images/sports.jpg",
      title: "Sports",
      description: "Students during sport events"
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % schoolImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [schoolImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % schoolImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + schoolImages.length) % schoolImages.length);
  };

  const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-t-4" style={{ borderTopColor: color }}>
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 rounded-full flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  );

  const StatCard = ({ number, label, color }) => (
    <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4">
      <div className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">{number}</div>
      <div className="text-white/80 text-xs sm:text-sm md:text-base">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/images/logo.png" 
                alt="Fazl-I-Omar Academy Logo" 
                width={32} 
                height={32} 
                className="mr-2 rounded"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Fazl-I-Omar Academy</h1>
                <p className="text-xs sm:text-sm text-gray-600">Seeking knowledge To Serve Allah</p>
              </div>
            </div>
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg text-sm sm:text-base"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Login</span>
              <span className="xs:hidden">Portal</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow */}
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-screen overflow-hidden">
        {/* Slideshow Container */}
        <div className="relative w-full h-full">
          {schoolImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover object-center"
                style={{ minHeight: '100%', minWidth: '100%' }}
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
          
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2">
            {schoolImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
              Welcome to
              <span className="text-blue-400 block">Fazl-I-Omar Academy</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/90 mb-4 sm:mb-6 md:mb-8 drop-shadow-md max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
              Nurturing minds, building futures. A tradition of academic excellence 
              and character development since 2000.
            </p>
            <div className="mb-4 sm:mb-6 md:mb-8">
              <button
                onClick={handleLoginClick}
                className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl text-sm sm:text-base md:text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Access Portal
              </button>
            </div>

            {/* School Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
              <StatCard number="1,200+" label="Students" />
              <StatCard number="85+" label="Teachers" />
              <StatCard number="40+" label="Classes" />
              <StatCard number="38+" label="Years of Excellence" />
            </div>
          </div>
        </div>

        {/* Current Slide Info */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-20 md:left-8 bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-lg max-w-[200px] sm:max-w-[280px] md:max-w-xs">
          <h3 className="font-semibold mb-1 text-xs sm:text-sm md:text-base leading-tight">{schoolImages[currentSlide].title}</h3>
          <p className="text-xs sm:text-sm text-white/80 leading-tight">{schoolImages[currentSlide].description}</p>
        </div>
      </section>

      {/* About School Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              About Fazl-I-Omar Academy
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
              For nearly three decades, Fazl-I-Omar Academy has been a beacon of educational excellence, 
              fostering intellectual growth, character development, and preparing students for success 
              in an ever-changing world.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Our Mission</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                To provide a nurturing and challenging educational environment that empowers students 
                to reach their full potential academically, socially, and personally.
              </p>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                We believe in fostering critical thinking, creativity, and strong moral values that 
                will serve our students throughout their lives.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Academic Excellence</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Character Development</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Community Engagement</span>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <Image
                src="/images/flyer.jpg" 
                alt="Students learning"
                width={200} 
                height={300} 
                className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* School Features */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Special
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
              Discover the unique features and programs that set Fazl-I-Omar Academy apart
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Advanced Curriculum"
              description="Comprehensive academic programs including AP courses, STEM initiatives, and arts education"
              color="#3B82F6"
            />
            <FeatureCard
              icon={Users}
              title="Small Class Sizes"
              description="Average class size of 18 students ensures personalized attention and meaningful interaction"
              color="#10B981"
            />
            <FeatureCard
              icon={Award}
              title="Award-Winning Faculty"
              description="Highly qualified teachers with advanced degrees and a passion for education"
              color="#F59E0B"
            />
            <FeatureCard
              icon={GraduationCap}
              title="College Preparation"
              description="98% college acceptance rate with dedicated counseling and SAT/ACT preparation"
              color="#8B5CF6"
            />
            <FeatureCard
              icon={FileText}
              title="Extracurricular Activities"
              description="Over 30 clubs and organizations including debate team, robotics, and community service"
              color="#EF4444"
            />
            <FeatureCard
              icon={Calendar}
              title="Modern Facilities"
              description="State-of-the-art classrooms, science labs, library, gymnasium, and arts center"
              color="#06B6D4"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Join the Fazl-I-Omar Family
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed">
            Discover how our school management portal keeps students, teachers, and parents connected
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleLoginClick}
              className="w-full sm:w-auto bg-white text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-xl"
            >
              <span className="hidden sm:inline">Student/Teacher Portal</span>
              <span className="sm:hidden">Portal Access</span>
            </button>
            <button
              className="w-full sm:w-auto bg-blue-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-400 transition-colors duration-200 shadow-xl border-2 border-white/20"
            >
              Schedule a Visit
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Image 
                  src="/images/logo-bg-black.jpg" 
                  alt="Fazl-I-Omar Academy Logo" 
                  width={32} 
                  height={32} 
                  className="mr-2 rounded"
                />
                <h3 className="text-lg sm:text-xl font-bold">Fazl-I-Omar Academy</h3>
              </div>
              <p className="text-gray-400 max-w-md mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                Nurturing minds and building futures since 2000. A place where 
                academic excellence meets character development.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm italic">
                "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Admissions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Academic Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News & Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alumni</a></li>
              </ul>
            </div>
            <div className="mt-4 sm:mt-0">
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Contact Us</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">123 Ogunbowale Street<br />Ilasamaja, Lagos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="break-all">info@fazl-i-omaracademy.edu</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 Fazl-I-Omar Academy. All rights reserved. | Established 2000</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;