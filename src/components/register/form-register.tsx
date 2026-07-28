"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Building2, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const passwordMinLength = password.length >= 6
    const passwordHasUpper = /[A-Z]/.test(password)
    const passwordHasNumber = /[0-9]/.test(password)
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })

            const json = await response.json()

            if (!response.ok || !json.success) {
                toast.error(json.error || "Registration failed")
                return
            }

            toast.success("Account created successfully!")
            router.push("/login")
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const CheckIcon = ({ ok }: { ok: boolean }) =>
        ok
            ? <Check className="h-3 w-3 text-emerald-500" />
            : <X className="h-3 w-3 text-muted-foreground/50" />

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                        <Building2 className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">POSPro</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create your account
                    </p>
                </div>

                {/* Register card */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <div className="flex gap-3 text-xs">
                                    <span className="flex items-center gap-1">
                                        <CheckIcon ok={passwordMinLength} /> 6 chars
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckIcon ok={passwordHasUpper} /> Upper
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckIcon ok={passwordHasNumber} /> Number
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPassword.length > 0 && (
                                <p className={`text-xs ${passwordsMatch ? "text-emerald-500" : "text-red-500"}`}>
                                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                                </p>
                            )}
                        </div>

                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage
