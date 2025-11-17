import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Flame, Beef, Sandwich, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Meal {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

const Summary = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  const fetchTodayMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('meal_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + Number(meal.calories || 0),
      protein: acc.protein + Number(meal.protein || 0),
      carbs: acc.carbs + Number(meal.carbs || 0),
      fat: acc.fat + Number(meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-warning/10 text-warning border-warning/20",
      morning_snack: "bg-accent/10 text-accent border-accent/20",
      lunch: "bg-primary/10 text-primary border-primary/20",
      snack: "bg-secondary text-secondary-foreground",
      dinner: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const formatMealType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const MacroSummary = ({ 
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
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${color} p-3 rounded-xl`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">{label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{Math.round(value)}</span>
              <span className="text-muted-foreground">/ {goal}{unit}</span>
            </div>
          </div>
        </div>
        <Progress value={percentage} className="h-3" />
        <div className="text-right text-sm text-muted-foreground mt-2">
          {Math.round(percentage)}%
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Daily Summary
        </h1>
        <p className="text-muted-foreground mb-8">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Macro Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <MacroSummary
            icon={Flame}
            label="Calories"
            value={totals.calories}
            goal={goals.calories}
            unit=" kcal"
            color="bg-destructive text-destructive-foreground"
          />
          <MacroSummary
            icon={Beef}
            label="Protein"
            value={totals.protein}
            goal={goals.protein}
            unit="g"
            color="bg-primary text-primary-foreground"
          />
          <MacroSummary
            icon={Sandwich}
            label="Carbs"
            value={totals.carbs}
            goal={goals.carbs}
            unit="g"
            color="bg-warning text-warning-foreground"
          />
          <MacroSummary
            icon={Droplets}
            label="Fat"
            value={totals.fat}
            goal={goals.fat}
            unit="g"
            color="bg-accent text-accent-foreground"
          />
        </div>

        {/* Meal Breakdown */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Today's Meals</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-16 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : meals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No meals logged today. Start tracking your nutrition!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <Card key={meal.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{meal.name}</h3>
                        <Badge className={getMealTypeColor(meal.meal_type)} variant="outline">
                          {formatMealType(meal.meal_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meal.created_at).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">{Math.round(meal.calories)}</div>
                      <div className="text-xs text-muted-foreground">calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{Math.round(meal.protein)}</div>
                      <div className="text-xs text-muted-foreground">protein (g)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">{Math.round(meal.carbs)}</div>
                      <div className="text-xs text-muted-foreground">carbs (g)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{Math.round(meal.fat)}</div>
                      <div className="text-xs text-muted-foreground">fat (g)</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
