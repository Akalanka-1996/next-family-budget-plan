"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/user-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Mail,
  Calendar,
  Trash2,
  DollarSign,
  Settings2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  addMemberSchema,
  familySettingsSchema,
  type AddMemberFormData,
  type FamilySettingsFormData,
} from "@/lib/validations";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  joinedDate: string;
  spendingLimit: number;
}

interface FamilySettings {
  familyName: string;
  currency: string;
  monthlyBudget: number;
}

const defaultSettings: FamilySettings = {
  familyName: "",
  currency: "USD",
  monthlyBudget: 0,
};

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [settings, setSettings] = useState<FamilySettings>(defaultSettings);
  const [familyId, setFamilyId] = useState<string | null>(null);

  const [newMember, setNewMember] = useState<AddMemberFormData>({
    name: "",
    email: "",
    password: "",
    role: "member",
    spendingLimit: 0,
  });

  const [newMemberErrors, setNewMemberErrors] = useState<
    Partial<Record<keyof AddMemberFormData, string>>
  >({});

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [editingSettings, setEditingSettings] =
    useState<FamilySettings>(settings);

  const [settingsErrors, setSettingsErrors] = useState<
    Partial<Record<keyof FamilySettingsFormData, string>>
  >({});

  const { user } = useUser();

  // 🔹 Centralized fetch function
  const fetchFamilies = async () => {
    try {
      const r = await fetch("/api/families");
      if (!r.ok) return;

      const d = await r.json();
      const fams = d.families || [];

      if (!fams[0]) return;

      const fam = fams[0];

      setFamilyId(fam.id);
      setSettings({
        familyName: fam.name || "",
        currency: fam.currency || "USD",
        monthlyBudget: Number(fam.monthlyBudget || 0),
      });

      const mapped: FamilyMember[] = (fam.members || []).map((m: any) => ({
        id: m.id,
        name: (m.user && (m.user.name || m.user.email)) || "Member",
        email: m.user?.email || "",
        role: m.role === "admin" ? "admin" : "member",
        joinedDate: m.joinedAt
          ? new Date(m.joinedAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        spendingLimit: Number(m.monthlyLimit || 0),
      }));

      setMembers(mapped);
    } catch (e) {
      console.error("Failed to fetch families", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchFamilies();
  }, [user]);

  const handleAddMember = async () => {
    const result = addMemberSchema.safeParse(newMember);
    if (!result.success) {
      const errors: Partial<Record<keyof AddMemberFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as keyof AddMemberFormData;
        errors[path] = error.message;
      });
      setNewMemberErrors(errors);
      return;
    }

    if (!familyId) {
      alert("Please create a family before adding members");
      return;
    }

    try {
      const res = await fetch("/api/families/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          name: newMember.name,
          email: newMember.email,
          password: newMember.password,
          role: newMember.role,
          monthlyLimit: newMember.spendingLimit || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add family member");
        return;
      }

      setNewMember({
        name: "",
        email: "",
        password: "",
        role: "member",
        spendingLimit: 0,
      });
      setNewMemberErrors({});
      setIsAddMemberOpen(false);

      // 🔥 Refresh family data
      await fetchFamilies();
    } catch (err) {
      console.error("Failed to add family member:", err);
      alert("Failed to add family member");
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleSaveSettings = async () => {
    const result = familySettingsSchema.safeParse(editingSettings);
    if (!result.success) {
      const errors: Partial<Record<keyof FamilySettingsFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as keyof FamilySettingsFormData;
        errors[path] = error.message;
      });
      setSettingsErrors(errors);
      return;
    }

    setSettings(editingSettings);

    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingSettings.familyName,
          description: "",
          currency: editingSettings.currency,
          monthlyBudget: editingSettings.monthlyBudget,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save settings");
        return;
      }

      setFamilyId(data.family.id);
      setSettingsErrors({});
      setIsSettingsOpen(false);

      await fetchFamilies();
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Family Management
            </h1>
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
                  <DialogDescription>
                    Configure your family budget settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={editingSettings.familyName}
                      onChange={(e) => {
                        setEditingSettings((prev) => ({
                          ...prev,
                          familyName: e.target.value,
                        }));
                        if (settingsErrors.familyName)
                          setSettingsErrors({
                            ...settingsErrors,
                            familyName: undefined,
                          });
                      }}
                      className={
                        settingsErrors.familyName ? "border-red-500" : ""
                      }
                    />
                    {settingsErrors.familyName && (
                      <p className="text-sm text-red-500">
                        {settingsErrors.familyName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={editingSettings.currency}
                      onValueChange={(value) => {
                        setEditingSettings((prev) => ({
                          ...prev,
                          currency: value,
                        }));
                        if (settingsErrors.currency)
                          setSettingsErrors({
                            ...settingsErrors,
                            currency: undefined,
                          });
                      }}
                    >
                      <SelectTrigger
                        id="currency"
                        className={
                          settingsErrors.currency ? "border-red-500" : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    {settingsErrors.currency && (
                      <p className="text-sm text-red-500">
                        {settingsErrors.currency}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                    <Input
                      id="monthlyBudget"
                      type="number"
                      value={editingSettings.monthlyBudget}
                      onChange={(e) => {
                        setEditingSettings((prev) => ({
                          ...prev,
                          monthlyBudget: Number.parseFloat(e.target.value),
                        }));
                        if (settingsErrors.monthlyBudget)
                          setSettingsErrors({
                            ...settingsErrors,
                            monthlyBudget: undefined,
                          });
                      }}
                      className={
                        settingsErrors.monthlyBudget ? "border-red-500" : ""
                      }
                    />
                    {settingsErrors.monthlyBudget && (
                      <p className="text-sm text-red-500">
                        {settingsErrors.monthlyBudget}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
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
                  <DialogDescription>
                    Add a new member to your family budget
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newMember.name}
                      onChange={(e) => {
                        setNewMember((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        if (newMemberErrors.name)
                          setNewMemberErrors({
                            ...newMemberErrors,
                            name: undefined,
                          });
                      }}
                      className={newMemberErrors.name ? "border-red-500" : ""}
                    />
                    {newMemberErrors.name && (
                      <p className="text-sm text-red-500">
                        {newMemberErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={newMember.email}
                      onChange={(e) => {
                        setNewMember((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                        if (newMemberErrors.email)
                          setNewMemberErrors({
                            ...newMemberErrors,
                            email: undefined,
                          });
                      }}
                      className={newMemberErrors.email ? "border-red-500" : ""}
                    />
                    {newMemberErrors.email && (
                      <p className="text-sm text-red-500">
                        {newMemberErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      value={newMember.password || ""}
                      onChange={(e) => {
                        setNewMember((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                        if (newMemberErrors.password)
                          setNewMemberErrors({
                            ...newMemberErrors,
                            password: undefined,
                          });
                      }}
                      className={
                        newMemberErrors.password ? "border-red-500" : ""
                      }
                    />
                    {newMemberErrors.password && (
                      <p className="text-sm text-red-500">
                        {newMemberErrors.password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value) => {
                        setNewMember((prev) => ({
                          ...prev,
                          role: value as "admin" | "member",
                        }));
                        if (newMemberErrors.role)
                          setNewMemberErrors({
                            ...newMemberErrors,
                            role: undefined,
                          });
                      }}
                    >
                      <SelectTrigger
                        id="role"
                        className={newMemberErrors.role ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    {newMemberErrors.role && (
                      <p className="text-sm text-red-500">
                        {newMemberErrors.role}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spendingLimit">
                      Monthly Spending Limit (Optional)
                    </Label>
                    <Input
                      id="spendingLimit"
                      type="number"
                      placeholder="Leave empty for no limit"
                      value={newMember.spendingLimit || ""}
                      onChange={(e) => {
                        setNewMember((prev) => ({
                          ...prev,
                          spendingLimit: e.target.value
                            ? Number(e.target.value)
                            : 0,
                        }));
                        if (newMemberErrors.spendingLimit)
                          setNewMemberErrors({
                            ...newMemberErrors,
                            spendingLimit: undefined,
                          });
                      }}
                      className={
                        newMemberErrors.spendingLimit ? "border-red-500" : ""
                      }
                    />
                    {newMemberErrors.spendingLimit && (
                      <p className="text-sm text-red-500">
                        {newMemberErrors.spendingLimit}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleAddMember}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
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
                  <p className="text-muted-foreground">
                    No family members yet. Add your first member to get started.
                  </p>
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
                                Monthly limit: {settings.currency}{" "}
                                {member.spendingLimit.toFixed(2)}
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
                  <CardTitle className="text-sm font-medium">
                    Monthly Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {settings.currency} {settings.monthlyBudget.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total family monthly budget
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Family Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {members.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {members.filter((m) => m.role === "admin").length} admin(s)
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Member Spending Limits</CardTitle>
                <CardDescription>
                  Monthly spending allocations for each member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members
                    .filter((m) => m.spendingLimit > 0)
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium text-sm">
                          {member.name}
                        </span>
                        <span className="text-sm font-semibold text-accent">
                          {settings.currency} {member.spendingLimit.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  {members.filter((m) => m.spendingLimit > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No spending limits set yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
