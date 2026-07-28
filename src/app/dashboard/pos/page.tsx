"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Search, Plus, Minus, Trash2, CreditCard, UserIcon, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  category?: { name: string }
}

interface Customer {
  id: number
  name: string
}

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState<string>("")
  const [paidAmount, setPaidAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?limit=100&search=${search}`)
      const json = await res.json()
      if (json.success) setProducts(json.data?.data ?? [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoadingProducts(false)
    }
  }, [search])

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers?limit=100")
      const json = await res.json()
      if (json.success) setCustomers(json.data?.data ?? [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [fetchProducts, fetchCustomers])

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" is out of stock`)
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Insufficient stock for "${product.name}"`)
          return prev
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          subtotal: Number(product.price),
        },
      ]
    })
  }

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null // remove
          return { ...item, quantity: newQty, subtotal: newQty * item.price }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const change = Math.max(0, Number(paidAmount) - total)

  const handlePay = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    const paid = Number(paidAmount)
    if (!paid || paid < total) {
      toast.error(`Insufficient payment. Total: Rp ${total.toLocaleString("id-ID")}`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId ? Number(customerId) : null,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          paidAmount: paid,
        }),
      })

      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || "Payment failed")
        return
      }

      toast.success("Payment successful!")
      setLastTransaction(json.data)
      setShowReceipt(true)
      setCart([])
      setPaidAmount("")
      setCustomerId("")
      fetchProducts() // refresh stock
    } catch {
      toast.error("Payment failed")
    } finally {
      setSubmitting(false)
    }
  }

  const formatIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)

  if (showReceipt && lastTransaction) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>Payment Successful</CardTitle>
            <p className="text-sm text-muted-foreground">{lastTransaction.invoiceNo}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {lastTransaction.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product?.name} x{item.quantity}
                  </span>
                  <span className="font-medium">{formatIDR(Number(item.subtotal))}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{formatIDR(Number(lastTransaction.total))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span>{formatIDR(Number(lastTransaction.paidAmount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Change</span>
                <span className="text-emerald-600">{formatIDR(Number(lastTransaction.change))}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => setShowReceipt(false)}>
                New Transaction
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReceipt(false)
                  setLastTransaction(null)
                }}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4">
      {/* ── Products Grid ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loadingProducts ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.sku.toLowerCase().includes(search.toLowerCase())
                )
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="group relative flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{formatIDR(Number(product.price))}</p>
                    <Badge
                      variant={product.stock <= 5 ? "destructive" : product.stock <= 10 ? "warning" : "secondary"}
                      className="mt-1 text-[10px] px-1.5 py-0"
                    >
                      {product.stock} left
                    </Badge>
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent group-hover:ring-primary/30 transition-all" />
                  </button>
                ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* ── Cart ──────────────────────────────────────────── */}
      <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
        <h2 className="text-lg font-semibold mb-3">Cart</h2>

        <ScrollArea className="flex-1 -mx-4 px-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="mb-2 h-8 w-8" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Click products to add</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 rounded-lg border p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatIDR(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.productId, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.productId, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="w-20 text-right text-sm font-medium tabular-nums">
                    {formatIDR(item.subtotal)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator className="my-3" />

        {/* Customer & Payment */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="General customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Total</Label>
            <p className="text-2xl font-bold tracking-tight">{formatIDR(total)}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Paid Amount</Label>
            <Input
              type="number"
              placeholder="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              min={0}
            />
          </div>

          {Number(paidAmount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Change</span>
              <span className={change >= 0 ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                {formatIDR(change)}
              </span>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handlePay}
            disabled={cart.length === 0 || submitting || Number(paidAmount) < total}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {total > 0 ? formatIDR(total) : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
