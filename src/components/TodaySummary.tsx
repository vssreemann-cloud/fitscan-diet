import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Activity, Beef, Sandwich, Droplets } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const TodaySummary = () => {
  const [summary, setSummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [loading, setLoading] = useState(true);

  // Daily goals
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  const fetchTodaySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meals')
        .select('calories, protein, carbs, fat')
        .eq('meal_date', today);

      if (error) throw error;

      if (data) {
        const totals = data.reduce(
          (acc, meal) => ({
            calories: acc.calories + Number(meal.calories || 0),
            protein: acc.protein + Number(meal.protein || 0),
            carbs: acc.carbs + Number(meal.carbs || 0),
            fat: acc.fat + Number(meal.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        setSummary(totals);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const MacroCard = ({ 
    icon: Icon, 
    label, 
    value, 
    goal, 
    unit, 
    color 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    goal: number; 
    unit: string;
    color: string;
  }) => {
    const percentage = Math.min((value / goal) * 100, 100);
    
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`${color} p-2 rounded-lg`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{Math.round(value)}</span>
            <span className="text-sm text-muted-foreground">/ {goal}{unit}</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Today's Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Today's Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard
          icon={Flame}
          label="Calories"
          value={summary.calories}
          goal={goals.calories}
          unit=" kcal"
          color="bg-destructive text-destructive-foreground"
        />
        <MacroCard
          icon={Beef}
          label="Protein"
          value={summary.protein}
          goal={goals.protein}
          unit="g"
          color="bg-primary text-primary-foreground"
        />
        <MacroCard
          icon={Sandwich}
          label="Carbs"
          value={summary.carbs}
          goal={goals.carbs}
          unit="g"
          color="bg-warning text-warning-foreground"
        />
        <MacroCard
          icon={Droplets}
          label="Fat"
          value={summary.fat}
          goal={goals.fat}
          unit="g"
          color="bg-accent text-accent-foreground"
        />
      </div>
    </div>
  );
};

export default TodaySummary;
