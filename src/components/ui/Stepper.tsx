'use client';

import { Fragment } from 'react';
import { Check } from 'lucide-react';

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <ol className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const circleClass = isCompleted
          ? 'bg-green-500 border-green-500 text-white'
          : isCurrent
            ? 'bg-black border-black text-white shadow-md shadow-black/20'
            : 'bg-white border-gray-200 text-gray-400';

        return (
          <Fragment key={step.id}>
            {index > 0 && (
              <span
                className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'
                }`}
                aria-hidden="true"
              />
            )}
            <li className="flex flex-col items-center min-w-0">
              <button
                type="button"
                onClick={() => onStepChange?.(index)}
                disabled={!onStepChange}
                className={`flex flex-col items-center gap-1.5 ${
                  onStepChange ? 'cursor-pointer' : 'cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${circleClass}`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`text-xs whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'font-semibold text-gray-900 dark:text-white'
                      : isCompleted
                        ? 'text-gray-600 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
