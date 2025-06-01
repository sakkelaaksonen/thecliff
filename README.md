# The Cliff Restaurant Website

A modern restaurant website built with 11ty, Tailwind CSS, and PHP backend for menu management.

## Features

- **Static Site Generation**: Built with 11ty for fast, SEO-friendly pages
- **Dynamic Menu**: PHP-powered admin interface for real-time menu updates
- **Modern Frontend**: ES modules, Tailwind CSS, responsive design
- **Admin Dashboard**: Secure menu management with authentication
- **Development Tools**: Hot reloading, file watching, concurrent dev servers

## Tech Stack

- **Frontend**: 11ty, Tailwind CSS, ES6 modules
- **Backend**: PHP 5.6+ (menu API & admin)
- **Build Tools**: esbuild, Tailwind CLI
- **Development**: Concurrent dev servers, file watchers

## Quick Start

```bash
# Install dependencies
npm install

# Start development (with file watching)
npm run dev

# Build for production
npm run build

# Deploy to server
npm run deploy
```

## Development

- **Frontend**: http://localhost:8081 (11ty dev server)
- **Backend**: http://localhost:8080 (PHP dev server)
- **Admin**: http://localhost:8080/admin/

All development should use port 8081, which provides:
- Live reload for static content
- Proxied access to PHP API and admin
- Single URL for everything

## Project Structure

```
├── src/                 # Source files (11ty, CSS, JS)
├── php-src/            # PHP source files
├── htdocs/             # Built files (deployment target)
├── data/               # Persistent data (menu.json)
└── scripts/            # Build and deployment scripts
```

## Quick Start Scripts

- `npm run dev` - Full development with file watching
- `npm run build` - Production build
- `npm run deploy` - Build and deploy to server

## Admin Setup

1. Create `admin-config.php` with credentials
2. Access `/admin/` to manage menu items
3. Changes reflect immediately on the website

Built for The Cliff Restaurant 🏔️
