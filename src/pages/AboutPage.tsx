import React from 'react';
import { Target, Users, Award, TrendingUp, Mail, Linkedin, Twitter } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '450+', label: 'Tools Reviewed' },
    { number: '50K+', label: 'Happy Users' },
    { number: '98%', label: 'Success Rate' },
    { number: '$2M+', label: 'Saved by Users' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Former marketing director with 10+ years experience in digital tools and automation.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'sarah@digitaltoolshub.com'
      }
    },
    {
      name: 'Mike Chen',
      role: 'Head of Research',
      bio: 'Tech enthusiast and former software engineer specializing in AI and automation tools.',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'mike@digitaltoolshub.com'
      }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Director',
      bio: 'Content strategist and affiliate marketing expert with a passion for helping others succeed online.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'emily@digitaltoolshub.com'
      }
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Transparency',
      description: 'We provide honest, unbiased reviews and clearly disclose all affiliate relationships.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Our users\' success is our priority. We build tools and content that truly help people achieve their goals.'
    },
    {
      icon: Award,
      title: 'Quality Standards',
      description: 'We rigorously test and evaluate every tool before recommending it to our community.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Innovation',
      description: 'We stay ahead of digital trends to bring you the latest and most effective tools.'
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About DigitalToolsHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            We're on a mission to help entrepreneurs, creators, and businesses discover the best digital tools 
            to boost productivity, increase revenue, and achieve their goals faster.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              DigitalToolsHub was born from a simple frustration: the overwhelming number of digital tools available 
              today makes it nearly impossible to know which ones actually work and which ones are worth your investment.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              As entrepreneurs and digital marketers ourselves, we spent countless hours and thousands of dollars 
              testing tools that promised the world but delivered little. We realized there had to be a better way 
              to help people navigate the digital tools landscape.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              That's when we decided to create DigitalToolsHub - a platform where real experts test, review, and 
              recommend only the tools that truly make a difference. Every tool in our directory has been personally 
              tested by our team, and every review is based on real-world usage and results.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Today, we're proud to have helped over 50,000 users discover tools that have collectively saved them 
              millions of dollars and countless hours. But we're just getting started - our mission is to become 
              the most trusted resource for digital tool recommendations worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The experts behind DigitalToolsHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-soft p-8 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {member.bio}
                </p>
                
                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  <a
                    href={member.social.linkedin}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={member.social.twitter}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={`mailto:${member.social.email}`}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Discover Your Next Favorite Tool?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of entrepreneurs and creators who trust DigitalToolsHub for their tool recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/tools"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Explore Tools
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;