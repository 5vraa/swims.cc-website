import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if the code exists and is valid
    const { data: redeemCode, error: codeError } = await supabase
      .from("redeem_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (codeError || !redeemCode) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Check if code has expired
    if (redeemCode.expires_at && new Date(redeemCode.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired" }, { status: 400 })
    }

    // Check if code has reached max uses
    if (redeemCode.current_uses >= redeemCode.max_uses) {
      return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 })
    }

    // Check if user has already redeemed this code
    const { data: existingRedemption } = await supabase
      .from("code_redemptions")
      .select("id")
      .eq("code_id", redeemCode.id)
      .eq("user_id", user.id)
      .single()

    if (existingRedemption) {
      return NextResponse.json({ error: "You have already redeemed this code" }, { status: 400 })
    }

    // Get client IP for logging
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Start a transaction to redeem the code
    const { error: redemptionError } = await supabase.from("code_redemptions").insert({
      code_id: redeemCode.id,
      user_id: user.id,
      ip_address: clientIP,
    })

    if (redemptionError) {
      console.error("[swims.cc] Error creating redemption:", redemptionError)
      return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 })
    }

    // Update the code usage count
    const { error: updateError } = await supabase
      .from("redeem_codes")
      .update({ current_uses: redeemCode.current_uses + 1 })
      .eq("id", redeemCode.id)

    if (updateError) {
      console.error("[swims.cc] Error updating code usage:", updateError)
      // Note: In a production app, you'd want to handle this more carefully
      // possibly with database transactions or rollback mechanisms
    }

    // Apply benefits
    let benefitMessage = "Code redeemed successfully!"
    const codeValue = redeemCode.value || {}

    if (redeemCode.type === "premium") {
      // Mark account as premium (allowed by self-update policy)
      await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("user_id", user.id)

      benefitMessage = "Premium features unlocked! Enjoy your enhanced experience."
    } else if (redeemCode.type === "storage") {
      const storageAmount = codeValue.amount || "1GB"
      benefitMessage = `${storageAmount} of additional storage has been added to your account.`
    } else if (redeemCode.type === "custom") {
      benefitMessage = codeValue.message || "Special benefits have been applied to your account."
    }

    // Log the redemption for analytics
    await supabase.from("analytics_events").insert({
      profile_id: null, // This could be linked to user's profile if needed
      event_type: "code_redeemed",
      event_data: {
        code_type: redeemCode.type,
        code_value: redeemCode.value,
        user_id: user.id,
      },
      ip_address: clientIP,
    })

    // Optional: log to a Discord channel if env configured
    try {
      const channelId = process.env.DISCORD_LOG_CHANNEL_ID
      const botToken = process.env.DISCORD_BOT_TOKEN
      if (channelId && botToken) {
        await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${botToken}`,
          },
          body: JSON.stringify({
            content: `🧾 Code redeemed by user ${user.id}: ${redeemCode.code} (${redeemCode.type})`,
          }),
        })
      }
    } catch {}

    return NextResponse.json({
      message: benefitMessage,
      details: {
        type: redeemCode.type,
        value: redeemCode.value,
      },
    })
  } catch (error) {
    console.error("[swims.cc] Error in redeem API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
