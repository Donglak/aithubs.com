import React from 'react';
import { Play, BarChart3, Users, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-24 pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold text-dark-blue leading-tight mb-6">
              Affiliate Marketing Made Easy
            </h1>
            <p className="text-lg text-gray-text mb-8 leading-relaxed">
              Affitor helps you find, join, and manage affiliate programs all in one place. 
              Streamline your affiliate marketing journey with powerful tools and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105">
                Get Started Free
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2">
                <Play size={20} />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column - Dashboard Illustration */}
          <div className="animate-slide-up">
            <div className="bg-gradient-to-br from-primary/10 to-success/10 rounded-2xl p-8 shadow-card">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark-blue">Dashboard Overview</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-dark-blue">$12.5K</div>
                    <div className="text-sm text-gray-text">Revenue</div>
                  </div>
                  <div className="bg-success/10 p-4 rounded-lg text-center">
                    <Users className="w-8 h-8 text-success mx-auto mb-2" />
                    <div className="text-2xl font-bold text-dark-blue">2,847</div>
                    <div className="text-sm text-gray-text">Clicks</div>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-dark-blue">18.2%</div>
                    <div className="text-sm text-gray-text">Conversion</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-dark-blue font-medium">Amazon Associates</span>
                    <span className="text-success font-semibold">+$2,340</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-dark-blue font-medium">ShareASale</span>
                    <span className="text-success font-semibold">+$1,890</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-dark-blue font-medium">CJ Affiliate</span>
                    <span className="text-success font-semibold">+$1,250</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;