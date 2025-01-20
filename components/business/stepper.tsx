import { Check } from "lucide-react"

interface Step {
  id: number
  name: string
  description: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-24"> {/* Added margin-bottom to create space for labels */}
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          
          return (
            <li key={step.name} className={`relative flex items-center ${
              index === steps.length - 1 ? 'flex-1' : 'flex-1'
            }`}>
              <div className="group flex w-full items-center">
                {/* Step with Number/Check */}
                <div className="relative flex flex-col items-center flex-1">
                  <div 
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-full
                      ${isCompleted ? 'bg-indigo-600' : isCurrent ? 'border-2 border-indigo-600' : 'border-2 border-gray-300'} 
                      ${isCurrent ? 'bg-white' : ''} 
                      transition-colors duration-200
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span className={`text-sm font-medium ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute w-32 top-10"> {/* Changed from -bottom-10 to top-10 for better spacing */}
                    <p 
                      className={`text-xs font-medium text-center mb-0.5 ${
                        isCompleted || isCurrent ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div 
                      className={`
                        h-[2px] w-full
                        ${isCompleted ? 'bg-indigo-600' : 'bg-gray-300'}
                      `}
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}