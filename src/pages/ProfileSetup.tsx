import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    height: "",
    age: "",
    gender: "",
    activity_level: "",
    health_goal: "",
    target_calories: ""
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      navigate("/");
    }
  };

  const calculateIdealCalories = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender || !formData.activity_level || !formData.health_goal) {
      toast.error("Please fill in all fields to calculate ideal calories");
      return;
    }

    setCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-calories", {
        body: {
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          age: parseInt(formData.age),
          gender: formData.gender,
          activity_level: formData.activity_level,
          health_goal: formData.health_goal
        }
      });

      if (error) throw error;

      setFormData(prev => ({ ...prev, target_calories: data.calories.toString() }));
      toast.success(`Recommended: ${data.calories} calories/day`);
    } catch (error) {
      console.error("Error calculating calories:", error);
      toast.error("Failed to calculate calories");
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      name: formData.name,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.gender || null,
      activity_level: formData.activity_level || null,
      health_goal: formData.health_goal || null,
      target_calories: formData.target_calories ? parseInt(formData.target_calories) : 2000
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile created!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Tell us about yourself to get personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select value={formData.activity_level} onValueChange={(value) => setFormData(prev => ({ ...prev, activity_level: value }))}>
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health-goal">Health Goal</Label>
              <Select value={formData.health_goal} onValueChange={(value) => setFormData(prev => ({ ...prev, health_goal: value }))}>
                <SelectTrigger id="health-goal">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="bulking">Bulking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="calories">Target Calories (per day)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={calculateIdealCalories}
                  disabled={calculating}
                >
                  {calculating ? "Calculating..." : "Calculate for me"}
                </Button>
              </div>
              <Input
                id="calories"
                type="number"
                placeholder="2000"
                value={formData.target_calories}
                onChange={(e) => setFormData(prev => ({ ...prev, target_calories: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;