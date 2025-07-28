from PIL import Image, ImageDraw, ImageFont
import os

# Create placeholder images for blog templates
def create_placeholder_image(name, width, height, color, text_color="#FFFFFF"):
    # Create a new image with the given color
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    
    # Add text to the image
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except Exception:
        # Already using default font
        pass
    
    # Draw text in the center
    text = f"{name} Blog"
    position = (width//2-80, height//2-20)
    
    # Add a shadow for better visibility
    draw.text((position[0] + 2, position[1] + 2), text, fill="#000000")
    draw.text(position, text, fill=text_color)
    
    # Save the image
    img.save(f"{name.lower()}.jpg", format="JPEG", quality=90)
    print(f"Created {name.lower()}.jpg")

# Create directory if it doesn't exist
current_dir = os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(current_dir):
    os.makedirs(current_dir)

# Create placeholders for different blog types
create_placeholder_image("Tech", 800, 400, "#4a6fa5")
create_placeholder_image("Finance", 800, 400, "#28a745")
create_placeholder_image("Health", 800, 400, "#dc3545")
create_placeholder_image("Travel", 800, 400, "#fd7e14")
create_placeholder_image("News", 800, 400, "#6610f2")

print("All placeholder images created successfully!") 