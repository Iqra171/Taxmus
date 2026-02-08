import React from 'react';
import { Camera, Upload, MapPin, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sitesData } from '../data/sitesData';

const HomePage = ({ setCurrentPage }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div 
  className="min-h-screen bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3)), url('https://images.unsplash.com/photo-1680464140223-eab28aa2fcdc?auto=format&fit=crop&q=80&w=2071')`
  }}
>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Explore Pakistan's Ancient Civilizations with AI
            </h1>
            <p className="text-xl text-gray-800 mb-8 font-medium">
              Your personal guide to South Asian heritage. Upload artifacts, discover stories, and experience history through cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentPage(user ? 'upload' : 'signup')}
                className="bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-700 transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>Upload an Artifact</span>
              </button>
              <button
                onClick={() => setCurrentPage('sites')}
                className="bg-white text-amber-600 border-2 border-amber-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-50 transition flex items-center justify-center space-x-2 shadow-lg"
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
            {sitesData.map(site => (
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

export default HomePage;