// components/admin/ImageUpload.jsx
import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { api } from '@/lib/api.js'

export default function ImageUpload({ onUpload }) {
  const [loading, setLoading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      // 1. Demande une presigned URL au backend
      const { data } = await api.post('/products/upload-url', {
        contentType: file.type,
        contentLength: file.size,
      })
      const { uploadUrl, publicUrl } = data.data

      // 2. Upload direct vers S3 — pas via le backend
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      // 3. Retourne l'URL publique au parent
      onUpload(publicUrl)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-ink-200 cursor-pointer hover:border-ink-400 transition-colors">
      {loading
        ? <Loader2 size={24} className="animate-spin text-ink-400" />
        : <><Upload size={24} className="text-ink-300 mb-2" /><span className="text-sm text-ink-400">Click to upload image</span></>
      }
      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </label>
  )
}
