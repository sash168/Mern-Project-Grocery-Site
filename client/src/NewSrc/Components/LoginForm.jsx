import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Hardcoded credentials
    const adminCredentials = { email: 'admin@gmail.com', password: 'admin123', role: 'admin', username: 'Admin' }
    const userCredentials = { email: 'user@gmail.com', password: 'user123', role: 'user', username: 'User' }

    if (email === adminCredentials.email && password === adminCredentials.password) {
      // Store admin data
      localStorage.setItem('user', JSON.stringify({
        email: adminCredentials.email,
        role: adminCredentials.role,
        username: adminCredentials.username,
        isLoggedIn: true
      }))
      navigate('/admin')
    } else if (email === userCredentials.email && password === userCredentials.password) {
      // Store user data
      localStorage.setItem('user', JSON.stringify({
        email: userCredentials.email,
        role: userCredentials.role,
        username: userCredentials.username,
        isLoggedIn: true
      }))
      navigate('/user')
    } else {
      setError('Invalid email or password')
    }
  }
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gmail.com or user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="admin123 or user123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Field>
              {error && (
                <Field>
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                </Field>
              )}
              <Field>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base">
                  Login
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
