#!/bin/bash

echo "🗑️  STRIPPING HEAVY DEPENDENCIES TO MAKE YOUR SITE FAST!"

# Remove the heaviest packages first
echo "Removing @emotion/is-prop-valid..."
npm uninstall @emotion/is-prop-valid

echo "Removing discord.js..."
npm uninstall discord.js

echo "Removing @hello-pangea/dnd..."
npm uninstall @hello-pangea/dnd

echo "Removing embla-carousel-react..."
npm uninstall embla-carousel-react

echo "Removing react-resizable-panels..."
npm uninstall react-resizable-panels

echo "Removing vaul..."
npm uninstall vaul

echo "Removing input-otp..."
npm uninstall input-otp

echo "Removing react-day-picker..."
npm uninstall react-day-picker

echo "Removing recharts..."
npm uninstall recharts

echo "Removing sonner..."
npm uninstall sonner

echo "Removing tw-animate-css..."
npm uninstall tw-animate-css

# Remove unused Radix UI components
echo "Removing unused Radix UI components..."
npm uninstall @radix-ui/react-accordion @radix-ui/react-aspect-ratio
npm uninstall @radix-ui/react-collapsible @radix-ui/react-context-menu
npm uninstall @radix-ui/react-hover-card @radix-ui/react-menubar
npm uninstall @radix-ui/react-navigation-menu @radix-ui/react-progress
npm uninstall @radix-ui/react-radio-group @radix-ui/react-scroll-area
npm uninstall @radix-ui/react-select @radix-ui/react-separator
npm uninstall @radix-ui/react-slider @radix-ui/react-toggle
npm uninstall @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Update Supabase to stable versions
echo "Updating Supabase to stable versions..."
npm install @supabase/ssr@0.1.0 @supabase/supabase-js@2.39.0

# Clean up
echo "Cleaning up..."
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

echo "✅ HEAVY SHIT STRIPPED! Your site should be much faster now!"
echo "🚀 Deploy this and test the performance!"
