const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const { createClient } = require("@supabase/supabase-js")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, ".env") })

// Initialize Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[Discord Bot] Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in discord-bot/.env")
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

// Admin user IDs (Discord user IDs who can use admin commands)
const ADMIN_USERS = (process.env.DISCORD_ADMIN_USERS || "").split(",").filter(Boolean)

// Helper function to generate random code
function generateRandomCode(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Helper function to check if user is admin
function isAdmin(userId) {
  return ADMIN_USERS.includes(userId)
}

// Bot ready event
client.once("ready", () => {
  console.log(`[Discord Bot] Logged in as ${client.user.tag}!`);
  
  // Set presence here, after client is ready
  client.user.setPresence({
    activities: [{
      name: 'swims.cc Official Bot',
      type: 'PLAYING'
    }],
    status: 'online'
  });

  // Register slash commands
  registerCommands();
});

// Register slash commands
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("generate-code")
      .setDescription("Generate a redeem code (Admin only)")
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Type of code to generate")
          .setRequired(true)
          .addChoices(
            { name: "Premium Access", value: "premium" },
            { name: "Additional Storage", value: "storage" },
            { name: "Custom Benefits", value: "custom" },
          ),
      )
      .addIntegerOption((option) =>
        option
          .setName("max-uses")
          .setDescription("Maximum number of uses (default: 1)")
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(1000),
      )
      .addStringOption((option) =>
        option.setName("expires").setDescription("Expiration date (YYYY-MM-DD format, optional)").setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("storage-amount")
          .setDescription("Storage amount for storage type (e.g., 5GB)")
          .setRequired(false),
      )
      .addStringOption((option) =>
        option.setName("custom-message").setDescription("Custom message for custom type").setRequired(false),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("list-codes")
      .setDescription("List recent redeem codes (Admin only)")
      .addIntegerOption((option) =>
        option
          .setName("limit")
          .setDescription("Number of codes to show (default: 10)")
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(50),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("deactivate-code")
      .setDescription("Deactivate a redeem code (Admin only)")
      .addStringOption((option) => option.setName("code").setDescription("The code to deactivate").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("code-stats")
      .setDescription("Show redeem code statistics (Admin only)")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
      .setName("set-role")
      .setDescription("Set a user's role (Admin only)")
      .addStringOption((option) => option.setName("username").setDescription("Site username").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("role")
          .setDescription("Role to assign")
          .setRequired(true)
          .addChoices(
            { name: "admin", value: "admin" },
            { name: "moderator", value: "moderator" },
            { name: "user", value: "user" },
          ),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("give-badge")
      .setDescription("Give a badge to a user (Admin only)")
      .addStringOption((option) => option.setName("username").setDescription("Site username").setRequired(true))
      .addStringOption((option) => option.setName("badge").setDescription("Badge system name").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName("remove-badge")
      .setDescription("Remove a badge from a user (Admin only)")
      .addStringOption((option) => option.setName("username").setDescription("Site username").setRequired(true))
      .addStringOption((option) => option.setName("badge").setDescription("Badge system name").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  ]

  try {
    console.log("[Discord Bot] Started refreshing application (/) commands.")
    await client.application.commands.set(commands)
    console.log("[Discord Bot] Successfully reloaded application (/) commands.")
  } catch (error) {
    console.error("[Discord Bot] Error registering commands:", error)
  }
}

// Handle slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  // Check if user is admin for admin commands
  const adminCommands = [
    "generate-code",
    "list-codes",
    "deactivate-code",
    "code-stats",
    "set-role",
    "give-badge",
    "remove-badge",
  ]
  if (adminCommands.includes(interaction.commandName) && !isAdmin(interaction.user.id)) {
    await interaction.reply({
      content: "❌ You do not have permission to use this command.",
      ephemeral: true,
    })
    return
  }

  try {
    switch (interaction.commandName) {
      case "generate-code":
        await handleGenerateCode(interaction)
        break
      case "list-codes":
        await handleListCodes(interaction)
        break
      case "deactivate-code":
        await handleDeactivateCode(interaction)
        break
      case "code-stats":
        await handleCodeStats(interaction)
        break
      case "set-role":
        await handleSetRole(interaction)
        break
      case "give-badge":
        await handleGiveBadge(interaction)
        break
      case "remove-badge":
        await handleRemoveBadge(interaction)
        break
    }
  } catch (error) {
    console.error("[Discord Bot] Error handling command:", error)
    await interaction.reply({
      content: "❌ An error occurred while processing your command.",
      ephemeral: true,
    })
  }
})

// Handle generate-code command
async function handleGenerateCode(interaction) {
  await interaction.deferReply({ ephemeral: true })

  const type = interaction.options.getString("type")
  const maxUses = interaction.options.getInteger("max-uses") || 1
  const expires = interaction.options.getString("expires")
  const storageAmount = interaction.options.getString("storage-amount") || "1GB"
  const customMessage = interaction.options.getString("custom-message")

  // Validate expiration date
  let expiresAt = null
  if (expires) {
    const expirationDate = new Date(expires)
    if (isNaN(expirationDate.getTime())) {
      await interaction.editReply("❌ Invalid expiration date format. Use YYYY-MM-DD.")
      return
    }
    expiresAt = expirationDate.toISOString()
  }

  // Prepare code value based on type
  let value = {}
  switch (type) {
    case "storage":
      value = { amount: storageAmount }
      break
    case "custom":
      value = { message: customMessage || "Special benefits unlocked!" }
      break
  }

  // Generate code
  const code = generateRandomCode()

  try {
    // Insert code into database
    const { data, error } = await supabase
      .from("redeem_codes")
      .insert([
        {
          code,
          type,
          value,
          max_uses: maxUses,
          expires_at: expiresAt,
          is_active: true,
          created_by: null, // Could store Discord user ID if needed
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Create embed response
    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle("🎁 Redeem Code Generated")
      .addFields(
        { name: "Code", value: `\`${code}\``, inline: true },
        { name: "Type", value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
        { name: "Max Uses", value: maxUses.toString(), inline: true },
        { name: "Expires", value: expires || "Never", inline: true },
        { name: "Status", value: "✅ Active", inline: true },
      )
      .setFooter({ text: "swims.cc Discord Bot" })
      .setTimestamp()

    if (type === "storage") {
      embed.addFields({ name: "Storage Amount", value: storageAmount, inline: true })
    } else if (type === "custom" && customMessage) {
      embed.addFields({ name: "Custom Message", value: customMessage, inline: false })
    }

    await interaction.editReply({ embeds: [embed] })

    // Log the action
    console.log(`[Discord Bot] Code generated by ${interaction.user.tag}: ${code} (${type})`)
  } catch (error) {
    console.error("[Discord Bot] Error generating code:", error)
    await interaction.editReply("❌ Failed to generate code. Please try again.")
  }
}

// Handle list-codes command
async function handleListCodes(interaction) {
  await interaction.deferReply({ ephemeral: true })

  const limit = interaction.options.getInteger("limit") || 10

  try {
    const { data: codes, error } = await supabase
      .from("redeem_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    if (!codes || codes.length === 0) {
      await interaction.editReply("📝 No redeem codes found.")
      return
    }

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle(`📋 Recent Redeem Codes (${codes.length})`)
      .setFooter({ text: "swims.cc Discord Bot" })
      .setTimestamp()

    const codeList = codes
      .map((code) => {
        const status = code.is_active ? "✅" : "❌"
        const uses = `${code.current_uses}/${code.max_uses}`
        const expires = code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "Never"
        return `${status} \`${code.code}\` | ${code.type} | ${uses} uses | Expires: ${expires}`
      })
      .join("\n")

    embed.setDescription(codeList)

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error("[Discord Bot] Error listing codes:", error)
    await interaction.editReply("❌ Failed to fetch codes. Please try again.")
  }
}

// Handle deactivate-code command
async function handleDeactivateCode(interaction) {
  await interaction.deferReply({ ephemeral: true })

  const code = interaction.options.getString("code").toUpperCase()

  try {
    const { data, error } = await supabase
      .from("redeem_codes")
      .update({ is_active: false })
      .eq("code", code)
      .select()
      .single()

    if (error || !data) {
      await interaction.editReply("❌ Code not found or already inactive.")
      return
    }

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle("🚫 Code Deactivated")
      .addFields(
        { name: "Code", value: `\`${code}\``, inline: true },
        { name: "Type", value: data.type.charAt(0).toUpperCase() + data.type.slice(1), inline: true },
        { name: "Status", value: "❌ Inactive", inline: true },
      )
      .setFooter({ text: "swims.cc Discord Bot" })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })

    console.log(`[Discord Bot] Code deactivated by ${interaction.user.tag}: ${code}`)
  } catch (error) {
    console.error("[Discord Bot] Error deactivating code:", error)
    await interaction.editReply("❌ Failed to deactivate code. Please try again.")
  }
}

// Handle code-stats command
async function handleCodeStats(interaction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    // Get total codes
    const { count: totalCodes } = await supabase.from("redeem_codes").select("*", { count: "exact", head: true })

    // Get active codes
    const { count: activeCodes } = await supabase
      .from("redeem_codes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get total redemptions
    const { count: totalRedemptions } = await supabase
      .from("code_redemptions")
      .select("*", { count: "exact", head: true })

    // Get codes by type
    const { data: codesByType } = await supabase.from("redeem_codes").select("type").eq("is_active", true)

    const typeStats =
      codesByType?.reduce((acc, code) => {
        acc[code.type] = (acc[code.type] || 0) + 1
        return acc
      }, {}) || {}

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle("📊 Redeem Code Statistics")
      .addFields(
        { name: "Total Codes", value: totalCodes?.toString() || "0", inline: true },
        { name: "Active Codes", value: activeCodes?.toString() || "0", inline: true },
        { name: "Total Redemptions", value: totalRedemptions?.toString() || "0", inline: true },
        { name: "Premium Codes", value: (typeStats.premium || 0).toString(), inline: true },
        { name: "Storage Codes", value: (typeStats.storage || 0).toString(), inline: true },
        { name: "Custom Codes", value: (typeStats.custom || 0).toString(), inline: true },
      )
      .setFooter({ text: "swims.cc Discord Bot" })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error("[Discord Bot] Error fetching stats:", error)
    await interaction.editReply("❌ Failed to fetch statistics. Please try again.")
  }
}

// Set role command
async function handleSetRole(interaction) {
  await interaction.deferReply({ ephemeral: true })
  const username = interaction.options.getString("username").toLowerCase()
  const role = interaction.options.getString("role")
  try {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", username)
      .single()

    if (profileErr || !profile) {
      await interaction.editReply(`❌ User ${username} not found.`)
      return
    }

    const { error } = await supabase.from("profiles").update({ role }).eq("user_id", profile.user_id)
    if (error) throw error

    await interaction.editReply(`✅ Set role for ${username} to ${role}.`)
  } catch (e) {
    console.error("[Discord Bot] set-role error", e)
    await interaction.editReply("❌ Failed to set role.")
  }
}

// Give badge command
async function handleGiveBadge(interaction) {
  await interaction.deferReply({ ephemeral: true })
  const username = interaction.options.getString("username").toLowerCase()
  const badgeName = interaction.options.getString("badge").toLowerCase()
  try {
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("username", username).single()
    if (!profile) {
      await interaction.editReply(`❌ User ${username} not found.`)
      return
    }
    const { data: badge } = await supabase.from("badges").select("id").eq("name", badgeName).single()
    if (!badge) {
      await interaction.editReply(`❌ Badge ${badgeName} not found.`)
      return
    }
    const { error } = await supabase.from("user_badges").insert({ user_id: profile.user_id, badge_id: badge.id })
    if (error) throw error
    await interaction.editReply(`✅ Gave ${badgeName} to ${username}.`)
  } catch (e) {
    console.error("[Discord Bot] give-badge error", e)
    await interaction.editReply("❌ Failed to give badge.")
  }
}

// Remove badge command
async function handleRemoveBadge(interaction) {
  await interaction.deferReply({ ephemeral: true })
  const username = interaction.options.getString("username").toLowerCase()
  const badgeName = interaction.options.getString("badge").toLowerCase()
  try {
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("username", username).single()
    if (!profile) {
      await interaction.editReply(`❌ User ${username} not found.`)
      return
    }
    const { data: badge } = await supabase.from("badges").select("id").eq("name", badgeName).single()
    if (!badge) {
      await interaction.editReply(`❌ Badge ${badgeName} not found.`)
      return
    }
    const { error } = await supabase
      .from("user_badges")
      .delete()
      .eq("user_id", profile.user_id)
      .eq("badge_id", badge.id)
    if (error) throw error
    await interaction.editReply(`✅ Removed ${badgeName} from ${username}.`)
  } catch (e) {
    console.error("[Discord Bot] remove-badge error", e)
    await interaction.editReply("❌ Failed to remove badge.")
  }
}

// Error handling
client.on("error", (error) => {
  console.error("[Discord Bot] Client error:", error)
})

process.on("unhandledRejection", (error) => {
  console.error("[Discord Bot] Unhandled promise rejection:", error)
})

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN)
