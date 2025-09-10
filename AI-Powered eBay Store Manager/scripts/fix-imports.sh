#!/bin/bash

# Navigate to the UI components directory
cd "/workspaces/ebay_manager/AI-Powered eBay Store Manager/src/components/ui"

# Fix imports for all .tsx files
for file in *.tsx; do
  # Remove version numbers from imports
  sed -i 's/@radix-ui\/[^@]*@[0-9]\+\.[0-9]\+\.[0-9]\+/@radix-ui\/react-&/' "$file"
  sed -i 's/class-variance-authority@[0-9]\+\.[0-9]\+\.[0-9]\+/class-variance-authority/' "$file"
  # Remove version numbers from remaining radix imports
  sed -i -E 's/@radix-ui\/([^@]+)@[0-9]+\.[0-9]+\.[0-9]+/@radix-ui\/\1/' "$file"
  # Fix lucide-react imports
  sed -i 's/lucide-react@[0-9]\+\.[0-9]\+\.[0-9]\+/lucide-react/' "$file"
  # Remove any duplicated @radix-ui/react- prefixes
  sed -i 's/@radix-ui\/react-@radix-ui\/react-/@radix-ui\/react-/g' "$file"
done
