import { useState, useEffect } from 'react';
import { useEbayData } from './useEbayData';
import { OrdersResponse, OrderItem } from '../types/api';

interface MessageImage {
  id: string;
  url: string;
  messageId: string;
  timestamp: Date;
  text?: string; // Context from the message
}

interface OrderImage {
  id: string;
  orderId: string;
  imageUrl: string;
  messageId: string;
  timestamp: Date;
  category?: string;
}

export function useMessageImageProcessor() {
  const [messageImages, setMessageImages] = useState<MessageImage[]>([]);
  const [orderImages, setOrderImages] = useState<OrderImage[]>([]);
  const { orders } = useEbayData();

  // Extract images from messages
  const processMessages = (messages: any[]) => {
    const images: MessageImage[] = [];
    
    messages.forEach(message => {
      // Check for direct image attachments
      if (message.attachments?.length > 0) {
        message.attachments.forEach((attachment: any) => {
          if (attachment.contentType?.startsWith('image/')) {
            images.push({
              id: `${message.id}-${attachment.id}`,
              url: attachment.url,
              messageId: message.id,
              timestamp: new Date(message.timestamp),
              text: message.content
            });
          }
        });
      }
      
      // Check for image URLs in message content
      const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;
      const imageUrls = message.content?.match(urlRegex) || [];
      
      imageUrls.forEach((url: string) => {
        images.push({
          id: `${message.id}-${Date.now()}`,
          url,
          messageId: message.id,
          timestamp: new Date(message.timestamp),
          text: message.content
        });
      });
    });

    setMessageImages(images);
  };

  // Match images with orders based on context
  const matchImagesWithOrders = () => {
    if (!orders || !messageImages.length) return;

    const matched: OrderImage[] = [];

    messageImages.forEach(image => {
      // Try to find matching order by ID in message text
      const orderMatch = orders?.items?.find((order: OrderItem) => {
        const orderIdRegex = new RegExp(order.orderId, 'i');
        return image.text?.match(orderIdRegex);
      });

      if (orderMatch) {
        matched.push({
          id: image.id,
          orderId: orderMatch.orderId,
          imageUrl: image.url,
          messageId: image.messageId,
          timestamp: image.timestamp,
          category: orderMatch.status || 'Pending'
        });
      } else {
        // If no direct match, store as unmatched
        matched.push({
          id: image.id,
          orderId: 'Unmatched',
          imageUrl: image.url,
          messageId: image.messageId,
          timestamp: image.timestamp,
          category: 'Unmatched'
        });
      }
    });

    setOrderImages(matched);
  };

  useEffect(() => {
    if (messageImages.length && orders) {
      matchImagesWithOrders();
    }
  }, [messageImages, orders]);

  return {
    processMessages,
    orderImages,
  };
}
