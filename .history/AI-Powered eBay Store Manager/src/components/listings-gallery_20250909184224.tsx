import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useEbayData } from "../hooks/useEbayData";
import {
  ExternalLink,
  Eye,
  DollarSign,
  Package,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ListingWithImages {
  ItemID: string;
  Title: string;
  CurrentPrice: number;
  Quantity: number;
  ViewItemURL: string;
  images: string[];
  description?: string;
}

export function ListingsGallery() {
  const { listings, isListingsLoading, listingsError } = useEbayData();
  const [listingsWithImages, setListingsWithImages] = useState<
    ListingWithImages[]
  >([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedListing, setSelectedListing] =
    useState<ListingWithImages | null>(null);

  const extractImagesFromDescription = (description: string): string[] => {
    const imageUrls: string[] = [];

    // Extract images from img tags
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(description)) !== null) {
      imageUrls.push(match[1]);
    }

    return imageUrls;
  };

  const fetchListingDetails = async (
    itemId: string
  ): Promise<ListingWithImages | null> => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/store/listing/${itemId}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const item = result.data;
        let images: string[] = [];

        // Get images from PictureURL array
        if (item.PictureURL && Array.isArray(item.PictureURL)) {
          images = [...item.PictureURL];
        } else if (item.PictureURL) {
          images = [item.PictureURL];
        }

        // Extract additional images from description
        if (item.Description) {
          const descriptionImages = extractImagesFromDescription(
            item.Description
          );
          images = [...images, ...descriptionImages];
        }

        // Add gallery URL if available
        if (item.GalleryURL) {
          images.unshift(item.GalleryURL); // Add to beginning as primary image
        }

        // Remove duplicates
        images = [...new Set(images)];

        return {
          ItemID: item.ItemID,
          Title: item.Title,
          CurrentPrice: item.CurrentPrice || 0,
          Quantity: 0, // Not available in detailed API
          ViewItemURL: item.ViewItemURL,
          images,
          description: item.Description,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching details for item ${itemId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadListingImages = async () => {
      if (listings?.listings && !isListingsLoading) {
        setIsLoadingImages(true);

        // Fetch details for first 6 listings to avoid overwhelming the API
        const listingsToProcess = listings.listings.slice(0, 6);
        const detailedListings: ListingWithImages[] = [];

        for (const listing of listingsToProcess) {
          const detailed = await fetchListingDetails(listing.ItemID);
          if (detailed) {
            detailedListings.push(detailed);
          }
        }

        setListingsWithImages(detailedListings);
        setIsLoadingImages(false);
      }
    };

    loadListingImages();
  }, [listings, isListingsLoading]);

  if (isListingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your vinyl sticker listings...</span>
      </div>
    );
  }

  if (listingsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <div className="text-lg font-medium">Unable to load listings</div>
            <div className="text-sm text-muted-foreground">{listingsError}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Sticker Gallery</h2>
          <p className="text-muted-foreground">
            Visual showcase of your {listings?.data?.total || 0} active vinyl
            sticker listings
          </p>
        </div>
        {isLoadingImages && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading images...</span>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listingsWithImages.map((listing) => (
          <Card
            key={listing.ItemID}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              {/* Primary Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.Title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      // Fallback to next image if primary fails
                      const target = e.target as HTMLImageElement;
                      if (listing.images[1]) {
                        target.src = listing.images[1];
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Image Count Badge */}
                {listing.images.length > 1 && (
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                    {listing.images.length} photos
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              {/* Title */}
              <h3
                className="font-semibold text-sm mb-2 line-clamp-2"
                title={listing.Title}
              >
                {listing.Title}
              </h3>

              {/* Price and Actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-600">
                    ${listing.CurrentPrice?.toFixed(2) || "N/A"}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  ID: {listing.ItemID}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {selectedListing?.Title}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedListing && (
                      <div className="space-y-4">
                        {/* Image Gallery */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedListing.images.map((image, index) => (
                            <div
                              key={index}
                              className="aspect-square overflow-hidden rounded-lg border"
                            >
                              <img
                                src={image}
                                alt={`${selectedListing.Title} - Image ${
                                  index + 1
                                }`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Listing Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="font-medium text-sm">
                              Current Price
                            </label>
                            <p className="text-lg font-bold text-green-600">
                              $
                              {selectedListing.CurrentPrice?.toFixed(2) ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="font-medium text-sm">
                              Item ID
                            </label>
                            <p className="font-mono text-sm">
                              {selectedListing.ItemID}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button asChild className="flex-1">
                            <a
                              href={selectedListing.ViewItemURL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on eBay
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button size="sm" asChild>
                  <a
                    href={listing.ViewItemURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {listings?.data?.total && listings.data.total > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Future enhancement: load more listings
              console.log("Load more listings");
            }}
          >
            Load More Listings (
            {listings.data.total - listingsWithImages.length} remaining)
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gallery Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {listingsWithImages.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Listings with Images
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {listingsWithImages.reduce(
                  (sum, listing) => sum + listing.images.length,
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                $
                {listingsWithImages
                  .reduce(
                    (sum, listing) => sum + (listing.CurrentPrice || 0),
                    0
                  )
                  .toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Combined Value
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  listingsWithImages.reduce(
                    (sum, listing) => sum + listing.images.length,
                    0
                  ) / listingsWithImages.length
                ) || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Photos/Listing
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
