import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      success: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      buckets: buckets || [],
      bucketError: bucketError?.message || null,
      user: user ? { id: user.id, email: user.email } : null,
      authError: authError?.message || null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
