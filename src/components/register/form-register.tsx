import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { de } from "date-fns/locale"

export function registerPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/50">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary rounded-xl">
                            <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Register</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the HR Portal
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nama">Nama</Label>
                        <Input id="nama" type="text" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email"  required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" defaultValue="password" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="konfirmasipassword">konfirmasi password</Label>
                        <Input id="konfirmasipassword" type="password" defaultValue="password" required />
                    </div>
                </CardContent>

                
                <CardFooter>
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full">Register</Button>
                    </Link>
                </CardFooter>
                <p className="text-sm text-center mt-4 mb-6">
                        already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Login
                        </Link>
                    </p>
            </Card>
        </div>
    )
}


export default registerPage;