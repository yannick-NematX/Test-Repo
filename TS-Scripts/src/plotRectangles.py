import matplotlib.pyplot as plt
import matplotlib.patches as patches
import sys
import json

# Rectangle data: x (bottom-left), y (bottom-left), width (w), height (h)
# Load rectangles data passed as arguments
data = json.loads(sys.argv[1])  # The first argument passed
packerRectDim = json.loads(sys.argv[2])
containerRectDim = json.loads(sys.argv[3])

rectangles = data

# Create a plot
fig, ax = plt.subplots(figsize=(8, 6))

# Add rectangles to the plot
for i, rect in enumerate(rectangles):
    # Adjust the y-coordinate for top-left corner input
    ax.add_patch(patches.Rectangle((rect['x'], rect['y'] - rect['h']), rect['w'], rect['h'], 
                                    edgecolor='blue', facecolor='lightblue', linewidth=2))
    # Plot the bottom-left corner as a red dot
    plt.plot(rect['x'], rect['y'], 'ro')  # 'ro' = red circle

    # Add label for the top-left corner
    plt.text(rect['x'], rect['y'], f"({rect['x']}, {rect['y']})", color='red', fontsize=8, ha='right')

    # Calculate the center of the rectangle
    center_x = rect['x'] + rect['w'] / 2
    center_y = rect['y'] - rect['h'] / 2

    # Add the index number at the center of the rectangle
    plt.text(center_x, center_y, f"{i}", color='black', fontsize=10, ha='center', va='center')

# Set plot limits
ax.set_xlim(0, containerRectDim[0])
ax.set_ylim(0, containerRectDim[1])

# Add grid and labels
ax.set_aspect('equal', adjustable='box')
plt.grid(True)
plt.xlabel("X Coordinate")
plt.ylabel("Y Coordinate")

# Show the plot
plt.show()

# Example: Return processed data
# Process the data
result = {"message": "Processed rectangles", "count": len(data)}
