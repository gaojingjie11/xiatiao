#!/bin/bash
# Create backup directory
mkdir -p original_images
echo "Backing up original high-res photos to original_images/..."
cp *.jpg *.png original_images/ 2>/dev/null

echo "Processing images using macOS built-in sips tool..."

# Resample and compress JPEGs
for file in *.jpg; do
  if [ -f "$file" ]; then
    echo "Optimizing JPEG: $file"
    sips --resampleHeightWidthMax 1000 -s formatOptions 75 "$file" --out "$file"
  fi
done

# Convert PNGs to JPEGs (which are much smaller) and optimize
for file in *.png; do
  if [ -f "$file" ]; then
    filename="${file%.*}"
    echo "Converting and optimizing PNG to JPEG: $file -> $filename.jpg"
    sips -s format jpeg --resampleHeightWidthMax 1000 -s formatOptions 75 "$file" --out "$filename.jpg"
    # Remove original PNG from main directory to avoid duplicate files
    rm "$file"
  fi
done

echo "Image optimization complete!"
