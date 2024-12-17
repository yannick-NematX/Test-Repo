import matplotlib.pyplot as plt
import matplotlib.patches as patches
import sys
import json
# Rectangle data: x (bottom-left), y (bottom-left), width (w), height (h)
# Load rectangles data passed as an argument
data = json.loads(sys.argv[1])  # The first argument passed
packerRectDim = json.loads(sys.argv[2])
containerRectDim = json.loads(sys.argv[3])

rectangles = data

# Create a plot
fig, ax = plt.subplots(figsize=(8, 6))

# Add rectangles to the plot
for rect in rectangles:
    ax.add_patch(patches.Rectangle((rect['x'], rect['y']), rect['w'], rect['h'], 
                                   edgecolor='blue', facecolor='lightblue', linewidth=2))

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