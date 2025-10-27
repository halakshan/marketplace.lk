import Link from 'next/link';
import { FiTag, FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin, FiYoutube } from 'react-icons/fi';

const CATEGORIES = [
  { name: '🚗 Vehicles',       href: '/ads?category=vehicles' },
  { name: '🏠 Property',       href: '/ads?category=property' },
  { name: '🌳 Land',           href: '/ads?category=land' },
  { name: '📱 Electronics',    href: '/ads?category=electronics' },
  { name: '🛋️ Home & Garden',  href: '/ads?category=home-garden' },
  { name: '🐾 Animals & Pets', href: '/ads?category=animals' },
];

const QUICK_LINKS = [
  ['/', 'Home'],
  ['/ads', 'Browse Ads'],
  ['/post-ad', 'Post Free Ad'],
  ['/my-ads', 'My Ads'],
  ['/login', 'Login / Register'],
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <FiTag className="text-white" size={18} />
              </div>
              <span className="text-white text-xl font-bold">marketplace.lk</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Sri Lanka's free classifieds platform. Buy and sell vehicles, property, electronics & more. Post your ad today — it's 100% free.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors" aria-label="Facebook"><FiFacebook size={15} /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors" aria-label="Instagram"><FiInstagram size={15} /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors" aria-label="Twitter"><FiTwitter size={15} /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors" aria-label="YouTube"><FiYoutube size={15} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORIES.map(({ name, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary-400 transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FiMapPin size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone size={14} className="text-primary-400 flex-shrink-0" />
                <a href="tel:+94112345678" className="hover:text-primary-400 transition-colors">+94 11 234 5678</a>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail size={14} className="text-primary-400 flex-shrink-0" />
                <a href="mailto:support@marketplace.lk" className="hover:text-primary-400 transition-colors">support@marketplace.lk</a>
              </li>
            </ul>

            {/* Post Ad CTA */}
            <Link href="/post-ad"
              className="mt-5 inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              + Post Free Ad
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} marketplace.lk — Sri Lanka's Free Classifieds. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/safety" className="hover:text-gray-300 transition-colors">Safety Tips</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
