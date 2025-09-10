import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, Send, Sparkles, AlertTriangle, TrendingUp, Package, MessageSquare, X, Minimize2, Maximize2, BarChart3, Target, Zap } from "lucide-react";
import { useEbayData } from '../hooks/useEbayData';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  category?: 'suggestion' | 'alert' | 'insight';
}

interface AIAssistantProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function AIAssistant({ isExpanded = false, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your AI Co-Manager. I've detected 3 urgent issues that need your attention. Would you like me to help you prioritize them?",
      timestamp: new Date(Date.now() - 300000),
      category: 'alert'
    },
    {
      id: '2',
      type: 'ai',
      content: "💡 I notice 15 of your listings are underpriced compared to market average. I can automatically optimize pricing for a potential $2,340 revenue increase. Shall I proceed?",
      timestamp: new Date(Date.now() - 120000),
      category: 'suggestion'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { text: "Fix urgent issues", icon: AlertTriangle, color: "text-red-400" },
    { text: "Optimize pricing", icon: TrendingUp, color: "text-green-400" },
    { text: "Process orders", icon: Package, color: "text-blue-400" },
    { text: "Reply to messages", icon: MessageSquare, color: "text-purple-400" }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        category: 'insight'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('urgent') || lowerInput.includes('issue')) {
      return "🚨 I've identified these urgent issues:\n\n1. **5 orders** risk late shipment (ship by 6 PM today)\n2. **2 policy violations** in listing titles\n3. **12 items** with low inventory\n\nI recommend starting with the shipping deadlines. Would you like me to generate shipping labels for the urgent orders?";
    }
    
    if (lowerInput.includes('price') || lowerInput.includes('optimize')) {
      return "💰 **Pricing Analysis Complete**\n\nI've analyzed your 248 listings against market data:\n• 15 items underpriced (avg $23 below market)\n• 8 items overpriced (may need adjustment)\n• Potential revenue increase: $2,340\n\nShall I apply the optimized pricing? I can start with the most impactful changes first.";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what')) {
      return "🤖 **I'm here to help rescue your eBay store!**\n\nI can assist you with:\n• **Urgent issue resolution** - Prevent suspensions\n• **Order management** - Avoid late defects\n• **Customer service** - AI-powered responses\n• **Listing optimization** - Boost visibility & sales\n• **Performance analytics** - Track improvements\n\nWhat would you like to tackle first?";
    }
    
    return "I understand! Let me analyze that for you. Based on your store's current performance, I recommend focusing on the most critical issues first. Would you like me to create an action plan?";
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  if (!isExpanded) {
    // Floating AI assistant button
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          className="size-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Bot className="size-6 text-white" />
        </Button>
        
        {/* AI status indicator */}
        <div className="absolute -top-2 -right-2">
          <div className="size-4 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 size-4 bg-green-400 rounded-full animate-ping"></div>
        </div>
        
        {/* Notification badge */}
        <Badge variant="destructive" className="absolute -top-1 -left-1 px-1 min-w-5 h-5 text-xs">
          3
        </Badge>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] z-50 shadow-2xl border-2 border-blue-600/20 bg-card/95 backdrop-blur">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="size-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm text-card-foreground">AI Co-Manager</CardTitle>
              <div className="flex items-center gap-1">
                <div className="size-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online & analyzing</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onToggle} className="text-muted-foreground hover:text-foreground">
              <Minimize2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted/80 text-foreground border border-border'
                  }`}
                >
                  {message.type === 'ai' && message.category && (
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="size-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                        {message.category}
                      </span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                  <div className={`text-xs opacity-70 mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/80 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-1">
                    <div className="size-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="size-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="size-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2 border-border hover:bg-muted"
                  onClick={() => handleQuickAction(action.text)}
                >
                  <IconComponent className={`size-3 mr-1 ${action.color}`} />
                  {action.text}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your store..."
              className="flex-1 text-sm bg-background border-border"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}