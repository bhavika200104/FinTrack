import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  highlighted?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  highlighted = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col border-2 h-full",
        highlighted
          ? "border-emerald-600 shadow-lg scale-105"
          : "border-gray-200 shadow-md"
      )}
    >
      <CardHeader className={cn("pb-8", highlighted && "bg-emerald-50")}>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{price}</span>
            {period && <span className="text-gray-500">/{period}</span>}
          </div>
          <p className="text-sm text-gray-500 pt-2">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Link href="https://fintrack.sannty.in/register" className="w-full">
          <Button
            variant={buttonVariant}
            className={cn(
              "w-full",
              highlighted &&
                "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:text-white"
            )}
            disabled={disabled}
          >
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
