"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MillionaireCalculatorMonthly() {
  // User inputs
  const [startCapital, setStartCapital] = useState<number>(10000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(500);
  const [annualReturnPercent, setAnnualReturnPercent] = useState<number>(8);

  // Calculation result
  const [result, setResult] = useState<{
    months: number;
    years: number;
    restMonths: number;
  } | null>(null);

  // Whether we show the dialog to collect email
  const [showEmailPrompt, setShowEmailPrompt] = useState<boolean>(false);

  // The user's email
  const [email, setEmail] = useState<string>("");

  // Track whether user already subscribed (so we don't prompt again)
  const [hasSubscribed, setHasSubscribed] = useState<boolean>(false);

  // Perform the monthly compounding
  function calculateMonthly(): void {
    let capital: number = startCapital;

    // Convert annual return to monthly
    const monthlyReturn: number = Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1;
    let months: number = 0;
    const maxMonths: number = 12 * 100; // 100 years

    while (capital < 1_000_000 && months < maxMonths) {
      months++;
      // 1) Add monthly investment
      capital += monthlyInvest;
      // 2) Apply monthly interest
      capital *= 1 + monthlyReturn;
    }

    if (capital >= 1_000_000) {
      const years: number = Math.floor(months / 12);
      const restMonths: number = months % 12;
      setResult({ months, years, restMonths });
    } else {
      // Could not reach 1M in 100 years
      setResult(null);
    }
  }

  // Triggered by "Berechnen" button
  function handleCalculate(): void {
    // 1) Calculate the result
    calculateMonthly();

    // 2) If user is *not* subscribed, show email prompt
    if (!hasSubscribed) {
      setShowEmailPrompt(true);
    }
  }

  // Handle email submission
  function handleEmailSubmit(): void {
    if (!email.trim()) return;
    setHasSubscribed(true);
    setShowEmailPrompt(false);
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Become a Millionaire – Monthly Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Capital */}
          <div>
            <Label htmlFor="startCapital">Start Capital (EUR)</Label>
            <Input
              id="startCapital"
              type="number"
              value={startCapital}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStartCapital(Number(e.target.value))
              }
            />
          </div>

          {/* Monthly Investment */}
          <div>
            <Label htmlFor="monthlyInvest">Monthly Investment (EUR)</Label>
            <Input
              id="monthlyInvest"
              type="number"
              value={monthlyInvest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMonthlyInvest(Number(e.target.value))
              }
            />
          </div>

          {/* Annual Return (Slider) */}
          <div>
            <Label>Estimated Annual Return (%): {annualReturnPercent}%</Label>
            <Slider
              value={[annualReturnPercent]}
              onValueChange={(val: number[]) => setAnnualReturnPercent(val[0])}
              min={0}
              max={50}
              step={0.5}
            />
          </div>

          {/* Calculate Button */}
          <Button onClick={handleCalculate}>Berechnen</Button>

          {/* Show the result if the user has subscribed; otherwise, hide it */}
          {hasSubscribed && result !== null && (
            <div className="mt-4 p-3 rounded bg-green-50 text-green-900">
              <p>
                You will reach one million in <strong>{result.months}</strong>{" "}
                months, which is about{" "}
                <strong>
                  {result.years} years and {result.restMonths} months
                </strong>
                .
              </p>
            </div>
          )}

          {/* If user is subscribed but the result is null => not reaching 1M in 100y */}
          {hasSubscribed && result === null && (
            <div className="mt-4 p-3 rounded bg-red-50 text-red-900">
              <p>
                It looks like you won&apos;t reach one million within 100 years at
                these parameters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for collecting email (only appears if !hasSubscribed && showEmailPrompt) */}
      <Dialog open={showEmailPrompt} onOpenChange={setShowEmailPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up for Our Newsletter</DialogTitle>
          </DialogHeader>
          <p className="mb-2 text-sm text-gray-600">
            To get your personal result, please sign up with your email.
            We&apos;ll send you valuable insights, tools, and strategies to help you
            on your financial journey. You only need to subscribe once.
          </p>
          <Input
            type="email"
            placeholder="Your email..."
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="mb-4"
          />
          <Button onClick={handleEmailSubmit}>Get My Results</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}