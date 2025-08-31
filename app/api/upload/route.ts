import { type NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's profile ID first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`[Upload API] Starting upload for user ${user.id}, file: ${file.name}, size: ${file.size} bytes`)

    // Convert file to base64 string for database storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    try {
      // Store file data directly in database (bypasses storage buckets)
      const { data: uploadData, error: uploadError } = await supabase
        .from('file_uploads')
        .insert({
          profile_id: profile.id,
          file_name: fileName,
          file_url: `data:${file.type || 'application/octet-stream'};base64,${base64Data}`,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          is_public: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (uploadError) {
        console.error('[Upload API] Database insert error:', uploadError)
        
        // If table doesn't exist, create it first
        if (uploadError.code === '42P01') { // Table doesn't exist
          console.log('[Upload API] Creating file_uploads table...')
          
          // Try direct SQL creation
          const { error: sqlError } = await supabase.rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS file_uploads (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                profile_id UUID NOT NULL,
                file_name TEXT NOT NULL,
                file_url TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER,
                mime_type TEXT,
                is_public BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              CREATE INDEX IF NOT EXISTS idx_file_uploads_profile_id ON file_uploads(profile_id);
            `
          })
          
          if (sqlError) {
            console.error('[Upload API] Failed to create table:', sqlError)
            return NextResponse.json({ 
              error: 'Failed to create file storage table',
              details: 'Please run the database fix script first'
            }, { status: 500 })
          }
          
          // Try insert again
          const { data: retryData, error: retryError } = await supabase
            .from('file_uploads')
            .insert({
              profile_id: profile.id,
              file_name: fileName,
              file_url: `data:${file.type || 'application/octet-stream'};base64,${base64Data}`,
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              mime_type: file.type || 'application/octet-stream',
              is_public: false,
              created_at: new Date().toISOString()
            })
            .select()
            .single()
            
          if (retryError) {
            throw retryError
          }
          
          uploadData = retryData
        } else {
          throw uploadError
        }
      }

      console.log(`[Upload API] File stored successfully in database:`, fileName)
      
      // Return a data URL that can be used directly
      const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64Data}`
      
      return NextResponse.json({ 
        url: dataUrl,
        bucket: 'database',
        filename: fileName,
        method: 'database_storage'
      })

    } catch (storageError) {
      console.error('[Upload API] Storage error:', storageError)
      return NextResponse.json({ 
        error: `Upload failed: ${storageError?.message || 'Storage error'}`,
        details: 'Please run the database fix script first',
        debug: {
          fileName,
          fileSize: file.size,
          fileType: file.type,
          userId: user.id
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error("[Upload API] Unexpected error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
