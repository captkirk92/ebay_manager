import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Bot, ArrowRight } from "lucide-react";

interface WorkflowQuestionnaireProps {
  onComplete: (workflow: any) => void;
  onCancel: () => void;
}

interface QuestionnaireAnswers {
  productType: string;
  customization: boolean;
  customizationDetails: string;
  packaging: string[];
  standardEnvelope: boolean;
  shippingMethods: string[];
  fulfillmentType: string;
  thankYouMessage: boolean;
  specialHandling: string[];
  tools: string[];
  verificationMethod: string;
  customRequirements: string;
}

const PRODUCT_TYPES = [
  { value: "stickers", label: "Stickers & Custom Printing", icon: "🖼️" },
  { value: "clothing", label: "Clothing & Apparel", icon: "👕" },
  { value: "electronics", label: "Electronics & Gadgets", icon: "🔌" },
  { value: "collectibles", label: "Collectibles & Antiques", icon: "🏺" },
  { value: "handmade", label: "Handmade Crafts", icon: "🎨" },
  { value: "books", label: "Books & Media", icon: "📚" },
  { value: "jewelry", label: "Jewelry & Accessories", icon: "💍" },
  { value: "home", label: "Home & Garden", icon: "🏠" },
  { value: "other", label: "Other", icon: "📦" }
];

const PACKAGING_OPTIONS = [
  { value: "polybag", label: "Polybag (for clothing, soft items)" },
  { value: "rigid_mailer", label: "Rigid Mailer (for flat items)" },
  { value: "corrugated_box", label: "Corrugated Box (for fragile items)" },
  { value: "bubble_mailer", label: "Bubble Mailer (for small fragile items)" },
  { value: "padded_envelope", label: "Padded Envelope (for books, media)" },
  { value: "double_box", label: "Double Boxing (for electronics, fragile)" }
];

const SHIPPING_METHODS = [
  { value: "usps_first_class", label: "USPS First Class Mail" },
  { value: "usps_priority", label: "USPS Priority Mail" },
  { value: "usps_ground_advantage", label: "USPS Ground Advantage" },
  { value: "ups_ground", label: "UPS Ground" },
  { value: "ups_2day", label: "UPS 2-Day" },
  { value: "fedex_ground", label: "FedEx Ground" },
  { value: "ebay_standard_envelope", label: "eBay Standard Envelope" },
  { value: "ebay_international", label: "eBay International Standard" }
];

const SPECIAL_HANDLING = [
  { value: "fragile", label: "Fragile Items" },
  { value: "high_value", label: "High Value (requires insurance)" },
  { value: "authenticity", label: "Authenticity Verification" },
  { value: "hazardous", label: "Hazardous Materials" },
  { value: "signature_required", label: "Signature Required" },
  { value: "temperature_controlled", label: "Temperature Controlled" }
];

const TOOLS = [
  { value: "adobe_illustrator", label: "Adobe Illustrator" },
  { value: "photoshop", label: "Adobe Photoshop" },
  { value: "label_printer", label: "Label Printer" },
  { value: "inventory_system", label: "Inventory Management System" },
  { value: "design_software", label: "Other Design Software" },
  { value: "shipping_software", label: "Shipping Software" }
];

