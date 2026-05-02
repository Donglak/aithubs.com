import React from 'react';
import { Search, BarChart3, Link, Shield, Zap, Globe } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Search,
      title: 'Program Discovery',
      description: 'Find the best affiliate programs for your niche with our comprehensive database.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track clicks, conversions, and earnings with detailed real-time analytics.'
    },
    {
      icon: Link,
      title: 'Link Management',
      description: 'Create, organize, and optimize your affiliate links in one central dashboard.'
    },
    {
      icon: Shield,
      title: 'Fraud Protection',
      description: 'Advanced security measures to protect your commissions and reputation.'
    },
    {
      icon: Zap,
      title: 'Auto Optimization',
      description: 'AI-powered recommendations to maximize your affiliate marketing performance.'
    },
    {
      icon: Globe,
      title: 'Global Networks',
      description: 'Access to international affiliate programs and global marketing opportunities.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-blue mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-text max-w-2xl mx-auto">
            Powerful tools and features designed to help you maximize your affiliate marketing potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-text leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;