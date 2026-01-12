import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';
import { Camera, Upload, MapPin, Clock, Sparkles, Menu, X, ChevronRight, Star, Lock, User, LogOut, History } from 'lucide-react';
import { curateImage } from "./api/curatorApi"; 
import CuratorResult from './components/CuratorResult'; // Adjust the path based on your file structure
// Mock Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an active session when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for login/logout changes automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password }); //
    if (error) alert(error.message);
  };

  const signup = async (name, email, password) => {
    // 1. Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
    email,
    password
    });

    if (error) {
    alert(error.message);
    return;
    }

    // 2. If signup worked, manually create the profile row
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id, // Links the profile to the Auth user ID
            full_name: name,
            email: email,
            is_premium: false,
            uploads_today: 0
          }
        ]);

        if (profileError) {
          console.error("Error creating profile:", profileError.message);
        } else {
          alert("Check your email for a confirmation link!");
          setCurrentPage('login');
        }
      }
    };


  const logout = async () => {
    await supabase.auth.signOut(); //
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Navigation Component
const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HeritageAI</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-amber-600 transition">Home</button>
            <button onClick={() => setCurrentPage('sites')} className="text-gray-700 hover:text-amber-600 transition">Heritage Sites</button>
            {user && (
              <button onClick={() => setCurrentPage('upload')} className="text-gray-700 hover:text-amber-600 transition">Upload Artifact</button>
            )}
            <button onClick={() => setCurrentPage('about')} className="text-gray-700 hover:text-amber-600 transition">About</button>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button onClick={() => setCurrentPage('profile')} className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </button>
                <button onClick={logout} className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-amber-600 transition">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setCurrentPage('login')} className="text-gray-700 hover:text-amber-600 transition">Login</button>
                <button onClick={() => setCurrentPage('signup')} className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition">Sign Up</button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">Home</button>
            <button onClick={() => { setCurrentPage('sites'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">Heritage Sites</button>
            {user && (
              <button onClick={() => { setCurrentPage('upload'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">Upload Artifact</button>
            )}
            <button onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">About</button>
            {user ? (
              <>
                <button onClick={() => { setCurrentPage('profile'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">Profile</button>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { setCurrentPage('login'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-600">Login</button>
                <button onClick={() => { setCurrentPage('signup'); setMobileMenuOpen(false); }} className="block w-full text-left bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">Sign Up</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Home Page
const HomePage = ({ setCurrentPage }) => {
  const { user } = useAuth();

  const sites = [
    {
      id: 'taxila',
      name: 'Taxila',
      description: 'Ancient Buddhist city and UNESCO World Heritage Site',
      image: 'https://unsplash.com/photos/a-very-old-city-with-a-lot-of-ruins-khWqt4JYej4',
      era: '6th Century BCE'
    },
    {
      id: 'mohenjo-daro',
      name: 'Mohenjo-daro',
      description: 'One of the world\'s earliest urban settlements',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      era: '2500 BCE'
    },
    {
      id: 'harappa',
      name: 'Harappa',
      description: 'Major center of the Indus Valley Civilization',
      image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800',
      era: '3300 BCE'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Explore Pakistan's Ancient Civilizations with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your personal guide to South Asian heritage. Upload artifacts, discover stories, and experience history through cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentPage(user ? 'upload' : 'signup')}
                className="bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-700 transition flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Upload an Artifact</span>
              </button>
              <button
                onClick={() => setCurrentPage('sites')}
                className="bg-white text-amber-600 border-2 border-amber-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-50 transition flex items-center justify-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>Explore Sites</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          How HeritageAI Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Upload Your Photo</h3>
            <p className="text-gray-600">Take or upload a photo of any artifact you encounter at heritage sites</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
            <p className="text-gray-600">Our AI identifies the civilization, era, and cultural significance instantly</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Discover Stories</h3>
            <p className="text-gray-600">Get detailed historical context and fascinating facts about each piece</p>
          </div>
        </div>
      </div>

      {/* Heritage Sites */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Featured Heritage Sites
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {sites.map(site => (
              <div key={site.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer" onClick={() => setCurrentPage(`site-${site.id}`)}>
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{site.name}</h3>
                    <span className="text-sm text-amber-600 font-semibold">{site.era}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{site.description}</p>
                  <button className="text-amber-600 font-semibold flex items-center space-x-1 hover:text-amber-700">
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl text-amber-50 mb-8">
            Join thousands discovering Pakistan's rich cultural heritage
          </p>
          <button
            onClick={() => setCurrentPage(user ? 'upload' : 'signup')}
            className="bg-white text-amber-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Page
const LoginPage = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to continue exploring</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
            Sign In
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button onClick={() => setCurrentPage('signup')} className="text-amber-600 font-semibold hover:text-amber-700">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

// Signup Page
const SignupPage = ({ setCurrentPage }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(name, email, password);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Start your heritage exploration journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
            Create Account
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button onClick={() => setCurrentPage('login')} className="text-amber-600 font-semibold hover:text-amber-700">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
// Upload Artifact Page
const UploadPage = ({ setCurrentPage }) => {
  console.log("UploadPage rendering"); // Debug rendering
  
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Log when result changes
  useEffect(() => {
    console.log("Result state changed:", result);
  }, [result]);

  const canUpload = user?.isPremium || (user?.uploadsToday || 0) < 3;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
      if (!file || !user) return;
      setLoading(true);

      // Simulate AI response (Replace this part later with your actual AI API call)
      setTimeout(async () => {
        const resultData = {
          user_id: user.id, // Links the artifact to the logged-in user
          civilization: 'Gandhara',
          era: '1st-5th Century CE',
          story: 'This artifact represents the Gandhara school of Buddhist art...',
          confidence: 0.87
        };

        // SAVE TO SUPABASE
        const { error } = await supabase.from('artifacts').insert([resultData]);

        if (error) {
          console.error("Error saving to DB:", error.message);
        } else {
          setResult(resultData);
        }
        setLoading(false);
      }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to upload and analyze artifacts</p>
          <button onClick={() => setCurrentPage('login')} className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Artifact</h1>
          <p className="text-xl text-gray-600">Discover the story behind your artifact</p>
          {!user.isPremium && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg">
              <span className="font-semibold">{3 - (user.uploadsToday || 0)} uploads remaining today</span>
              <button onClick={() => setCurrentPage('profile')} className="text-amber-600 hover:text-amber-700 underline">
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {!preview ? (
            <label className="block cursor-pointer">
              <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-amber-500 transition">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload an image</h3>
                <p className="text-gray-600 mb-4">PNG, JPG up to 10MB</p>
                <span className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold inline-block hover:bg-amber-700 transition">
                  Choose File  
                </span>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={!canUpload} />
            </label>
          ) : (
            <div>
              <div className="mb-6">
                <img src={preview} alt="Preview" className="w-full h-96 object-contain rounded-lg bg-gray-100" />
              </div>
              {!result && (
                <div className="flex gap-4">
                  <button onClick={handleAnalyze} disabled={loading} className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50">
                    {loading ? 'Analyzing...' : 'Analyze Artifact'}
                  </button>
                  <button onClick={() => { setFile(null); setPreview(null); }} className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">AI is analyzing your artifact...</p>
            </div>
          )}

         {result && (
  <div>
    {/* Use the error-handled rendering function */}
    {renderResult()}
    
    <div className="flex gap-4 mt-6">
      <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
        Analyze Another
      </button>
      <button onClick={() => setCurrentPage('profile')} className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
        View History
      </button>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};


// Heritage Sites List
const SitesPage = ({ setCurrentPage }) => {
  const sites = [
    { id: 'taxila', name: 'Taxila', description: 'Ancient Buddhist city and UNESCO World Heritage Site', era: '6th Century BCE', image: 'https://plus.unsplash.com/premium_photo-1694475128245-999b1ae8a44e?w=800' },
    { id: 'mohenjo-daro', name: 'Mohenjo-daro', description: 'One of the world\'s earliest urban settlements', era: '2500 BCE', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mohenjodaro_-_view_of_the_stupa_mound.JPG/1280px-Mohenjodaro_-_view_of_the_stupa_mound.JPG?w=800' },
    { id: 'harappa', name: 'Harappa', description: 'Major center of the Indus Valley Civilization', era: '3300 BCE', image: 'https://www.worldatlas.com/r/w960-q80/upload/a8/04/4d/shutterstock-1075655459.jpg?w=800' },
    { id: 'katas-raj', name: 'Katas Raj Temples', description: 'Ancient complex of Hindu temples connected by a sacred pond', era: '7th Century CE', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Katas_Raj_Temples_2.JPG/1280px-Katas_Raj_Temples_2.JPG?w=800' },
    { id: 'makli', name: 'Makli Necropolis', description: 'One of the largest funerary sites in the world with stunning stone carvings', era: '14th Century CE', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/View_of_Makli_by_Usman_Ghani_%28cropped%29.jpg?w=800' },
    { id: 'ranikot', name: 'Ranikot Fort', description: 'Known as the Great Wall of Sindh, the largest fort in the world', era: '17th Century CE', image: 'https://en.wikipedia.org/wiki/Ranikot_Fort#/media/File:Ranikot_Fort_-_The_Great_Wall_of_Sindh.jpg?w=800' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Heritage Sites</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">Explore Pakistan's ancient civilizations</p>

        <div className="grid md:grid-cols-3 gap-8">
          {sites.map(site => (
            <div key={site.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer" onClick={() => setCurrentPage(`site-${site.id}`)}>
              <div className="h-64 bg-gray-200 overflow-hidden">
                <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">{site.name}</h2>
                  <span className="text-sm text-amber-600 font-semibold">{site.era}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{site.description}</p>
                <button className="text-amber-600 font-semibold flex items-center space-x-1 hover:text-amber-700">
                  <span>Explore Site</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// Individual Site Page
const SitePage = ({ siteId, setCurrentPage }) => {
  const siteData = {
    'taxila': {
      name: 'Taxila',
      era: '6th Century BCE - 5th Century CE',
      location: 'Punjab, Pakistan',
      description: 'Taxila is one of the most important archaeological sites in Pakistan and a UNESCO World Heritage Site. It was an ancient center of learning, Buddhism, and trade.',
      history: 'Founded in the 6th century BCE, Taxila flourished as a major city of the ancient world for nearly 1,000 years. It was conquered by Alexander the Great in 326 BCE and later became a center of Buddhist learning under the Mauryan Empire. The city was renowned for its university, which attracted scholars from across Asia.',
      significance: 'Taxila represents the meeting point of various civilizations including Persian, Greek, Central Asian, and Indian cultures. Its ruins reveal sophisticated urban planning, Buddhist monasteries, stupas, and Greco-Buddhist art.',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26553.447273486824!2d72.78259707431642!3d33.74870367374368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbf8e6f4e7f25%3A0x2c3c5e9c5e4c5f25!2sTaxila%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200'
    },
    'mohenjo-daro': {
      name: 'Mohenjo-daro',
      era: '2500-1900 BCE',
      location: 'Sindh, Pakistan',
      description: 'Mohenjo-daro was one of the largest cities of the ancient Indus Valley Civilization and is considered one of the world\'s earliest major urban settlements.',
      history: 'Built around 2500 BCE, Mohenjo-daro was a sophisticated city with advanced urban planning, including a grid layout, covered drainage systems, and multi-story buildings. The city was mysteriously abandoned around 1900 BCE, possibly due to climate change or shifts in river patterns.',
      significance: 'The site reveals remarkable achievements in urban planning, sanitation, and architecture. Artifacts found here, including the famous "Dancing Girl" bronze sculpture and numerous seals, provide insights into one of the world\'s oldest civilizations.',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7056.123456789012!2d68.13!3d27.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c8df0f0f0f0f0%3A0x1234567890abcdef!2sMohenjo-daro%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
    },
    'harappa': {
      name: 'Harappa',
      era: '3300-1300 BCE',
      location: 'Punjab, Pakistan',
      description: 'Harappa was a major urban center of the Indus Valley Civilization and gives the Harappan Civilization its name.',
      history: 'Harappa was one of the first cities to be discovered of the Indus Valley Civilization. The city shows evidence of advanced planning with a citadel, lower town, and sophisticated drainage systems. It was a major trading hub with connections extending to Mesopotamia and Central Asia.',
      significance: 'Harappa provides crucial evidence of early urbanization in South Asia. The site has yielded thousands of artifacts including seals, pottery, and tools that demonstrate the sophistication of Bronze Age civilization in the region.',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6789.123456789012!2d72.86!3d30.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393e8f0f0f0f0f0f%3A0xabcdef1234567890!2sHarappa%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s',
      image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200'
    }
  };

  const site = siteData[siteId];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 bg-gray-900">
        <img src={site.image} alt={site.name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{site.name}</h1>
            <p className="text-2xl">{site.era}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-2 text-gray-600 mb-6">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{site.location}</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-lg text-gray-700 mb-8">{site.description}</p>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">History</h2>
          <p className="text-lg text-gray-700 mb-8">{site.history}</p>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Significance</h2>
          <p className="text-lg text-gray-700 mb-8">{site.significance}</p>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">AR Experience Coming Soon</h3>
                <p className="text-amber-800">Experience {site.name} in augmented reality. Walk through ancient streets, see reconstructed buildings, and interact with artifacts in their original context.</p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="rounded-lg overflow-hidden h-96 mb-8">
            <iframe
              src={site.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          <button onClick={() => setCurrentPage('sites')} className="text-amber-600 font-semibold flex items-center space-x-2 hover:text-amber-700">
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back to All Sites</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real history from Supabase
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  // Use metadata name for real Supabase users
  const displayName = user?.user_metadata?.full_name || "Heritage Explorer";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {displayName[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Account Type</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-bold text-gray-900">
                    {user?.is_premium ? 'Premium' : 'Free'}
                  </p>
                  {!user?.is_premium && <Star className="w-5 h-5 text-gray-400" />}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Uploads Today</p>
                <p className="text-lg font-bold text-gray-900">
                  {user?.uploads_today || 0} / {user?.is_premium ? '∞' : '3'}
                </p>
              </div>
            </div>

            {!user?.is_premium && (
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white mb-8">
                <div className="flex items-start space-x-4">
                  <Star className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
                    <button className="bg-white text-amber-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload History Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload History</h2>
            <History className="w-6 h-6 text-gray-400" />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.civilization}</h4>
                      <p className="text-sm text-gray-500">{item.era}</p>
                    </div>
                  </div>
                  <button className="text-amber-600 hover:text-amber-700">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No uploads yet</p>
              <button
                onClick={() => setCurrentPage('upload')}
                className="text-amber-600 font-semibold hover:text-amber-700"
              >
                Upload Your First Artifact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// About Page
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About HeritageAI</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-6">
            HeritageAI is dedicated to making South Asian cultural heritage accessible to everyone. We combine cutting-edge artificial intelligence with rich historical knowledge to create immersive, educational experiences that bring ancient civilizations to life.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why HeritageAI?</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700"><strong>Built for South Asia:</strong> Specialized knowledge of Pakistani and regional heritage sites</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700"><strong>AI-Powered:</strong> Instant artifact identification and historical context</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700"><strong>Accessible:</strong> Affordable pricing and free tier for students and educators</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700"><strong>Future-Ready:</strong> AR capabilities coming soon for immersive experiences</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology</h2>
          <p className="text-lg text-gray-700">
            Our platform uses advanced computer vision and natural language processing to analyze artifacts and generate rich historical narratives. We've trained our models on extensive datasets of South Asian archaeological artifacts, ensuring accurate and culturally relevant information.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize from URL hash or default to 'home'
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  });
  const { loading } = useAuth();

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const hash = window.location.hash.slice(1);
      setCurrentPage(hash || 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    if (window.location.hash.slice(1) !== currentPage) {
      window.history.pushState(null, '', `#${currentPage}`);
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  const renderPage = () => {
    if (currentPage === 'home') return <HomePage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'login') return <LoginPage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'signup') return <SignupPage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'upload') return <UploadPage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'sites') return <SitesPage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'profile') return <ProfilePage setCurrentPage={setCurrentPage} />;
    if (currentPage === 'about') return <AboutPage />;
    if (currentPage.startsWith('site-')) {
      const siteId = currentPage.replace('site-', '');
      return <SitePage siteId={siteId} setCurrentPage={setCurrentPage} />;
    }
    return <HomePage setCurrentPage={setCurrentPage} />;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">HeritageAI</span>
              </div>
              <p className="text-gray-400">Exploring South Asian heritage through AI technology</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setCurrentPage('upload')} className="hover:text-white">Upload Artifact</button></li>
                <li><button onClick={() => setCurrentPage('sites')} className="hover:text-white">Heritage Sites</button></li>
                <li><button className="hover:text-white">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setCurrentPage('about')} className="hover:text-white">About</button></li>
                <li><button className="hover:text-white">Blog</button></li>
                <li><button className="hover:text-white">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">Privacy Policy</button></li>
                <li><button className="hover:text-white">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 HeritageAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Root Component
export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}