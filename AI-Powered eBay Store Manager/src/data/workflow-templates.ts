export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  workflow: WorkflowStep[];
  estimatedSetupTime: string;
  complexity: "simple" | "moderate" | "complex";
}

export interface WorkflowStep {
  step: string;
  action:
    | "createMessage"
    | "getMessages"
    | "manualStep"
    | "addShippingFulfillment"
    | "verification"
    | "approveReturn"
    | "cancelOrder";
  instructions: string;
  templateMessage?: string;
  apiEndpoint?: string;
  estimatedTime?: string;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "sticker-shop",
    name: "Sticker & Custom Printing Shop",
    description:
      "Perfect for custom vinyl stickers, decals, and personalized printing",
    icon: "🖼️",
    category: "Custom Products",
    complexity: "moderate",
    estimatedSetupTime: "5 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send thank you message and request artwork upload",
        templateMessage:
          "Hi [Buyer], thank you for your order! To create your custom stickers, please upload your artwork file (JPG, PNG, SVG, or AI format) and let us know your preferred size and cut shape.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Collect Artwork & Confirm Details",
        action: "getMessages",
        instructions:
          "Check buyer messages for artwork file and confirm size/shape preferences",
        estimatedTime: "5 minutes",
      },
      {
        step: "Design & Production",
        action: "manualStep",
        instructions:
          "Open artwork in Adobe Illustrator, resize and prepare for printing, then print stickers using vinyl cutter/printer",
        estimatedTime: "15-30 minutes",
      },
      {
        step: "Packing",
        action: "manualStep",
        instructions:
          'Use rigid mailer or corrugated box. For eBay Standard Envelope: Use flexible paper envelope (3.5" × 5" to 6.125" × 11.5", thickness <0.25"), NO bubble mailers allowed. Ensure stickers are protected from bending.',
        estimatedTime: "5 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Generate USPS First Class label via eBay, upload tracking number",
        estimatedTime: "3 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions:
          'Verify order is marked "Shipped" in eBay and tracking number is active',
        estimatedTime: "1 minute",
      },
    ],
  },
  {
    id: "clothing-store",
    name: "Clothing & Apparel Store",
    description: "Ideal for T-shirts, hoodies, and fashion items",
    icon: "👕",
    category: "Fashion",
    complexity: "simple",
    estimatedSetupTime: "3 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send order confirmation message",
        templateMessage:
          "Hi [Buyer], thank you for your order! We've received your order for [Item] in size [Size] and color [Color]. We'll process and ship it within 1-2 business days.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Inventory Check",
        action: "manualStep",
        instructions:
          "Verify size and color are in stock, check item condition",
        estimatedTime: "3 minutes",
      },
      {
        step: "Packing",
        action: "manualStep",
        instructions:
          'Pack T-shirt in polybag or padded mailer. For multiple items, use corrugated box. Use 2" wide reinforced tape, remove old labels if reusing boxes.',
        estimatedTime: "5 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Print USPS Ground Advantage or Priority Mail label, upload tracking",
        estimatedTime: "3 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions: 'Confirm order is updated to "Shipped" in eBay',
        estimatedTime: "1 minute",
      },
    ],
  },
  {
    id: "electronics-store",
    name: "Electronics & Gadgets Store",
    description:
      "Perfect for phones, tablets, computers, and electronic accessories",
    icon: "🔌",
    category: "Electronics",
    complexity: "complex",
    estimatedSetupTime: "7 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send order confirmation with testing details",
        templateMessage:
          "Hi [Buyer], thank you for your electronics order! We'll test the device to ensure it's working perfectly before shipping. You'll receive tracking info within 1-2 business days.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Testing & Verification",
        action: "manualStep",
        instructions:
          "Test device functionality, check for any issues, verify all accessories included",
        estimatedTime: "10-15 minutes",
      },
      {
        step: "Secure Packing",
        action: "manualStep",
        instructions:
          'Double-box with bubble wrap and foam padding. Inner box with device, outer box with 2" padding on all sides. Add insurance and signature confirmation if item > $200.',
        estimatedTime: "10 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Generate UPS Ground or FedEx label with insurance, upload tracking",
        estimatedTime: "5 minutes",
      },
      {
        step: "Customer Instructions",
        action: "createMessage",
        instructions: "Send care and use instructions to buyer",
        templateMessage:
          "Hi [Buyer], your electronics order has shipped! Tracking: [TrackingNumber]. Please handle with care and follow the included instructions for optimal performance.",
        estimatedTime: "3 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions: "Verify tracking is active and order marked as shipped",
        estimatedTime: "1 minute",
      },
    ],
  },
  {
    id: "collectibles-store",
    name: "Collectibles & Antiques Store",
    description: "Ideal for vintage items, collectibles, and fragile antiques",
    icon: "🏺",
    category: "Collectibles",
    complexity: "complex",
    estimatedSetupTime: "8 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send order confirmation with authenticity details",
        templateMessage:
          "Hi [Buyer], thank you for your collectible purchase! We'll carefully inspect and authenticate the item before shipping. We use premium packaging to ensure safe delivery.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Authentication & Inspection",
        action: "manualStep",
        instructions:
          "Verify authenticity, check condition, document any flaws, prepare certificate if applicable",
        estimatedTime: "15-20 minutes",
      },
      {
        step: "Fragile Packing",
        action: "manualStep",
        instructions:
          'Wrap in acid-free paper, then bubble wrap. Double-box with 2" padding on all sides. Mark as FRAGILE on label. Consider insurance for high-value items.',
        estimatedTime: "15 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Use UPS or FedEx with insurance and signature confirmation, upload tracking",
        estimatedTime: "5 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions:
          "Verify tracking and confirm delivery expectations with buyer",
        estimatedTime: "2 minutes",
      },
    ],
  },
  {
    id: "handmade-crafts",
    name: "Handmade Crafts Store",
    description:
      "Perfect for custom jewelry, pottery, artwork, and handmade items",
    icon: "🎨",
    category: "Handmade",
    complexity: "moderate",
    estimatedSetupTime: "6 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send personalized thank you message",
        templateMessage:
          "Hi [Buyer], thank you for supporting handmade crafts! Your custom [Item] will be carefully crafted and shipped within 3-5 business days. We'll send progress updates!",
        estimatedTime: "2 minutes",
      },
      {
        step: "Custom Creation",
        action: "manualStep",
        instructions:
          "Create the handmade item according to order specifications, take progress photos if desired",
        estimatedTime: "30-60 minutes",
      },
      {
        step: "Quality Check",
        action: "manualStep",
        instructions:
          "Inspect finished item for quality, take final photos, prepare for packaging",
        estimatedTime: "5 minutes",
      },
      {
        step: "Artistic Packing",
        action: "manualStep",
        instructions:
          "Package in attractive presentation box or gift wrapping, include care instructions and artist note",
        estimatedTime: "10 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Generate shipping label, upload tracking, send completion message",
        estimatedTime: "5 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions: "Confirm delivery and request feedback",
        estimatedTime: "2 minutes",
      },
    ],
  },
  {
    id: "books-media",
    name: "Books & Media Store",
    description: "Ideal for books, DVDs, CDs, and educational materials",
    icon: "📚",
    category: "Media",
    complexity: "simple",
    estimatedSetupTime: "3 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send order confirmation",
        templateMessage:
          "Hi [Buyer], thank you for your book/media order! We'll carefully package your items and ship within 1-2 business days.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Condition Check",
        action: "manualStep",
        instructions:
          "Verify item condition matches listing description, check for any damage",
        estimatedTime: "3 minutes",
      },
      {
        step: "Media Packing",
        action: "manualStep",
        instructions:
          "Use padded envelope or corrugated box. For books: protect corners, for media: use bubble wrap to prevent scratching",
        estimatedTime: "5 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Generate USPS Media Mail or Ground Advantage label, upload tracking",
        estimatedTime: "3 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions: "Confirm order shipped and tracking active",
        estimatedTime: "1 minute",
      },
    ],
  },
  {
    id: "jewelry-accessories",
    name: "Jewelry & Accessories Store",
    description:
      "Perfect for rings, necklaces, watches, and fashion accessories",
    icon: "💍",
    category: "Fashion",
    complexity: "moderate",
    estimatedSetupTime: "5 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send elegant order confirmation",
        templateMessage:
          "Hi [Buyer], thank you for your jewelry order! We'll carefully inspect and package your beautiful [Item] for safe delivery.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Quality Inspection",
        action: "manualStep",
        instructions:
          "Inspect jewelry for quality, check clasps and settings, clean if needed",
        estimatedTime: "5 minutes",
      },
      {
        step: "Luxury Packing",
        action: "manualStep",
        instructions:
          "Package in jewelry box or velvet pouch, use padded envelope or small box, add care instructions",
        estimatedTime: "8 minutes",
      },
      {
        step: "Shipping",
        action: "addShippingFulfillment",
        instructions:
          "Use USPS Priority Mail or UPS with insurance, upload tracking",
        estimatedTime: "3 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions: "Confirm delivery and provide care instructions",
        estimatedTime: "2 minutes",
      },
    ],
  },
  {
    id: "dropshipping",
    name: "Dropshipping Store",
    description: "For sellers who use suppliers to fulfill orders",
    icon: "🚚",
    category: "Dropshipping",
    complexity: "simple",
    estimatedSetupTime: "4 minutes",
    workflow: [
      {
        step: "Order Received",
        action: "createMessage",
        instructions: "Send order confirmation",
        templateMessage:
          "Hi [Buyer], thank you for your order! We've received your order and will process it with our supplier. You'll receive tracking information within 2-3 business days.",
        estimatedTime: "2 minutes",
      },
      {
        step: "Supplier Order",
        action: "manualStep",
        instructions:
          "Place order with supplier, provide buyer shipping address, confirm stock availability",
        estimatedTime: "10 minutes",
      },
      {
        step: "Tracking Update",
        action: "addShippingFulfillment",
        instructions: "Upload tracking number once supplier provides it",
        estimatedTime: "3 minutes",
      },
      {
        step: "Order Complete",
        action: "verification",
        instructions: "Monitor delivery and handle any issues with supplier",
        estimatedTime: "2 minutes",
      },
    ],
  },
];

export const WORKFLOW_CATEGORIES = [
  { id: "all", name: "All Templates", icon: "📦" },
  { id: "Custom Products", name: "Custom Products", icon: "🎨" },
  { id: "Fashion", name: "Fashion", icon: "👕" },
  { id: "Electronics", name: "Electronics", icon: "🔌" },
  { id: "Collectibles", name: "Collectibles", icon: "🏺" },
  { id: "Handmade", name: "Handmade", icon: "🎨" },
  { id: "Media", name: "Media", icon: "📚" },
  { id: "Dropshipping", name: "Dropshipping", icon: "🚚" },
];

export function getWorkflowTemplate(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((template) => template.id === id);
}

export function getWorkflowTemplatesByCategory(
  category: string
): WorkflowTemplate[] {
  if (category === "all") {
    return WORKFLOW_TEMPLATES;
  }
  return WORKFLOW_TEMPLATES.filter(
    (template) => template.category === category
  );
}
