import os
import glob
from PIL import Image

def get_aligned_portrait(filepath):
    img = Image.open(filepath)
    w, h = img.size
    
    # Standardize scale: resize to height = 1600 (width will scale proportionally)
    target_h = 1600
    scale = target_h / h
    new_w = int(w * scale)
    img_resized = img.resize((new_w, target_h), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.BICUBIC)
    
    # Grayscale for face detection
    gray = img_resized.convert('L')
    pixels = gray.load()
    
    # Skin bounds detection (Y: 240 to 1120 in 1600px height scale)
    x_coords = []
    for y in range(int(target_h * 0.15), int(target_h * 0.7)):
        for x in range(new_w):
            if pixels[x, y] > 80:
                x_coords.append(x)
                
    if x_coords:
        face_x = (min(x_coords) + max(x_coords)) / 2
    else:
        face_x = new_w / 2
        
    # Crop a 3:4 box (e.g. width = 1002, height = 1336) centered on face_x
    crop_w = 1002
    crop_h = 1336
    
    left = int(face_x - crop_w / 2)
    # Clamp left boundary
    left = max(0, min(left, new_w - crop_w))
    right = left + crop_w
    top = 80 # Leave about 80px space on top
    bottom = top + crop_h
    
    img_cropped = img_resized.crop((left, top, right, bottom))
    # Resize to standard size (e.g., 600x800)
    return img_cropped.resize((600, 800), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.BICUBIC)

def main():
    face_dir = r"c:\client\Hareesh\Project\Hareesh_Portfolio\face"
    jpegs = sorted(glob.glob(os.path.join(face_dir, "*.jpeg")))
    
    if not jpegs:
        print("No JPEGs found!")
        return
        
    aligned_images = []
    for f in jpegs:
        print(f"Aligning {os.path.basename(f)}...")
        aligned = get_aligned_portrait(f)
        aligned_images.append((os.path.basename(f), aligned))
        
    # Save a horizontal grid for visual inspection
    total_w = 600 * len(aligned_images)
    total_h = 800
    grid = Image.new('RGB', (total_w, total_h))
    
    for idx, (name, img) in enumerate(aligned_images):
        grid.paste(img, (idx * 600, 0))
        # Save individually as portrait_X.png
        img.save(os.path.join(face_dir, f"portrait_{idx}.png"))
        
    grid_path = os.path.join(face_dir, "portrait_grid.jpg")
    grid.save(grid_path)
    print(f"Grid saved to {grid_path}")

if __name__ == "__main__":
    main()
