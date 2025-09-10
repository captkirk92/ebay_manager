import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Clock, Zap, Settings, ArrowRight, Search, Filter } from "lucide-react";
import { WORKFLOW_TEMPLATES, WORKFLOW_CATEGORIES, WorkflowTemplate } from "../data/workflow-templates";

interface WorkflowTemplateSelectorProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onCustomWorkflow: () => void;
  onCancel: () => void;
}

export function WorkflowTemplateSelector({ 
  onSelectTemplate, 
  onCustomWorkflow, 
  onCancel 
}: WorkflowTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  const filteredTemplates = WORKFLOW_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return '⚡';
      case 'moderate': return '⚙️';
      case 'complex': return '🔧';
      default: return '📋';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Workflow Template</h2>
        <p className="text-muted-foreground">
          Select a pre-made workflow that matches your store type, or create a custom one
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workflow templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOW_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center space-x-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate?.id === template.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                </div>
                <Badge className={getComplexityColor(template.complexity)}>
                  {getComplexityIcon(template.complexity)} {template.complexity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.estimatedSetupTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Settings className="h-3 w-3" />
                  <span>{template.workflow.length} steps</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Workflow Steps:</p>
                <div className="space-y-1">
                  {template.workflow.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{step.step}</span>
                    </div>
                  ))}
                  {template.workflow.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.workflow.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Workflow Option */}
      <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Need Something Custom?</h3>
              <p className="text-sm text-muted-foreground">
                Create a personalized workflow tailored to your specific business needs
              </p>
            </div>
            <Button variant="outline" onClick={onCustomWorkflow}>
              Build Custom Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex space-x-2">
          <Button 
            onClick={() => selectedTemplate && onSelectTemplate(selectedTemplate)}
            disabled={!selectedTemplate}
          >
            Use Selected Template
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedTemplate.icon}</span>
              <span>Preview: {selectedTemplate.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Workflow Steps:</h4>
                  <div className="space-y-2">
                    {selectedTemplate.workflow.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 text-sm">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{step.step}</p>
                          <p className="text-muted-foreground text-xs">{step.instructions}</p>
                          {step.estimatedTime && (
                            <p className="text-xs text-blue-600 flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{step.estimatedTime}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Template Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexity:</span>
                      <Badge className={getComplexityColor(selectedTemplate.complexity)}>
                        {getComplexityIcon(selectedTemplate.complexity)} {selectedTemplate.complexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Setup Time:</span>
                      <span>{selectedTemplate.estimatedSetupTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Steps:</span>
                      <span>{selectedTemplate.workflow.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedTemplate.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
