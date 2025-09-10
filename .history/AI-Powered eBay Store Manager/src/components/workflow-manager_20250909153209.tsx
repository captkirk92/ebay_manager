import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { WorkflowQuestionnaire } from "./workflow-questionnaire";
import { WorkflowTemplateSelector } from "./workflow-template-selector";
import { WorkflowExecutor } from "./workflow-executor";
import { WorkflowTemplate, WorkflowStep } from "../data/workflow-templates";
import { Settings, Play, Plus, History, BarChart3 } from "lucide-react";

interface WorkflowManagerProps {
  onClose: () => void;
}

interface SavedWorkflow {
  id: string;
  name: string;
  workflow: WorkflowStep[];
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export function WorkflowManager({ onClose }: WorkflowManagerProps) {
  const [currentView, setCurrentView] = useState<'templates' | 'custom' | 'executor' | 'saved'>('templates');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowStep[] | null>(null);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  // Load saved workflows from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved-workflows');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          lastUsed: w.lastUsed ? new Date(w.lastUsed) : undefined
        }));
        setSavedWorkflows(parsed);
      } catch (error) {
        console.error('Error loading saved workflows:', error);
      }
    }
  }, []);

  // Save workflows to localStorage
  const saveWorkflow = (workflow: WorkflowStep[], name: string) => {
    const newWorkflow: SavedWorkflow = {
      id: Date.now().toString(),
      name,
      workflow,
      createdAt: new Date(),
      usageCount: 0
    };
    
    const updated = [...savedWorkflows, newWorkflow];
    setSavedWorkflows(updated);
    localStorage.setItem('saved-workflows', JSON.stringify(updated));
  };

  const useWorkflow = (workflowId: string) => {
    const workflow = savedWorkflows.find(w => w.id === workflowId);
    if (workflow) {
      setSelectedWorkflow(workflow.workflow);
      setCurrentView('executor');
      
      // Update usage count
      const updated = savedWorkflows.map(w => 
        w.id === workflowId 
          ? { ...w, usageCount: w.usageCount + 1, lastUsed: new Date() }
          : w
      );
      setSavedWorkflows(updated);
      localStorage.setItem('saved-workflows', JSON.stringify(updated));
    }
  };

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedWorkflow(template.workflow);
    setCurrentView('executor');
    setCurrentOrderId(`ORDER-${Date.now()}`);
  };

  const handleCustomWorkflowComplete = (workflowData: any) => {
    setSelectedWorkflow(workflowData.workflow);
    setCurrentView('executor');
    setCurrentOrderId(`ORDER-${Date.now()}`);
    
    // Auto-save custom workflow
    saveWorkflow(workflowData.workflow, `${workflowData.storeType} Custom Workflow`);
  };

  const handleStepComplete = (stepIndex: number) => {
    console.log(`Step ${stepIndex + 1} completed`);
  };

  const handleWorkflowComplete = () => {
    console.log('Workflow completed!');
    // Could show success message, update order status, etc.
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'templates':
        return (
          <WorkflowTemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onCustomWorkflow={() => setCurrentView('custom')}
            onCancel={onClose}
          />
        );
      
      case 'custom':
        return (
          <WorkflowQuestionnaire
            onComplete={handleCustomWorkflowComplete}
            onCancel={() => setCurrentView('templates')}
          />
        );
      
      case 'executor':
        return selectedWorkflow ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentView('templates')}
              >
                ← Back to Templates
              </Button>
              <Button onClick={onClose}>
                Close Workflow
              </Button>
            </div>
            <WorkflowExecutor
              workflow={selectedWorkflow}
              orderId={currentOrderId}
              onStepComplete={handleStepComplete}
              onWorkflowComplete={handleWorkflowComplete}
            />
          </div>
        ) : null;
      
      case 'saved':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Saved Workflows</h2>
              <Button
                variant="outline"
                onClick={() => setCurrentView('templates')}
              >
                ← Back to Templates
              </Button>
            </div>
            
            {savedWorkflows.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Workflows</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and save workflows to access them quickly later
                  </p>
                  <Button onClick={() => setCurrentView('templates')}>
                    Create Your First Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant="secondary">
                          {workflow.usageCount} uses
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {workflow.createdAt.toLocaleDateString()}
                        {workflow.lastUsed && (
                          <span> • Last used {workflow.lastUsed.toLocaleDateString()}</span>
                        )}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {workflow.workflow.length} steps
                      </div>
                      <div className="space-y-1">
                        {workflow.workflow.slice(0, 3).map((step, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="text-muted-foreground">{step.step}</span>
                          </div>
                        ))}
                        {workflow.workflow.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{workflow.workflow.length - 3} more steps
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => useWorkflow(workflow.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Use Workflow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-background">
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Order Fulfillment Workflows</h1>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Custom</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Saved</span>
            </TabsTrigger>
            <TabsTrigger value="executor" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Execute</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-6">
        {renderCurrentView()}
      </div>
    </div>
  );
}
