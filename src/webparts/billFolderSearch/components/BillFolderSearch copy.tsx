import * as React from "react";
import { SPFI, spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/items";
import styles from "./BillFolderSearch.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBillFolderSearchProps {
  context: WebPartContext; // SPFx context passed from the web part
}

interface ISharePointItem {
  Name: string; // Name of the folder or file
  FileLeafRef?: string; // For files
  FileRef: string; // URL for the file or folder
  FSObjType: number; // 1 = Folder, 0 = File
  FileSystemObjectType: number; // 1 = Folder, 0 = File
  Title?: string; // Title of the item (optional)
  Id: number; // Unique identifier for the item
  ContentType?: string; // Content type of the item
  Created?: string; // Date the item was created
  Modified?: string; // Date the item was last modified
  Author?: { Title: string }; // Author of the item
  Editor?: { Title: string }; // Last editor of the item
  // Add any other properties that might be relevant
}

const BillFolderSearch: React.FC<IBillFolderSearchProps> = (props) => {
  const [searchTerm, setSearchTerm] = React.useState<string>(""); // User's search input
  const [results, setResults] = React.useState<
    { name: string; url: string; type: "Folder" | "File"; created?: string; modified?: string }[]
  >([]); // Combined search results
  const [error, setError] = React.useState<string>(""); // Error message, if any

  // Initialize PnPjs with the SPFx context
  const sp: SPFI = spfi().using(SPFx(props.context));

  const searchItems = async (): Promise<void> => {
    setError(""); // Clear any existing errors
    setResults([]); // Reset results before executing search

    try {
      // Use PnPjs to search items in the library
      const items: ISharePointItem[] = await sp.web.lists
        .getByTitle("legalbill") // Use the library title
        .items.filter(`substringof('${searchTerm}', FileLeafRef) or substringof('${searchTerm}', Title)`)
        .select('Id', 'Title', 'FileRef', 'FileSystemObjectType', 'Created', 'Modified', 'FileLeafRef')
        .top(5000) // Adjust the number of items to retrieve as needed
        ();

      // Debugging: Log raw response from SharePoint
      console.log("Raw SharePoint Items:", items);

      // Log each item to see available fields
      items.forEach(item => console.log("Item Fields:", item));

      // Map the items into a combined array of folders and files
      const mappedResults = items.map((item) => ({
        name: item.FileLeafRef || item.Title || `Item ${item.Id}`, // Use FileLeafRef for files, Title or a fallback name for folders
        url: item.FileRef, // Get the URL for the file or folder
        type: item.FileSystemObjectType === 1 ? ("Folder" as const) : ("File" as const), // 1 = Folder, 0 = File
        created: item.Created, // Date the item was created
        modified: item.Modified, // Date the item was last modified
      }));

      // Debugging: Log mapped results to verify mappings
      console.log("Mapped Results:", mappedResults);

      setResults(mappedResults); // Update results state with mapped results
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items. Please check permissions or configuration.");
    }
  };

  return (
    <div className={styles.billFolderSearch}>
      <h2>Search Legal bills </h2>
      <input
        type="text"
        placeholder="Enter search term"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchBox}
      />
      <button onClick={searchItems} className={styles.searchButton}>
        Search
      </button>
      {error && <p className={styles.error}>{error}</p>}
      <table /*className={styles.resultsTable*/>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Created</th>
            <th>Modified</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.created ? new Date(item.created).toLocaleDateString() : ''}</td>
              <td>{item.modified ? new Date(item.modified).toLocaleDateString() : ''}</td>
              <td>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillFolderSearch;
