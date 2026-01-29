import {
  ArrowLeft,
  Users,
  Target,
  Award,
  BookOpen,
  Globe,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Students", value: "10,000+", icon: Users },
    { label: "Expert Instructors", value: "500+", icon: Target },
    { label: "Courses Available", value: "1,200+", icon: BookOpen },
    { label: "Countries Served", value: "50+", icon: Globe },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former education technology executive with 15+ years of experience in online learning.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Technology leader specializing in scalable learning platforms and educational software.",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Education",
      bio: "PhD in Educational Psychology with expertise in curriculum design and learning outcomes.",
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Product strategist focused on creating intuitive and engaging learning experiences.",
    },
  ];

  const values = [
    {
      icon: BookOpen,
      title: "Quality Education",
      description:
        "We believe everyone deserves access to high-quality, engaging educational content that transforms lives.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "Learning is better together. We foster a supportive community where students and instructors thrive.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "We continuously innovate to create the most effective and enjoyable learning experiences possible.",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description:
        "Education should be accessible to all. We work to remove barriers and create inclusive learning environments.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About EduFlow
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're on a mission to democratize education by making high-quality
            learning accessible to everyone, everywhere. Our platform connects
            passionate instructors with eager learners around the world.
          </p>
          <div className="w-24 h-1 bg-primary-600 mx-auto"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6">
                EduFlow was born from a simple observation: traditional
                education wasn't keeping pace with the rapidly changing world.
                In 2020, our founders recognized that learners needed more
                flexible, accessible, and engaging ways to acquire new skills
                and knowledge.
              </p>
              <p className="mb-6">
                What started as a small team of educators and technologists has
                grown into a global platform serving thousands of learners
                worldwide. We've maintained our core belief that education
                should be personalized, interactive, and available to anyone
                with the desire to learn.
              </p>
              <p>
                Today, EduFlow continues to evolve, incorporating the latest in
                educational technology while never losing sight of our
                human-centered approach to learning. We're not just building a
                platform; we're building a community of lifelong learners.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 text-center"
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 text-sm font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-primary-50 rounded-lg p-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              To empower individuals and organizations with the knowledge and
              skills they need to succeed in an ever-changing world through
              innovative, accessible, and engaging online education.
            </p>
            <div className="flex items-center justify-center">
              <Award className="h-8 w-8 text-primary-600 mr-3" />
              <span className="text-lg font-medium text-gray-900">
                Transforming lives through education, one learner at a time.
              </span>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want to Learn More?
          </h2>
          <p className="text-gray-600 mb-6">
            We'd love to hear from you. Whether you're a potential student,
            instructor, or partner, we're here to answer your questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="btn btn-primary"
            >
              Contact Us
            </button>
            <button
              onClick={() => navigate("/help")}
              className="btn btn-outline"
            >
              Visit Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
