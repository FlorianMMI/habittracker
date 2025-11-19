"use client";

import React from 'react';
import HabitForm from '@/app/components/HabitForm';
import { useRouter } from 'next/navigation';

interface HabitFormWrapperProps {
  habit: {
    id: string;
    name: string;
    description?: string;
    frequency: "daily" | "weekly";
  };
  userId: string;
}

export default function HabitFormWrapper({ habit, userId }: HabitFormWrapperProps) {
  const router = useRouter();

  return (
    <HabitForm
      userId={userId}
      habit={habit}
      onCancel={() => router.push('/dashboard')}
      onCreated={() => {
        router.push('/dashboard');
        router.refresh();
      }}
    />
  );
}
