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
      <nav aria-label="Progress" className="mb-8">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step) => (
            <li key={step.name} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 ${
                  step.id <= currentStep ? "border-indigo-600" : "border-gray-200"
                } md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4`}
              >
                <span className={`text-sm font-medium ${step.id <= currentStep ? "text-indigo-600" : "text-gray-500"}`}>
                  Step {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
                <span className="text-sm text-gray-500">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    )
  }
  
  