import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            "To create an account, click the 'Register' button on the homepage, fill in your details, and verify your email address. Students can register directly, while instructor accounts are created by administrators.",
        },
        {
          question: "How do I enroll in a course?",
          answer:
            "Browse available courses, click on a course you're interested in, and click the 'Enroll Now' button. Some courses may be free while others require payment.",
        },
        {
          question: "Can I access courses on mobile devices?",
          answer:
            "Yes! EduFlow is fully responsive and works on all devices including smartphones, tablets, and desktop computers.",
        },
      ],
    },
    {
      title: "Courses & Learning",
      faqs: [
        {
          question: "How do I track my progress?",
          answer:
            "Your progress is automatically tracked as you complete course materials. You can view your overall progress on your dashboard and detailed progress within each course.",
        },
        {
          question: "Can I download course materials?",
          answer:
            "Some course materials may be available for download, depending on the instructor's settings. Look for download buttons next to materials that can be saved offline.",
        },
        {
          question: "How do I submit assignments?",
          answer:
            "Navigate to the assignment page, read the instructions carefully, and use the submission form to upload your work or enter text responses as required.",
        },
      ],
    },
    {
      title: "Technical Issues",
      faqs: [
        {
          question: "I'm having trouble logging in",
          answer:
            "Make sure you're using the correct email and password. If you've forgotten your password, use the 'Forgot Password' link. Clear your browser cache if issues persist.",
        },
        {
          question: "Videos won't play",
          answer:
            "Ensure you have a stable internet connection and try refreshing the page. Make sure your browser supports HTML5 video playback and consider updating your browser.",
        },
        {
          question: "I can't upload files",
          answer:
            "Check that your file meets the size and format requirements. Supported formats vary by assignment. If problems persist, try using a different browser.",
        },
      ],
    },
    {
      title: "Account & Billing",
      faqs: [
        {
          question: "How do I update my profile?",
          answer:
            "Go to your Profile page from the main navigation menu, click 'Edit Profile', make your changes, and save them.",
        },
        {
          question: "How do I change my password?",
          answer:
            "Visit your Profile page, scroll down to the Account Security section, and click 'Change Password' to update your credentials.",
        },
        {
          question: "Can I get a refund?",
          answer:
            "Refund policies vary by course and instructor. Please contact support with your specific situation for assistance with refund requests.",
        },
      ],
    },
  ];

  const quickLinks = [
    { title: "Student Guide", description: "Complete guide for students" },
    { title: "Instructor Guide", description: "Resources for instructors" },
    { title: "System Requirements", description: "Technical requirements" },
    { title: "Accessibility", description: "Accessibility features" },
  ];

  const filteredFAQs = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  const toggleFAQ = (categoryIndex, faqIndex) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setExpandedFAQ(expandedFAQ === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions and get the help you need
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Links */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {link.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>

              {filteredFAQs.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="bg-white rounded-lg shadow-sm"
                >
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {category.title}
                    </h3>
                  </div>
                  <div className="divide-y">
                    {category.faqs.map((faq, faqIndex) => {
                      const isExpanded =
                        expandedFAQ === `${categoryIndex}-${faqIndex}`;
                      return (
                        <div key={faqIndex} className="p-6">
                          <button
                            onClick={() => toggleFAQ(categoryIndex, faqIndex)}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <span className="font-medium text-gray-900 pr-4">
                              {faq.question}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="mt-4 text-gray-700">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {searchQuery && filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try different keywords or contact support
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need More Help?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@eduflow.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 btn btn-primary">
                Contact Support
              </button>
            </div>

            {/* Popular Articles */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Articles
              </h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  How to reset your password
                </a>
                <a
                  href="#"
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  Understanding course certificates
                </a>
                <a
                  href="#"
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  Troubleshooting video playback
                </a>
                <a
                  href="#"
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  Managing your notifications
                </a>
                <a
                  href="#"
                  className="block text-sm text-primary-600 hover:text-primary-700"
                >
                  Course completion requirements
                </a>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Status
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  All systems operational
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: 2 minutes ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
