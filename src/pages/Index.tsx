import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import TodaySummary from "@/components/TodaySummary";
import RecentMeals from "@/components/RecentMeals";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Utensils className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FitTrack
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">Track your nutrition, reach your goals</p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/add-meal">
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2 hover:border-primary">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Add Meal</h3>
                  <p className="text-sm text-muted-foreground">Photo or manual entry</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/summary">
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2 hover:border-accent">
              <div className="flex items-center gap-4">
                <div className="bg-accent text-accent-foreground p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Daily Summary</h3>
                  <p className="text-sm text-muted-foreground">View your progress</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Today's Overview */}
        <TodaySummary />

        {/* Recent Meals */}
        <RecentMeals />
      </div>
    </div>
  );
};

export default Index;
