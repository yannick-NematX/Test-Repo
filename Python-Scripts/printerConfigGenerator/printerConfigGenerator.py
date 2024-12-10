import json
import os
from tkinter import Tk, filedialog, simpledialog

def combine_json_files(output_file, input_files):
    combined_data = {}

    for file in input_files:
        try:
            # Open each file and load its JSON content
            with open(file, 'r') as f:
                data = json.load(f)
                
            # Store the content in the combined data dictionary using the filename as the key
            filename = os.path.basename(file)
            combined_data[filename] = data
        
        except FileNotFoundError:
            print(f"Error: The file '{file}' was not found.")
        except json.JSONDecodeError:
            print(f"Error: The file '{file}' does not contain valid JSON.")
    
    # Write the combined data to the output file
    with open(output_file, 'w') as f:
        json.dump(combined_data, f, indent=4)
    
    print(f"Combined JSON data has been written to '{output_file}'")

def main():
    # Create a root Tkinter window and hide it
    root = Tk()
    root.withdraw()  # Hide the main window
    
    # Prompt the user to select files
    print("Please select the JSON files to combine.")
    input_files = filedialog.askopenfilenames(
        title="Select JSON Files",
        filetypes=[("JSON Files", "*.json")]
    )
    
    if not input_files:
        print("No files were selected. Exiting...")
        return
    
    # Prompt the user for the output file name
    print("Please select the location and name for the combined JSON file.")
    output_file = filedialog.asksaveasfilename(
        title="Save Combined JSON File As",
        defaultextension=".json",
        filetypes=[("JSON Files", "*.json")]
    )
    
    if not output_file:
        print("No output file was specified. Exiting...")
        return
    
    # Combine the JSON files
    combine_json_files(output_file, input_files)

if __name__ == "__main__":
    main()
