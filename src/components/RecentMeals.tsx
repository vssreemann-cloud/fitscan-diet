import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Meal {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  image_url: string | null;
}

const RecentMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentMeals();
  }, []);

  const fetchRecentMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Meals</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Meals</h2>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No meals logged yet. Start tracking your nutrition!</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Recent Meals</h2>
      <div className="space-y-3">
        {meals.map((meal) => (
          <Card key={meal.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {meal.image_url && (
                <img
                  src={meal.image_url}
                  alt={meal.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{meal.name}</h3>
                  <Badge className={getMealTypeColor(meal.meal_type)} variant="outline">
                    {formatMealType(meal.meal_type)}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{Math.round(meal.calories)} cal</span>
                  <span>P: {Math.round(meal.protein)}g</span>
                  <span>C: {Math.round(meal.carbs)}g</span>
                  <span>F: {Math.round(meal.fat)}g</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(meal.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentMeals;
