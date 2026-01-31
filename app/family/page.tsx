"use client"

import { useState, useEffect } from "react"
import { useToast } from '@/hooks/use-toast'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Mail, Calendar, Trash2, DollarSign, Settings2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface FamilyMember {
  id: string
  name: string
  email: string
  role: "admin" | "member"
  joinedDate: string
  spendingLimit: number
}


interface FamilySettings {
  familyName: string
  currency: string
  monthlyBudget: number
}

const defaultSettings: FamilySettings = {
  familyName: "",
  currency: "USD",
  monthlyBudget: 0,
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [settings, setSettings] = useState<FamilySettings>(defaultSettings)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "member", spendingLimit: "" })
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [editingSettings, setEditingSettings] = useState<FamilySettings>(settings)
  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/families')
        if (!r.ok) return
        const d = await r.json()
        const fams = d.families || []
        if (fams[0]) {
          const fam = fams[0]
          setFamilyId(fam.id)
          setSettings({ familyName: fam.name || '', currency: fam.currency || 'USD', monthlyBudget: Number(fam.monthlyBudget || 0) })
          const mapped = (fam.members || []).map((m: any) => ({
            id: m.id,
            name: (m.user && (m.user.name || m.user.email)) || 'Member',
            email: m.user?.email || '',
            role: m.role === 'admin' ? 'admin' : 'member',
            joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : new Date().toLocaleDateString(),
            spendingLimit: Number(m.monthlyLimit || 0),
          }))
          setMembers(mapped)
        }
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member: FamilyMember = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role as "admin" | "member",
        joinedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        spendingLimit: newMember.spendingLimit ? Number.parseFloat(newMember.spendingLimit) : 0,
      }
      setMembers([...members, member])
      setNewMember({ name: "", email: "", role: "member", spendingLimit: "" })
      setIsAddMemberOpen(false)
      // If we have a real familyId, call backend to add member
      if (familyId) {
        fetch('/api/families/add-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ familyId, email: newMember.email, role: newMember.role, monthlyLimit: newMember.spendingLimit ? Number(newMember.spendingLimit) : 0 }),
        }).then(async (r) => {
          if (!r.ok) {
            const err = await r.json()
            toast({ title: 'Failed to add member', description: err?.error || 'Failed to add member', variant: 'destructive' })
          }
        })
      }
    }
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  const handleRoleChange = (memberId: string, newRole: "admin" | "member") => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)))
  }

  const handleSpendingLimitChange = (memberId: string, limit: number) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, spendingLimit: limit } : m)))
  }

  const handleSaveSettings = () => {
    setSettings(editingSettings)
    setIsSettingsOpen(false)
    // create family on backend if not exists
    ;(async () => {
      try {
        const res = await fetch('/api/families', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingSettings.familyName, description: '', currency: editingSettings.currency, monthlyBudget: editingSettings.monthlyBudget }),
        })
        const data = await res.json()
        if (res.ok) setFamilyId(data.family.id)
      } catch (e) {
        toast({ title: 'Failed to create family', description: 'Could not create family', variant: 'destructive' })
      }
    })()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Family Management</h1>
            <p className="text-muted-foreground">
              {settings.familyName} • {members.length} members
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Family Settings</DialogTitle>
                  <DialogDescription>Configure your family budget settings</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={editingSettings.familyName}
                      onChange={(e) =>
                        setEditingSettings((prev) => ({
                          ...prev,
                          familyName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={editingSettings.currency}
                      onValueChange={(value) =>
                        setEditingSettings((prev) => ({
                          ...prev,
                          currency: value,
                        }))
                      }
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                    <Input
                      id="monthlyBudget"
                      type="number"
                      value={editingSettings.monthlyBudget}
                      onChange={(e) =>
                        setEditingSettings((prev) => ({
                          ...prev,
                          monthlyBudget: Number.parseFloat(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full bg-primary hover:bg-primary/90">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                  <DialogDescription>Add a new member to your family budget</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newMember.name}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={newMember.email}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value) =>
                        setNewMember((prev) => ({
                          ...prev,
                          role: value,
                        }))
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spendingLimit">Monthly Spending Limit (Optional)</Label>
                    <Input
                      id="spendingLimit"
                      type="number"
                      placeholder="Leave empty for no limit"
                      value={newMember.spendingLimit}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          spendingLimit: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button onClick={handleAddMember} className="w-full bg-primary hover:bg-primary/90">
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs for Members and Settings Overview */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {members.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No family members yet. Add your first member to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12 bg-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              {member.name}
                              <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                                {member.role}
                              </span>
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {member.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {member.joinedDate}
                              </span>
                            </div>
                            {member.spendingLimit > 0 && (
                              <div className="flex items-center text-sm text-accent mt-2 gap-1">
                                <DollarSign className="w-4 h-4" />
                                Monthly limit: {settings.currency} {member.spendingLimit.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {settings.currency} {settings.monthlyBudget.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Total family monthly budget</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Family Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{members.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {members.filter((m) => m.role === "admin").length} admin(s)
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Member Spending Limits</CardTitle>
                <CardDescription>Monthly spending allocations for each member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members
                    .filter((m) => m.spendingLimit > 0)
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium text-sm">{member.name}</span>
                        <span className="text-sm font-semibold text-accent">
                          {settings.currency} {member.spendingLimit.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  {members.filter((m) => m.spendingLimit > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground">No spending limits set yet</p>
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
