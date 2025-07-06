BAYBAYIN CHARACTER REFERENCE IMAGES

This folder should contain PNG images for each Baybayin character reference.

Required image files:
- a.png     (for character ᜀ)
- i.png     (for character ᜁ)
- u.png     (for character ᜂ)
- ka.png    (for character ᜃ)
- ga.png    (for character ᜄ)
- nga.png   (for character ᜅ)
- ta.png    (for character ᜆ)
- da.png    (for character ᜇ)
- na.png    (for character ᜈ)
- pa.png    (for character ᜉ)
- ba.png    (for character ᜊ)
- ma.png    (for character ᜋ)

Image specifications:
- Format: PNG with transparent background
- Size: 200x200 pixels (minimum)
- Content: Clear, properly formed Baybayin character
- Style: Traditional calligraphy style preferred

HOW TO ENABLE IMAGES:

1. Add your PNG images to this folder
2. Open: data/handwriting.ts
3. Uncomment the images object (lines 4-15)
4. Replace the null values with the commented image references

Example:
Change: imageUri: null, // images?.a || null,
To:     imageUri: images?.a || null,

The images will then appear as reference guides above the practice canvas.
