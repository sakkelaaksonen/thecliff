# The Cliff - Music Bar Website

A modern, responsive static website for The Cliff music bar located in Kallio, Helsinki. Built with vanilla HTML, CSS, and JavaScript using Tailwind CSS for styling.

## 🎯 Project Overview

**Site Name:** The Cliff  
**Type:** Music Bar Website  
**Location:** Toinen Linja 7, 00530 Helsinki, Finland  
**Design:** muchmodedesign  

## 🛠 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS with custom theme
- **Build:** Custom build script with Tailwind CLI
- **Hosting:** Static hosting in local hosting company with apache and FTP
- **Domain:** Custom domain with HTTPS redirect

## 📁 Project Structure

The build process:
1. Processes Tailwind CSS with custom theme
2. Applies PostCSS transformations
3. Outputs optimized `main.css`

## 🔧 JavaScript Modules

### HTTPSRedirect
- Automatic HTTPS redirect on production domain
- Secure URL validation and error handling

### VideoControl
- Background video sound toggle functionality
- Accessible button states and icons

### Navigation
- Smooth scrolling between sections
- Auto-hide navigation on hero section
- Section highlighting based on scroll position
- Contact section integration

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `md` (768px+), `lg` (1024px+)
- Touch-friendly interface elements
- Optimized video playback for mobile

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast mode compatibility
- Reduced motion preferences
- Screen reader optimizations

## 🔍 SEO Optimization

- Structured data (LD+JSON) for local business
- Open Graph and Twitter Card meta tags
- Semantic HTML with proper headings
- Google Maps integration for local SEO
- Optimized meta descriptions and keywords

## 🌐 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers
- Fallback image for video background
- Print stylesheet included

## 📄 Server Configuration

### Apache (.htaccess)
- HTTPS enforcement
- Security headers
- Caching optimization
- Compression settings

### SEO (robots.txt)
- Search engine crawler guidance
- Sitemap reference

## 🚀 Deployment

Optimized for static hosting platforms:
- **Static.app** - Recommended
- **Kinsta** - WordPress hosting alternative
- **Cloudflare Pages** - CDN integration

## 📋 Development Guidelines

- JSDoc documentation for all functions
- Modular JavaScript architecture
- Component-based CSS with Tailwind
- Accessibility-first development
- Performance optimization focus

## 🎯 Performance Features

- Optimized video compression
- Efficient CSS with Tailwind purging
- Minimal JavaScript footprint
- Lazy loading considerations
- CDN-ready asset structure