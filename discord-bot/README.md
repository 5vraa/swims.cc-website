# swims.cc Discord Bot

A Discord bot for managing redeem codes for the swims.cc platform.

## Features

- Generate redeem codes with different types (Premium, Storage, Custom)
- List recent codes with usage statistics
- Deactivate codes remotely
- View comprehensive code statistics
- Admin-only commands with permission checks

## Setup Instructions

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token for later use
5. Enable the following bot permissions:
   - Send Messages
   - Use Slash Commands
   - Embed Links

### 2. Install Dependencies

\`\`\`bash
cd discord-bot
npm install
\`\`\`

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Discord bot token
3. Add Discord user IDs of admins (comma-separated)
4. Use the same Supabase credentials as your main app

### 4. Invite Bot to Server

1. Go to OAuth2 > URL Generator in Discord Developer Portal
2. Select "bot" and "applications.commands" scopes
3. Select "Administrator" permission (or customize as needed)
4. Use the generated URL to invite the bot to your server

### 5. Run the Bot

\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

## Available Commands

### `/generate-code`
Generate a new redeem code with the following options:
- **type**: Premium Access, Additional Storage, or Custom Benefits
- **max-uses**: Maximum number of redemptions (default: 1)
- **expires**: Expiration date in YYYY-MM-DD format (optional)
- **storage-amount**: Storage amount for storage type (e.g., "5GB")
- **custom-message**: Custom message for custom type

### `/list-codes`
List recent redeem codes with their status and usage statistics.
- **limit**: Number of codes to display (default: 10, max: 50)

### `/deactivate-code`
Deactivate a specific redeem code.
- **code**: The code to deactivate

### `/code-stats`
Display comprehensive statistics about redeem codes including:
- Total codes created
- Active codes
- Total redemptions
- Breakdown by code type

## Admin Configuration

Only users listed in the `DISCORD_ADMIN_USERS` environment variable can use the bot commands. Add Discord user IDs (not usernames) separated by commas:

\`\`\`env
DISCORD_ADMIN_USERS=123456789012345678,987654321098765432
\`\`\`

To find a Discord user ID:
1. Enable Developer Mode in Discord settings
2. Right-click on a user and select "Copy ID"

## Deployment

### Using PM2 (Recommended)

\`\`\`bash
npm install -g pm2
pm2 start bot.js --name "swims-discord-bot"
pm2 startup
pm2 save
\`\`\`

### Using Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "bot.js"]
\`\`\`

### Using Railway/Heroku

1. Create a new project
2. Connect your repository
3. Set environment variables in the dashboard
4. Deploy

## Security Notes

- Keep your bot token secure and never commit it to version control
- Use the service role key for Supabase (not the anon key)
- Regularly rotate your tokens
- Only give admin permissions to trusted users
- Monitor bot usage through Discord's audit logs

## Troubleshooting

### Bot not responding to commands
- Check if the bot is online in your server
- Verify the bot has the necessary permissions
- Check the console for error messages

### Database connection issues
- Verify Supabase credentials are correct
- Check if the service role key has the necessary permissions
- Ensure RLS policies allow the bot to access the tables

### Permission errors
- Verify user IDs in DISCORD_ADMIN_USERS are correct
- Check if the bot has Administrator permissions in the server
- Ensure slash commands are properly registered

## Support

For issues or questions, contact the development team or check the main swims.cc documentation.
