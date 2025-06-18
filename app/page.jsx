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

const HomePage = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLoginClick = () => {
    router.push('/login');
  };

  // School slideshow images
  const schoolImages = [
    {
      src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
      title: "Greenwood Academy Campus",
      description: "Our beautiful main campus building"
    },
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      title: "Modern Classrooms",
      description: "State-of-the-art learning environments"
    },
    {
      src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2332&q=80",
      title: "Science Laboratory",
      description: "Equipped with the latest technology"
    },
    {
      src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      title: "Library & Study Hall",
      description: "Quiet spaces for learning and research"
    },
    {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      title: "Sports Complex",
      description: "Athletic facilities for all students"
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
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-t-4" style={{ borderTopColor: color }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  const StatCard = ({ number, label, color }) => (
    <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="text-3xl font-bold mb-2 text-white">{number}</div>
      <div className="text-white/80">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <School className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fazl-I-Omar Academy</h1>
                <p className="text-sm text-gray-600">Seeking knowledge To Serve Allah</p>
              </div>
            </div>
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              <User className="w-5 h-5" />
              Login
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow */}
      <section className="relative h-screen overflow-hidden">
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
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
          
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {schoolImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome to
              <span className="text-blue-400 block">Fazl-I-Omar Academy</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md max-w-3xl mx-auto">
              Nurturing minds, building futures. A tradition of academic excellence 
              and character development since 2000.
            </p>
            <div className="mb-8">
              <button
                onClick={handleLoginClick}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Access Portal
              </button>
            </div>

            {/* School Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <StatCard number="1,200+" label="Students" />
              <StatCard number="85+" label="Teachers" />
              <StatCard number="40+" label="Classes" />
              <StatCard number="38+" label="Years of Excellence" />
            </div>
          </div>
        </div>

        {/* Current Slide Info */}
        <div className="absolute bottom-20 left-8 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs">
          <h3 className="font-semibold mb-1">{schoolImages[currentSlide].title}</h3>
          <p className="text-sm text-white/80">{schoolImages[currentSlide].description}</p>
        </div>
      </section>

      {/* About School Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About Fazl-I-Omar Academy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              For nearly three decades, Fazl-I-Omar Academy has been a beacon of educational excellence, 
              fostering intellectual growth, character development, and preparing students for success 
              in an ever-changing world.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                To provide a nurturing and challenging educational environment that empowers students 
                to reach their full potential academically, socially, and personally.
              </p>
              <p className="text-gray-600 mb-6">
                We believe in fostering critical thinking, creativity, and strong moral values that 
                will serve our students throughout their lives.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Academic Excellence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Character Development</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Community Engagement</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                alt="Students learning"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* School Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Special
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the unique features and programs that set Fazl-I-Omar Academy apart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the Fazl-I-Omar Family
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover how our school management portal keeps students, teachers, and parents connected
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLoginClick}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-xl"
            >
              Student/Teacher Portal
            </button>
            <button
              className="bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-400 transition-colors duration-200 shadow-xl border-2 border-white/20"
            >
              Schedule a Visit
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <School className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Fazl-I-Omar Academy</h3>
              </div>
              <p className="text-gray-400 max-w-md mb-4">
                Nurturing minds and building futures since 2000. A place where 
                academic excellence meets character development.
              </p>
              <p className="text-gray-400 text-sm">
                "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Admissions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Academic Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News & Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alumni</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Education Lane<br />Greenwood, NY 12345</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@greenwoodacademy.edu</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Fazl-I-Omar Academy. All rights reserved. | Established 2000</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
// "use client"
// import React, { useEffect } from 'react';
// import { useAuth } from './contexts/AuthContext';
// import { useRouter } from 'next/navigation';
// import LoadingSpinner from '../components/LoadingSpinner';

// const HomePage = () => {
//   const { user, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading) {
//       if (!user) {
//         router.push('/login');
//       } else {
//         // Redirect based on user role
//         switch (user.role.toLowerCase()) {
//           case 'admin':
//             router.push('/admin');
//             break;
//           case 'teacher':
//             router.push('/teacher');
//             break;
//           case 'student':
//             router.push('/student');
//             break;
//           default:
//             router.push('/login');
//         }
//       }
//     }
//   }, [user, isLoading, router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" text="Initializing application..." />
//       </div>
//     );
//   }

//   return null;
// };

// export default HomePage;