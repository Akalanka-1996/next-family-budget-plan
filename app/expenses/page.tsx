"use client"

import { useState, useMemo, useEffect } from "react"
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/lib/user-context'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { expenseSchema, type ExpenseFormData } from "@/lib/validations"

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  date: string
  member: string
}

const categories = ["groceries", "utilities", "entertainment", "transport", "dining", "health", "shopping", "other"]

const categoryColors: Record<string, string> = {
  groceries: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  utilities: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  transport: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  dining: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  shopping: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
}

// expenses and member lists are loaded from the API (no dummy data)

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [families, setFamilies] = useState<any[]>([])
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([])
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterMember, setFilterMember] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [newExpense, setNewExpense] = useState<ExpenseFormData>({
    category: "groceries",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    member: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { user } = useUser()

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatch = filterCategory === "all" || expense.category === filterCategory
      const memberMatch = filterMember === "all" || expense.member === filterMember
      const dateMatch = (!startDate || expense.date >= startDate) && (!endDate || expense.date <= endDate)
      return categoryMatch && memberMatch && dateMatch
    })
  }, [expenses, filterCategory, filterMember, startDate, endDate])

  useEffect(() => {
    if (!user) return // Don't fetch families if user is not loaded
    ;(async () => {
      try {
        const r = await fetch('/api/families')
        if (r.ok) {
          const d = await r.json()
          const fams = d.families || []
          setFamilies(fams)
          if (fams[0]) {
            setSelectedFamilyId(fams[0].id)
            const mapped = (fams[0].members || []).map((m: any) => ({ id: m.id, name: (m.user && (m.user.name || m.user.email)) || 'Member' }))
            setMembers(mapped)
          }
        }
      } catch (e) {
        toast({ title: 'Failed to load families', description: 'Could not fetch your families', variant: 'destructive' })
      }
    })()
  }, [user, toast])

  useEffect(() => {
    if (!selectedFamilyId) return
    ;(async () => {
      try {
        const r = await fetch(`/api/expenses?familyId=${selectedFamilyId}`)
        if (r.ok) {
          const d = await r.json()
          setExpenses((d.expenses || []).map((e: any) => ({
            id: e.id,
            category: e.category,
            amount: Number(e.amount),
            description: e.description,
            date: e.date,
            member: (members.find((m) => m.id === e.familyMemberId)?.name) || (user?.name || user?.email || 'Unknown'),
          })))
        }
      } catch (e) {
        toast({ title: 'Failed to load expenses', description: 'Could not fetch expenses for this family', variant: 'destructive' })
      }
    })()
  }, [selectedFamilyId, members, user, toast])

  useEffect(() => {
    // set default member for new expense to current user
    if (user) {
      setNewExpense((prev) => ({ ...prev, member: user.name || user.email || '' }))
    }
  }, [user])

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount
    })
    return totals
  }, [filteredExpenses])

  const memberTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      totals[expense.member] = (totals[expense.member] || 0) + expense.amount
    })
    return totals
  }, [filteredExpenses])

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0

  const handleAddExpense = () => {
    // Validate form data with Zod
    const result = expenseSchema.safeParse(newExpense)
    if (!result.success) {
      const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {}
      result.error.errors.forEach((error) => {
        const path = error.path[0] as keyof ExpenseFormData
        newErrors[path] = error.message
      })
      setErrors(newErrors)
      return
    }

    if (!selectedFamilyId) {
      toast({ title: 'Select a family', description: 'Please select a family first', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    ;(async () => {
      try {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: newExpense.description,
            amount: Number(newExpense.amount),
            category: newExpense.category,
            date: newExpense.date,
            familyId: selectedFamilyId,
          }),
        })
        const data = await res.json()
        setIsLoading(false)
        if (res.ok) {
          // refetch
          const r2 = await fetch(`/api/expenses?familyId=${selectedFamilyId}`)
          const d2 = await r2.json()
          setExpenses((d2.expenses || []).map((e: any) => ({ id: e.id, category: e.category, amount: Number(e.amount), description: e.description, date: e.date, member: (members.find((m) => m.id === e.familyMemberId)?.name) || e.familyMemberId })))
          setNewExpense({ category: 'groceries', amount: 0, description: '', date: new Date().toISOString().split('T')[0], member: '' })
          setErrors({})
          setIsOpen(false)
          toast({ title: 'Success', description: 'Expense added successfully', variant: 'default' })
        } else {
          toast({ title: 'Failed to add expense', description: data.error || 'Failed to add expense', variant: 'destructive' })
        }
      } catch (err) {
        setIsLoading(false)
        toast({ title: 'Failed to add expense', description: 'An unexpected error occurred', variant: 'destructive' })
      }
    })()
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Track and manage family expenses</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record a new expense for the family budget</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => {
                      setNewExpense((prev) => ({ ...prev, category: value }))
                      if (errors.category) setErrors({ ...errors, category: undefined })
                    }}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {user?.name || user?.email || 'Loading...'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount || ""}
                    onChange={(e) => {
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value ? parseFloat(e.target.value) : 0,
                      }))
                      if (errors.amount) setErrors({ ...errors, amount: undefined })
                    }}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense description"
                    value={newExpense.description}
                    onChange={(e) => {
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                      if (errors.description) setErrors({ ...errors, description: undefined })
                    }}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => {
                      setNewExpense((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                      if (errors.date) setErrors({ ...errors, date: undefined })
                    }}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                </div>

                <Button onClick={handleAddExpense} className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{filteredExpenses.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">${averageExpense.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{Object.keys(categoryTotals).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Categories tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Expenses</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="by-member">By Member</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <div className="grid md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs mb-2 block">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Member</Label>
                <Select value={filterMember} onValueChange={setFilterMember}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs mb-2 block">End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-3">
              {filteredExpenses.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No expenses found matching your filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredExpenses.map((expense) => (
                  <Card key={expense.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">💳</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{expense.description}</h3>
                              <Badge className={categoryColors[expense.category]}>{expense.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {expense.member} • {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-foreground">${expense.amount.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="by-category" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Breakdown of spending across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryTotals)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, total]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={categoryColors[category]}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-lg font-bold text-accent">${total.toFixed(2)}</span>
                      </div>
                    ))}
                  {Object.keys(categoryTotals).length === 0 && (
                    <p className="text-muted-foreground">No expenses in selected filters</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Member Tab */}
          <TabsContent value="by-member" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Member</CardTitle>
                <CardDescription>Breakdown of spending per family member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(memberTotals)
                    .sort(([, a], [, b]) => b - a)
                    .map(([member, total]) => (
                      <div key={member} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{member}</span>
                        <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                      </div>
                    ))}
                  {Object.keys(memberTotals).length === 0 && (
                    <p className="text-muted-foreground">No expenses in selected filters</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
