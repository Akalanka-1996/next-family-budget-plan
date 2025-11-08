"use client"

import { useState, useMemo } from "react"
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

const mockExpenses: Expense[] = [
  {
    id: "1",
    category: "groceries",
    amount: 85.5,
    description: "Weekly grocery shopping",
    date: "2024-11-07",
    member: "Jane Doe",
  },
  {
    id: "2",
    category: "utilities",
    amount: 120,
    description: "Monthly electricity bill",
    date: "2024-11-06",
    member: "John Doe",
  },
  {
    id: "3",
    category: "entertainment",
    amount: 45,
    description: "Movie tickets",
    date: "2024-11-05",
    member: "Tom Doe",
  },
  {
    id: "4",
    category: "dining",
    amount: 65,
    description: "Restaurant dinner",
    date: "2024-11-04",
    member: "Jane Doe",
  },
  {
    id: "5",
    category: "transport",
    amount: 50,
    description: "Gas station fill-up",
    date: "2024-11-03",
    member: "John Doe",
  },
  {
    id: "6",
    category: "shopping",
    amount: 120.75,
    description: "Clothing purchase",
    date: "2024-11-02",
    member: "Jane Doe",
  },
  {
    id: "7",
    category: "health",
    amount: 35.99,
    description: "Pharmacy",
    date: "2024-11-01",
    member: "Tom Doe",
  },
]

const members = ["John Doe", "Jane Doe", "Tom Doe"]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [isOpen, setIsOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterMember, setFilterMember] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [newExpense, setNewExpense] = useState({
    category: "groceries",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    member: "John Doe",
  })

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatch = filterCategory === "all" || expense.category === filterCategory
      const memberMatch = filterMember === "all" || expense.member === filterMember
      const dateMatch = (!startDate || expense.date >= startDate) && (!endDate || expense.date <= endDate)
      return categoryMatch && memberMatch && dateMatch
    })
  }, [expenses, filterCategory, filterMember, startDate, endDate])

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
    if (newExpense.amount && newExpense.description) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: newExpense.category,
        amount: Number.parseFloat(newExpense.amount),
        description: newExpense.description,
        date: newExpense.date,
        member: newExpense.member,
      }
      setExpenses([expense, ...expenses])
      setNewExpense({
        category: "groceries",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        member: "John Doe",
      })
      setIsOpen(false)
    }
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
                    onValueChange={(value) => setNewExpense((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <Select
                    value={newExpense.member}
                    onValueChange={(value) => setNewExpense((prev) => ({ ...prev, member: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button onClick={handleAddExpense} className="w-full bg-primary hover:bg-primary/90">
                  Add Expense
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
                      <SelectItem key={member} value={member}>
                        {member}
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
