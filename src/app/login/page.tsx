import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Building2 } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/50">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary rounded-xl">
                            <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the HR Portal
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="admin@company.com" defaultValue="admin@company.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" defaultValue="password" required />
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full">Sign in</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
