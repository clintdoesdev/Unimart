"use client";

import {
  Book,
  FlaskConical,
  Laptop,
  Lamp,
  Bike,
  Shirt,
  Ticket,
  GraduationCap,
  Sofa,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  book: Book,
  "flask-conical": FlaskConical,
  laptop: Laptop,
  lamp: Lamp,
  bike: Bike,
  shirt: Shirt,
  ticket: Ticket,
  "graduation-cap": GraduationCap,
  sofa: Sofa,
};

export function CategoryIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const Icon = ICONS[icon] ?? Book;
  return <Icon size={size} />;
}
