# swims.cc - Bio Page Builder

A modern, feature-rich bio page builder with Discord integration, premium features, and advanced customization options.

## ✨ Features

### 🎨 **Core Functionality**
- **Profile Creation**: Create beautiful bio pages with custom usernames
- **Social Media Integration**: Add unlimited social media links
- **Music Integration**: Spotify and custom audio player support
- **Badge System**: Display achievements and status badges
- **Responsive Design**: Mobile-first, modern UI design

### 🌟 **Premium Features**
- **Advanced Styling**: Custom card effects, glow, and animations
- **Typography Customization**: Font families, sizes, and colors
- **Reveal Pages**: Create exclusive content for followers
- **Background Effects**: Blur, parallax, and particle effects
- **Priority Support**: Dedicated customer service

### 🔗 **Discord Integration**
- **OAuth Authentication**: Seamless Discord login
- **Role-Based Access**: Automatic staff role assignment
- **Discord Bot**: Generate redeem codes and manage users
- **Server Management**: Integrated Discord server features

### 👑 **Admin Dashboard**
- **Glass Panel Design**: Modern, transparent UI matching profile dashboard
- **User Management**: View and manage user accounts
- **Analytics**: Platform statistics and metrics
- **System Status**: Monitor Discord bot and database health
- **Code Generation**: Create promotional and premium codes

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- Supabase account
- Discord Developer account (for bot integration)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd swims.cc

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_server_id
DISCORD_STAFF_ROLE_ID=1404371407961460757

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🏗️ **Architecture**

### Frontend
- **Next.js 14**: App router, server components
- **React**: Modern hooks and state management
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations

### Backend
- **Supabase**: Database, authentication, storage
- **PostgreSQL**: Relational database with RLS
- **Discord.js**: Bot integration and OAuth

### Key Components
- **Admin Dashboard**: Glass-panel design with sidebar navigation
- **Profile Editor**: Left sidebar with tabbed content areas
- **Discord Integration**: Role checking and automatic assignment
- **Premium Features**: Gated behind subscription system

## 📱 **Pages & Routes**

### Public Pages
- `/` - Landing page with hero section
- `/page/explore` - Discover user profiles
- `/help` - Help center and documentation
- `/pricing` - Subscription plans
- `/auth/signup` - User registration
- `/auth/login` - User authentication

### Protected Pages
- `/profile/edit` - Profile customization dashboard
- `/admin` - Staff administration panel
- `/[username]` - Public profile pages

### API Routes
- `/api/discord/check-role` - Discord role verification
- `/api/discord/sync-role` - Role synchronization
- `/api/upload` - File upload handling
- `/api/music/*` - Music management
- `/api/social-links/*` - Social media links

## 🎯 **Current Status**

### ✅ **Completed Features**
- Full admin dashboard with glass-panel styling
- Profile edit page with left sidebar navigation
- Discord OAuth integration and role checking
- Premium feature gating system
- Music player and social links management
- Badge system and reveal page functionality
- Responsive design with modern UI components

### 🔄 **In Progress**
- Spotify API integration
- Advanced animation effects
- User analytics dashboard
- Payment processing system

### 📋 **Planned Features**
- Custom domain support
- Advanced analytics
- White-label options
- API access for developers

## 🛠️ **Development**

### Running the Discord Bot
```bash
cd discord-bot
npm install
npm start
```

### Database Schema
The site uses a comprehensive PostgreSQL schema with:
- User profiles and authentication
- Social media links and music tracks
- Badge system and premium features
- Discord integration and role management

### Styling System
- **Glass Panels**: `bg-black/20 backdrop-blur-md` with borders
- **Color Scheme**: Red accent (`#ef4444`) with dark theme
- **Responsive**: Mobile-first design with Tailwind utilities

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is proprietary software. All rights reserved.

## 🆘 **Support**

- **Help Center**: `/help`
- **Discord Server**: Join our community
- **Email**: support@swims.cc

---

**Built with ❤️ by the swims.cc team**
