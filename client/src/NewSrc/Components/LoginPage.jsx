import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo - smaller on mobile */}
        {/* <div className="flex items-center justify-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-5" />
          </div>
        </div> */}
        
        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  )
}