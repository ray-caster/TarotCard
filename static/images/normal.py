import os
import numpy as np
from PIL import Image, ImageFilter

# ---- Settings ----
intensity = 0  # adjust the strength of the normals
output_folder = "normals"

# create output folder if not exists
os.makedirs(output_folder, exist_ok=True)

# ---- Normal map generation function ----
def generate_normal_map(image_path, intensity=2.0):
    img = Image.open(image_path).convert("L")
    img = img.filter(ImageFilter.GaussianBlur(1))

    img_array = np.array(img, dtype=float)
    dx, dy = np.gradient(img_array)

    # scale gradients
    dx /= intensity
    dy /= intensity
    dz = np.ones_like(dx)

    length = np.sqrt(dx**2 + dy**2 + dz**2)
    nx = dx / length
    ny = dy / length
    nz = dz / length

    normal_map = np.zeros((*img_array.shape, 3), dtype=np.uint8)
    normal_map[..., 0] = ((nx + 1.0) * 127.5).astype(np.uint8)
    normal_map[..., 1] = ((ny + 1.0) * 127.5).astype(np.uint8)
    normal_map[..., 2] = ((nz + 1.0) * 127.5).astype(np.uint8)

    return Image.fromarray(normal_map)

# ---- Process all images in current directory ----
current_dir = os.path.dirname(os.path.abspath(__file__))
for filename in os.listdir(current_dir):
    if filename.lower().endswith((".png", ".jpg", ".jpeg")):
        input_path = os.path.join(current_dir, filename)
        output_path = os.path.join(output_folder, f"normal_{filename}")

        normal_map = generate_normal_map(input_path, intensity=intensity)
        normal_map.save(output_path)
        print(f"Generated normal map for {filename} -> {output_path}")

print("All images converted to normal maps!")
