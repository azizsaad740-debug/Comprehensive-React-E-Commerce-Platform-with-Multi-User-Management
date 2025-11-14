"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBrandingStore } from '@/stores/brandingStore';
import { useContentStore } from '@/stores/contentStore';

const Footer = () => {
  const { appName, slogan } = useBrandingStore();
  const { contactInfo, staticPages } = useContentStore();

  // Filter pages for Quick Links (e.g., Products, Categories, About)
  const quickLinks = staticPages.filter(p => ['about', 'contact'].includes(p.slug) && p.isActive);
  
  // Filter pages for Customer Service Links
  const customerServiceLinks = staticPages.filter(p => 
    ['shipping', 'returns', 'size-guide', 'care-instructions', 'track-order'].includes(p.slug) && p.isActive
  );

  return (
    <footer className="bg-gray-900 text-white dark:bg-card-foreground dark:text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Responsive Grid: 2 columns on mobile, 4 columns on medium/large */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Company Info (Full width on mobile) */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-xl font-bold">{appName}</h3>
            <p className="text-gray-300 text-sm dark:text-muted-foreground">
              {slogan}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white dark:text-muted-foreground dark:hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white dark:text-muted-foreground dark:hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white dark:text-muted-foreground dark:hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links (1/2 width on mobile) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                  Categories
                </Link>
              </li>
              {quickLinks.map(page => (
                <li key={page.slug}>
                  <Link to={`/${page.slug}`} className="text-gray-300 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                    {page.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service (1/2 width on mobile) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              {customerServiceLinks.map(page => (
                <li key={page.slug}>
                  <Link to={`/${page.slug}`} className="text-gray-300 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (Full width on mobile, spans 2 columns) */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                <span className="text-gray-300 dark:text-muted-foreground">{contactInfo.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                <span className="text-gray-300 dark:text-muted-foreground">{contactInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                <span className="text-gray-300 dark:text-muted-foreground">{contactInfo.email}</span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Stay Updated</h5>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 dark:bg-background dark:border-border dark:text-foreground"
                />
                <Button size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 dark:border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400 dark:text-muted-foreground">
              © 2024 {appName}. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors dark:text-muted-foreground dark:hover:text-foreground">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;