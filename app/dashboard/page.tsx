"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpenseOverview } from "@/components/expense-overview"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { MemberExpensesChart } from "@/components/member-expenses-chart"
import { CategoryExpensesChart } from "@/components/category-expenses-chart"
import { BudgetProgress } from "@/components/budget-progress"
import { RecentExpenses } from "@/components/recent-expenses"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState("November 2024")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track your family's spending at a glance</p>
        </div>

        {/* Overview Cards */}
        <ExpenseOverview />

        {/* Main Charts Section with Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Monthly and Member Charts */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyExpensesChart />
              <MemberExpensesChart />
            </div>
            <RecentExpenses />
          </TabsContent>

          {/* Analytics Tab - Category Breakdown */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <CategoryExpensesChart />
            </div>
            <RecentExpenses />
          </TabsContent>

          {/* Budget Tab - Budget Progress */}
          <TabsContent value="budget" className="space-y-4">
            <BudgetProgress />
            <RecentExpenses />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
