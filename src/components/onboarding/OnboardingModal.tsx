import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StepGoal } from './StepGoal';
import { StepMetrics } from './StepMetrics';
import { StepActivity } from './StepActivity';
import { StepSummary } from './StepSummary';
import { GoalType, Gender, ActivityLevel, UserProfile } from '../../types';
import { calculateNutritionTargets } from '../../lib/nutritionCalc';
import { useApp } from '../../context/AppContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, saveProfile } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state initialized with profile or defaults
  const [goal, setGoal] = useState<GoalType>(profile?.goal || 'lose');
  const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
  const [age, setAge] = useState<number>(profile?.age || 28);
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile?.currentWeightKg || 78.4);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(profile?.targetWeightKg || 73.0);
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel || 'moderate');

  // Compute live nutrition plan
  const plan = calculateNutritionTargets({
    gender,
    age,
    heightCm,
    weightKg,
    targetWeightKg,
    goal,
    activityLevel: activity,
  });

  const handleFinish = async () => {
    const updatedProfile: UserProfile = {
      id: profile?.id || `user-${Date.now()}`,
      name: profile?.name || 'Mi Perfil',
      gender,
      age,
      heightCm,
      currentWeightKg: weightKg,
      targetWeightKg,
      goal,
      activityLevel: activity,
      weeklyPaceKg: plan.weeklyPaceKg,
      dailyCalorieTarget: plan.dailyCalories,
      dailyProteinTargetGrams: plan.dailyProteinGrams,
      dailyCarbsTargetGrams: plan.dailyCarbsGrams,
      dailyFatTargetGrams: plan.dailyFatGrams,
      dailyWaterTargetMl: profile?.dailyWaterTargetMl || 2500,
      theme: profile?.theme || 'light',
      units: profile?.units || 'metric',
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProfile(updatedProfile);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {step === 1 && (
        <StepGoal
          goal={goal}
          onChange={(newGoal) => setGoal(newGoal)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepMetrics
          gender={gender}
          age={age}
          heightCm={heightCm}
          weightKg={weightKg}
          targetWeightKg={targetWeightKg}
          onChange={(fields) => {
            if (fields.gender) setGender(fields.gender);
            if (fields.age !== undefined) setAge(fields.age);
            if (fields.heightCm !== undefined) setHeightCm(fields.heightCm);
            if (fields.weightKg !== undefined) setWeightKg(fields.weightKg);
            if (fields.targetWeightKg !== undefined) setTargetWeightKg(fields.targetWeightKg);
          }}
          onNext={() => setStep(3)}
          onPrev={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepActivity
          activity={activity}
          onChange={(act) => setActivity(act)}
          onNext={() => setStep(4)}
          onPrev={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepSummary
          plan={plan}
          onFinish={handleFinish}
          onPrev={() => setStep(3)}
        />
      )}
    </Modal>
  );
};
