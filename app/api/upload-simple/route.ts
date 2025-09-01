import { type NextRequest, NextResponse } from "next/server"
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`[Upload API] Starting upload for user ${user.id}, file: ${file.name}, size: ${file.size} bytes, bucket: ${bucket}`)

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    try {
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('[Upload API] Storage upload error:', uploadError)
        
        // If bucket doesn't exist, try to create it
        if (uploadError.message?.includes('Bucket not found')) {
          console.log(`[Upload API] Creating bucket: ${bucket}`)
          
          const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: true,
            allowedMimeTypes: ['image/*', 'audio/*', 'video/*'],
            fileSizeLimit: 50 * 1024 * 1024 // 50MB
          })
          
          if (createError) {
            console.error('[Upload API] Failed to create bucket:', createError)
            return NextResponse.json({ 
              error: 'Failed to create storage bucket',
              details: createError.message
            }, { status: 500 })
          }
          
          // Try upload again
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })
            
          if (retryError) {
            throw retryError
          }
          
          uploadData = retryData
        } else {
          throw uploadError
        }
      }

      console.log(`[Upload API] File uploaded successfully to storage:`, fileName)
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)
      
      return NextResponse.json({ 
        url: publicUrl,
        bucket: bucket,
        filename: fileName,
        method: 'storage'
      })

    } catch (storageError) {
      console.error('[Upload API] Storage error:', storageError)
      return NextResponse.json({ 
        error: `Upload failed: ${storageError?.message || 'Storage error'}`,
        details: 'Please check your Supabase storage configuration',
        debug: {
          fileName,
          fileSize: file.size,
          fileType: file.type,
          userId: user.id,
          bucket
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