export function WorkflowQuestionnaire({ onComplete, onCancel }: WorkflowQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    productType: "",
    customization: false,
    customizationDetails: "",
    packaging: [],
    standardEnvelope: false,
    shippingMethods: [],
    fulfillmentType: "",
    thankYouMessage: false,
    specialHandling: [],
    tools: [],
    verificationMethod: "",
    customRequirements: ""
  });

  const steps = [
    { title: "Product Type", description: "What do you sell?" },
    { title: "Customization", description: "Do you need buyer input?" },
    { title: "Packaging", description: "How do you pack items?" },
    { title: "Shipping", description: "What shipping methods?" },
    { title: "Fulfillment", description: "How do you fulfill orders?" },
    { title: "Communication", description: "Customer messaging?" },
    { title: "Special Handling", description: "Any special requirements?" },
    { title: "Tools & Verification", description: "Workflow tools and completion" }
  ];

  const handleAnswerChange = (field: keyof QuestionnaireAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateWorkflow();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateWorkflow = () => {
    const workflow = createWorkflowFromAnswers(answers);
    onComplete(workflow);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What type of products do you sell?</Label>
            <RadioGroup value={answers.productType} onValueChange={(value) => handleAnswerChange('productType', value)}>
              {PRODUCT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-xl">{type.icon}</span>
                    <span>{type.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Do your products require customization or buyer input before shipping?</Label>
            <RadioGroup value={answers.customization.toString()} onValueChange={(value) => handleAnswerChange('customization', value === 'true')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="true" id="customization-yes" />
                <Label htmlFor="customization-yes" className="cursor-pointer">Yes - I need buyer input (artwork, personalization, etc.)</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="false" id="customization-no" />
                <Label htmlFor="customization-no" className="cursor-pointer">No - Items are ready to ship as-is</Label>
              </div>
            </RadioGroup>
            {answers.customization && (
              <div className="space-y-2">
                <Label>What kind of customization do you need?</Label>
                <Textarea
                  placeholder="e.g., Artwork upload, engraving text, size confirmation, color preferences..."
                  value={answers.customizationDetails}
                  onChange={(e) => handleAnswerChange('customizationDetails', e.target.value)}
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">How do you usually package your items for shipping?</Label>
            <div className="space-y-2">
              {PACKAGING_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={option.value}
                    checked={answers.packaging.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswerChange('packaging', [...answers.packaging, option.value]);
                      } else {
                        handleAnswerChange('packaging', answers.packaging.filter(p => p !== option.value));
                      }
                    }}
                  />
                  <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label className="text-sm font-medium">eBay Standard Envelope Eligibility</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="standard-envelope"
                  checked={answers.standardEnvelope}
                  onCheckedChange={(checked) => handleAnswerChange('standardEnvelope', checked)}
                />
                <Label htmlFor="standard-envelope" className="text-sm cursor-pointer">
                  I use eBay Standard Envelope for small/light items (≤3 oz, specific dimensions)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Note: Bubble mailers are not allowed for eBay Standard Envelope
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What shipping carriers and methods do you usually use?</Label>
            <div className="space-y-2">
              {SHIPPING_METHODS.map((method) => (
                <div key={method.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={method.value}
                    checked={answers.shippingMethods.includes(method.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswerChange('shippingMethods', [...answers.shippingMethods, method.value]);
                      } else {
                        handleAnswerChange('shippingMethods', answers.shippingMethods.filter(s => s !== method.value));
                      }
                    }}
                  />
                  <Label htmlFor={method.value} className="cursor-pointer">{method.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">How do you fulfill orders?</Label>
            <RadioGroup value={answers.fulfillmentType} onValueChange={(value) => handleAnswerChange('fulfillmentType', value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="self_fulfill" id="self-fulfill" />
                <Label htmlFor="self-fulfill" className="cursor-pointer">I pack and ship items myself</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="fulfillment_service" id="fulfillment-service" />
                <Label htmlFor="fulfillment-service" className="cursor-pointer">I use a fulfillment service (3PL)</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="dropship" id="dropship" />
                <Label htmlFor="dropship" className="cursor-pointer">I dropship from suppliers</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Customer Communication</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <Checkbox
                  id="thank-you"
                  checked={answers.thankYouMessage}
                  onCheckedChange={(checked) => handleAnswerChange('thankYouMessage', checked)}
                />
                <Label htmlFor="thank-you" className="cursor-pointer">I send a thank you or confirmation message when an order is received</Label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Are there any special handling requirements for your products?</Label>
            <div className="space-y-2">
              {SPECIAL_HANDLING.map((handling) => (
                <div key={handling.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={handling.value}
                    checked={answers.specialHandling.includes(handling.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswerChange('specialHandling', [...answers.specialHandling, handling.value]);
                      } else {
                        handleAnswerChange('specialHandling', answers.specialHandling.filter(h => h !== handling.value));
                      }
                    }}
                  />
                  <Label htmlFor={handling.value} className="cursor-pointer">{handling.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What tools or software do you use in your workflow?</Label>
            <div className="space-y-2">
              {TOOLS.map((tool) => (
                <div key={tool.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={tool.value}
                    checked={answers.tools.includes(tool.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAnswerChange('tools', [...answers.tools, tool.value]);
                      } else {
                        handleAnswerChange('tools', answers.tools.filter(t => t !== tool.value));
                      }
                    }}
                  />
                  <Label htmlFor={tool.value} className="cursor-pointer">{tool.label}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>How do you verify that an order is complete?</Label>
              <Select value={answers.verificationMethod} onValueChange={(value) => handleAnswerChange('verificationMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tracking_uploaded">Once tracking is uploaded</SelectItem>
                  <SelectItem value="buyer_confirms">Once buyer confirms delivery</SelectItem>
                  <SelectItem value="manual_check">Once I manually check it off</SelectItem>
                  <SelectItem value="fulfillment_service">Fulfillment service handles it</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Any other specific requirements or notes?</Label>
              <Textarea
                placeholder="e.g., Special packaging instructions, quality control steps, etc."
                value={answers.customRequirements}
                onChange={(e) => handleAnswerChange('customRequirements', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-6 w-6" />
          <span>Custom Workflow Setup</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>•</span>
          <span>{steps[currentStep].title}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Generate Workflow' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// AI Workflow Generation Logic
function createWorkflowFromAnswers(answers: QuestionnaireAnswers) {
  const baseWorkflow = {
    storeType: answers.productType,
    customization: answers.customization,
    packaging: answers.packaging,
    shippingMethods: answers.shippingMethods,
    fulfillmentType: answers.fulfillmentType,
    specialHandling: answers.specialHandling,
    tools: answers.tools,
    verificationMethod: answers.verificationMethod,
    customRequirements: answers.customRequirements
  };

  const steps = [];

  // Step 1: Order Received
  if (answers.thankYouMessage) {
    steps.push({
      step: "Order Received",
      action: "createMessage",
      instructions: "Send thank you message and order confirmation to buyer.",
      templateMessage: "Hi [Buyer], thank you for your order! We've received your order and will begin processing it shortly. Order #: [OrderID]"
    });
  }

  // Step 2: Customization (if needed)
  if (answers.customization) {
    steps.push({
      step: "Collect Customization Details",
      action: "createMessage",
      instructions: `Request buyer input: ${answers.customizationDetails}`,
      templateMessage: `Hi [Buyer], thanks for your order! To create your custom item, please provide: ${answers.customizationDetails}`
    });
    steps.push({
      step: "Validate Customization",
      action: "getMessages",
      instructions: "Check buyer messages for required customization details and files."
    });
  }

  // Step 3: Inventory Check (if self-fulfilling)
  if (answers.fulfillmentType === "self_fulfill") {
    steps.push({
      step: "Inventory Check",
      action: "manualStep",
      instructions: "Verify item availability and condition before packing."
    });
  }

  // Step 4: Production/Preparation
  if (answers.customization || answers.tools.length > 0) {
    steps.push({
      step: "Production/Preparation",
      action: "manualStep",
      instructions: `Complete production using: ${answers.tools.join(', ')}. ${answers.customization ? 'Process customization details from buyer.' : ''}`
    });
  }

  // Step 5: Packing
  const packagingInstructions = generatePackagingInstructions(answers);
  steps.push({
    step: "Packing",
    action: "manualStep",
    instructions: packagingInstructions
  });

  // Step 6: Shipping
  steps.push({
    step: "Shipping",
    action: "addShippingFulfillment",
    instructions: `Generate shipping label using ${answers.shippingMethods.join(' or ')} and upload tracking.`
  });

  // Step 7: Order Complete
  steps.push({
    step: "Order Complete",
    action: "verification",
    instructions: `Verify order completion: ${answers.verificationMethod}`
  });

  return {
    ...baseWorkflow,
    workflow: steps,
    createdAt: new Date().toISOString()
  };
}

function generatePackagingInstructions(answers: QuestionnaireAnswers): string {
  let instructions = "Pack item securely using appropriate packaging:\n\n";
  
  // eBay Standard Envelope rules
  if (answers.standardEnvelope) {
    instructions += "• For eBay Standard Envelope: Use flexible paper envelope (3.5\" × 5\" to 6.125\" × 11.5\", thickness <0.25\"), NO bubble mailers allowed\n";
  }
  
  // Packaging type specific instructions
  if (answers.packaging.includes("corrugated_box")) {
    instructions += "• For corrugated boxes: Use new box slightly larger than item, wrap with bubble wrap/foam, no empty space to prevent shifting\n";
  }
  
  if (answers.packaging.includes("rigid_mailer")) {
    instructions += "• For rigid mailers: Ensure item is flat and won't bend, add protection if needed\n";
  }
  
  if (answers.packaging.includes("double_box")) {
    instructions += "• For double boxing: Inner box with cushioning, outer box with 2\" padding on all sides\n";
  }
  
  // Special handling
  if (answers.specialHandling.includes("fragile")) {
    instructions += "• Mark as FRAGILE on label\n";
  }
  
  if (answers.specialHandling.includes("high_value")) {
    instructions += "• Add insurance and signature confirmation if item > $200\n";
  }
  
  // General eBay rules
  instructions += "• Use 2\" wide reinforced tape, remove old labels if reusing boxes\n";
  instructions += "• Accurately measure and round up dimensions/weight to avoid surcharges\n";
  
  return instructions;
}
