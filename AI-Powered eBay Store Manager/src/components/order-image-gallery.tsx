import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Image as ImageIcon, Package, MessageSquare } from "lucide-react";

interface OrderImage {
  id: string;
  orderId: string;
  imageUrl: string;
  messageId: string;
  timestamp: Date;
  category?: string;
}

interface OrderImageGalleryProps {
  orderImages: OrderImage[];
  onImageClick?: (image: OrderImage) => void;
}

export function OrderImageGallery({ orderImages, onImageClick }: OrderImageGalleryProps) {
  // Group images by category
  const groupedImages = orderImages.reduce((acc, img) => {
    const category = img.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(img);
    return acc;
  }, {} as Record<string, OrderImage[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Order Images Gallery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {Object.entries(groupedImages).map(([category, images]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <div className="relative w-16 h-16">
                          <img
                            src={image.imageUrl}
                            alt={`Order ${image.orderId}`}
                            className="object-cover w-full h-full rounded cursor-pointer"
                            onClick={() => onImageClick?.(image)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{image.orderId}</TableCell>
                      <TableCell>{new Date(image.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onImageClick?.(image)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* Navigate to order */}}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* Navigate to message */}}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
