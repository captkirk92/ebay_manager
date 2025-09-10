import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle, Clock, AlertCircle, Play, Pause, RotateCcw, MessageSquare, Package, Truck, Settings } from "lucide-react";
import { WorkflowStep } from "../data/workflow-templates";

interface WorkflowExecutorProps {
  workflow: WorkflowStep[];
  orderId: string;
  onStepComplete: (stepIndex: number) => void;
  onWorkflowComplete: () => void;
}

interface StepStatus {
  completed: boolean;
  inProgress: boolean;
  error?: string;
  completedAt?: Date;
  notes?: string;
}

export function WorkflowExecutor({ 
  workflow, 
  orderId, 
  onStepComplete, 
  onWorkflowComplete 
}: WorkflowExecutorProps) {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    workflow.map(() => ({ completed: false, inProgress: false }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stepNotes, setStepNotes] = useState<string[]>(workflow.map(() => ''));

  const completedSteps = stepStatuses.filter(status => status.completed).length;
  const progressPercentage = (completedSteps / workflow.length) * 100;
  const isWorkflowComplete = completedSteps === workflow.length;

  const handleStepStart = (stepIndex: number) => {
    setStepStatuses(prev => prev.map((status, index) => 
      index === stepIndex 
        ? { ...status, inProgress: true, error: undefined }
        : { ...status, inProgress: false }
    ));
    setCurrentStepIndex(stepIndex);
  };

  const handleStepComplete = (stepIndex: number) => {
    setStepStatuses(prev => prev.map((status, index) => 
      index === stepIndex 
        ? { 
            ...status, 
            completed: true, 
            inProgress: false, 
            completedAt: new Date() 
          }
        : status
    ));
    onStepComplete(stepIndex);
    
    // Auto-advance to next step if not paused
    if (!isPaused && stepIndex < workflow.length - 1) {
      setTimeout(() => {
        handleStepStart(stepIndex + 1);
      }, 1000);
    }
  };

  const handleStepError = (stepIndex: number, error: string) => {
    setStepStatuses(prev => prev.map((status, index) => 
      index === stepIndex 
        ? { ...status, inProgress: false, error }
        : status
    ));
  };

  const handleRetryStep = (stepIndex: number) => {
    setStepStatuses(prev => prev.map((status, index) => 
      index === stepIndex 
        ? { ...status, error: undefined, inProgress: true }
        : status
    ));
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      setStepStatuses(prev => prev.map(status => ({ ...status, inProgress: false })));
    }
  };

  const handleReset = () => {
    setStepStatuses(workflow.map(() => ({ completed: false, inProgress: false })));
    setCurrentStepIndex(0);
    setIsPaused(false);
    setStepNotes(workflow.map(() => ''));
  };

  const getStepIcon = (step: WorkflowStep, status: StepStatus, index: number) => {
    if (status.completed) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status.inProgress) return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    if (status.error) return <AlertCircle className="h-5 w-5 text-red-500" />;
    return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs font-medium">{index + 1}</div>;
  };

  const getStepActionIcon = (action: string) => {
    switch (action) {
      case 'createMessage': return <MessageSquare className="h-4 w-4" />;
      case 'getMessages': return <MessageSquare className="h-4 w-4" />;
      case 'manualStep': return <Settings className="h-4 w-4" />;
      case 'addShippingFulfillment': return <Truck className="h-4 w-4" />;
      case 'verification': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const executeStepAction = async (step: WorkflowStep, stepIndex: number) => {
    try {
      // Simulate API calls based on step action
      switch (step.action) {
        case 'createMessage':
          // Simulate sending message
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        case 'getMessages':
          // Simulate checking messages
          await new Promise(resolve => setTimeout(resolve, 1500));
          break;
        case 'addShippingFulfillment':
          // Simulate shipping API call
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        case 'verification':
          // Simulate verification
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        default:
          // Manual steps - just wait a bit
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      handleStepComplete(stepIndex);
    } catch (error) {
      handleStepError(stepIndex, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (isWorkflowComplete) {
      onWorkflowComplete();
    }
  }, [isWorkflowComplete, onWorkflowComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6" />
                <span>Order Fulfillment Workflow</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                disabled={isWorkflowComplete}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isWorkflowComplete}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedSteps} of {workflow.length} steps completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflow.map((step, index) => {
          const status = stepStatuses[index];
          const isCurrentStep = currentStepIndex === index;
          const canStart = index === 0 || stepStatuses[index - 1]?.completed;
          
          return (
            <Card 
              key={index} 
              className={`transition-all duration-200 ${
                status.completed 
                  ? 'border-green-200 bg-green-50' 
                  : status.inProgress 
                    ? 'border-blue-200 bg-blue-50' 
                    : status.error
                      ? 'border-red-200 bg-red-50'
                      : 'border-muted'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {getStepIcon(step, status, index)}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{step.step}</h3>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {getStepActionIcon(step.action)}
                          <span className="text-xs">{step.action}</span>
                        </Badge>
                        {step.estimatedTime && (
                          <Badge variant="secondary" className="text-xs">
                            {step.estimatedTime}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {status.completed && (
                          <span className="text-xs text-green-600">
                            Completed {status.completedAt?.toLocaleTimeString()}
                          </span>
                        )}
                        {status.error && (
                          <span className="text-xs text-red-600">
                            Error: {status.error}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{step.instructions}</p>
                    
                    {step.templateMessage && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Template Message:</p>
                        <p className="text-sm italic">"{step.templateMessage}"</p>
                      </div>
                    )}
                    
                    {/* Step Notes */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Notes:</label>
                      <textarea
                        className="w-full p-2 text-xs border rounded resize-none"
                        placeholder="Add notes about this step..."
                        value={stepNotes[index]}
                        onChange={(e) => {
                          const newNotes = [...stepNotes];
                          newNotes[index] = e.target.value;
                          setStepNotes(newNotes);
                        }}
                        rows={2}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {!status.completed && !status.inProgress && canStart && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (step.action === 'manualStep') {
                              handleStepStart(index);
                            } else {
                              executeStepAction(step, index);
                            }
                          }}
                          disabled={isPaused && !isCurrentStep}
                        >
                          {step.action === 'manualStep' ? 'Mark as Started' : 'Execute Step'}
                        </Button>
                      )}
                      
                      {status.inProgress && step.action === 'manualStep' && (
                        <Button
                          size="sm"
                          onClick={() => handleStepComplete(index)}
                        >
                          Mark as Complete
                        </Button>
                      )}
                      
                      {status.error && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryStep(index)}
                        >
                          Retry
                        </Button>
                      )}
                      
                      {status.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStepStatuses(prev => prev.map((s, i) => 
                              i === index ? { ...s, completed: false, inProgress: false } : s
                            ));
                          }}
                        >
                          Undo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {isWorkflowComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Workflow Complete!</h3>
            <p className="text-green-700">
              All steps have been completed successfully. Order {orderId} is ready for delivery.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
