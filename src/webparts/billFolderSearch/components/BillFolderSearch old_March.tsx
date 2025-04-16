import * as React from "react";
import { SPFI, spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import {
  DetailsList,
  IColumn,
  SelectionMode,
  TextField,
  PrimaryButton,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType
} from "@fluentui/react";
import styles from "./BillFolderSearch.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBillFolderSearchProps {
  context: WebPartContext;
}

interface ISharePointItem {
  name: string;
  url: string;
  type: "Folder" | "File";
  created?: string;
  modified?: string;
  businessUnit?: string;
  Categories0?: string;
}

const BillFolderSearch: React.FC<IBillFolderSearchProps> = (props) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedType, setSelectedType] = React.useState<string>("All");
  const [selectedBusinessUnit, setSelectedBusinessUnit] = React.useState<string>("All");
  const [selectedCategories0, setSelectedCategories0] = React.useState<string>("All");
  const [businessUnitOptions, setBusinessUnitOptions] = React.useState<IDropdownOption[]>([]);
  const [results, setResults] = React.useState<ISharePointItem[]>([]);
  const [filteredResults, setFilteredResults] = React.useState<ISharePointItem[]>([]);
  const [error, setError] = React.useState<string>("");

  const sp: SPFI = spfi().using(SPFx(props.context));

  const fetchBusinessUnits = async (): Promise<void> => {
    try {
      const items = await sp.web.lists.getByTitle("Business Unit").items.select("Title")();
      const options = items.map((item) => ({
        key: item.Title,
        text: item.Title,
      }));
      setBusinessUnitOptions([{ key: "All", text: "All" }, ...options]);
    } catch (err) {
      console.error("Error fetching Business Units:", err);
      setError("Failed to fetch Business Units.");
    }
  };

  const fetchAllItems = async (): Promise<void> => {
    setError("");

    try {
      const items = await sp.web.lists
  .getByTitle("Bill & Proposal Management")
  .items.select("Id", "Title", "FileRef", "FileSystemObjectType", "Created", "Modified", "FileLeafRef", "Busniess_x0020_Unit/Title", "Categories0")
  .expand("Busniess_x0020_Unit")
  .top(5000)();


        const mappedResults = items.map((item) => ({
          name: item.FileLeafRef || item.Title || `Item ${item.Id}`,
          url: item.FileRef,
          type: item.FileSystemObjectType === 1 ? ("Folder" as const) : ("File" as const),
          created: item.Created,
          modified: item.Modified,
          businessUnit: item.Busniess_x0020_Unit?.Title, // Accessing the lookup column Title
          Categories0: item.Categories0, 
        }));
        

      setResults(mappedResults);
      setFilteredResults(mappedResults);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items. Please check permissions or configuration.");
    }
  };

  const searchItems = (): void => {
    const searchLower = searchTerm.toLowerCase();
  
    const filtered = results.filter(
      (item) =>
        (!selectedType || selectedType === "All" || item.type.toLowerCase() === selectedType.toLowerCase()) &&
        (!selectedBusinessUnit || selectedBusinessUnit === "All" || item.businessUnit === selectedBusinessUnit) &&
        (!selectedCategories0 || selectedCategories0 === "All" || item.Categories0?.toLowerCase() === selectedCategories0.toLowerCase()) &&
        ((item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.url && item.url.toLowerCase().includes(searchLower)))
    );
  
    setFilteredResults(filtered);
    console.log("Search results:", filtered);
  };
  

  React.useEffect(() => {
    fetchBusinessUnits(); // Fetch Business Unit options when the component mounts
    fetchAllItems(); // Fetch items
  }, []);

  const columns: IColumn[] = [
    { key: "type", name: "Type", fieldName: "type", minWidth: 100, isResizable: true },
    { key: "name", name: "Name", fieldName: "name", minWidth: 200, isResizable: true },
    
    {
      key: "created",
      name: "Created",
      fieldName: "created",
      minWidth: 150,
      isResizable: true,
      onRender: (item: ISharePointItem) =>
        item.created ? new Date(item.created).toLocaleDateString() : "",
    },
    {
      key: "modified",
      name: "Modified",
      fieldName: "modified",
      minWidth: 150,
      isResizable: true,
      onRender: (item: ISharePointItem) =>
        item.modified ? new Date(item.modified).toLocaleDateString() : "",
    },
    {
      key: "url",
      name: "URL",
      fieldName: "url",
      minWidth: 300,
      isResizable: true,
      onRender: (item: ISharePointItem) => (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          Open
        </a>
      ),
    },
  ];

  const Categories0Options: IDropdownOption[] = [
    { key: "All", text: "All" },
    { key: "Bills", text: "Bills" },
    { key: "Proposal", text: "Proposal" },
  ];

  const typeOptions: IDropdownOption[] = [
    { key: "All", text: "All" },
    { key: "Folder", text: "Folder" },
    { key: "File", text: "File" },
  ];

  return (
    <div className={`${styles.billFolderSearch} ${styles.card}`}>
      <h2 className={styles.header}>Legal Bills Library</h2>
      <div className={styles.searchContainer}>
        <TextField
          placeholder="Search"
          value={searchTerm}
          onChange={(e, newValue) => setSearchTerm(newValue || "")}
          className={styles.searchBox}
        />
        <Dropdown
  options={typeOptions}
  selectedKey={selectedType} // Use the state variable
  onChange={(e, option) => setSelectedType(option?.key as string)}
  className={styles.dropdown}
  placeholder="Select Type"
/>

        <Dropdown
          options={businessUnitOptions}
          defaultSelectedKey="All"
          onChange={(e, option) => setSelectedBusinessUnit(option?.key as string)}
          className={styles.dropdown}
          placeholder="Select Business Unit"
        />
     <Dropdown
  options={Categories0Options}
  selectedKey={selectedCategories0} // Use the state variable
  onChange={(e, option) => setSelectedCategories0(option?.key as string)}
  className={styles.dropdown}
  placeholder="Select Categories0"
/>

        <PrimaryButton
          text="Search"
          onClick={searchItems}
          className={styles.searchButton}
        />
      </div>
      {error && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.error}>
          {error}
        </MessageBar>
      )}
      <DetailsList
        items={filteredResults}
        columns={columns}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
      />
    </div>
  );
};

export default BillFolderSearch;
