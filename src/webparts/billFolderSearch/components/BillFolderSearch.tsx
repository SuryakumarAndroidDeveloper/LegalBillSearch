import * as React from 'react';
import { useState,useEffect } from 'react';
import { SPFI, spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base"; // SPFx context
import { TextField, IconButton, MessageBar, MessageBarType } from '@fluentui/react'; // Fluent UI components
import Sidebar from "./Sidebar"; // Import Sidebar component
import styles from "./BillFolderSearch.module.scss"; // Import module-specific styles

// Props Interface
export interface IBillFolderSearchProps {
  context: WebPartContext; // SPFx context
}
/*interface ISharePointItem {
  name: string;
  DocumentLink: string;
  created?: string;
  modified?: string;
  businessUnit?: string;
  Category?: string;
  Summary?:string;
}*/
// Functional Component Definition
const BillFolderSearch: React.FC<IBillFolderSearchProps> = ({ context }) => {
 // const { context } = props; // Destructure context from props
  //const sp: SPFI = spfi().using(SPFx(props.context));
  const sp: SPFI = spfi().using(SPFx(context));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resolution, setResolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    federalState: 'both',
    category: 'all',
    congress: '119th',
  });

  // Fetch data from SharePoint in useEffect
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("Bill & Proposal")
          .items.select(
            "Id",
            "Title",
            "Summary",
            "DynamicTags",
            "Created",
            "Modified",
            "BusinessUnit",
            "Category",
            "KeyWord",
            "Judiciary_x0028_Region_x0029_",
            "BillType"
          )
          .top(5000)();
       setResolutions(items);
        setLoading(false); // Set loading to false after fetching data
      } catch (err) {
        setError("Error fetching items: " + err.message); // Set error message
        setLoading(false); // Set loading to false even if there's an error
        console.error("Error fetching items:", err);
      }
    };
  
    void fetchItems(); // suppress promise warning
  }, []);
  
  



  /*const fetchAllItems = async (): Promise<void> => {


    try {
      const items = await sp.web.lists
  .getByTitle("Bill & Proposal")
  .items.select("Id", "Title", "Summary", "DynamicTags", "Created", "Modified", "BusinessUnit", "Category","KeyWord","Judiciary_x0028_Region_x0029_").top(5000)();


        const mappedResults = items.map((item) => ({
          name: item.FileLeafRef || item.Title || `Item ${item.Id}`,
          url: item.FileRef,
          type: item.FileSystemObjectType === 1 ? ("Folder" as const) : ("File" as const),
          created: item.Created,
          modified: item.Modified,
          businessUnit: item.Busniess_x0020_Unit?.Title, // Accessing the lookup column Title
          Categories0: item.Categories0, 
        }));
        

    } catch (err) {
      console.error("Error fetching items:", err);
     
    }
  };
  */

  // // Filter resolutions based on search query
  // const filteredResolutions = resolution.filter((res) => {
  //   const title = res?.Title ?? "";
  //   const created = res?.Created ?? "";
  //   return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //          created.toLowerCase().includes(searchQuery.toLowerCase());
  // });


// Filter logic including sidebar filters
const filteredResolutions = resolution.filter((res) => {
  const title = res?.Title?.toLowerCase() || '';
  const created = res?.Created?.toLowerCase() || '';
  const billType = res?.BillType?.toLowerCase() || '';
  const judiciary = res?.Judiciary_x0028_Region_x0029_?.toLowerCase() || '';

  const matchesSearch =
    title.includes(searchQuery.toLowerCase()) ||
    created.includes(searchQuery.toLowerCase());

  const matchesCategory =
    filters.category === 'all' || billType === filters.category;

  const matchesFederalState =
    filters.federalState === 'both' ||
    (filters.federalState === 'federal' && judiciary.includes('federal')) ||
    (filters.federalState === 'state' && judiciary.includes('state'));

  return matchesSearch && matchesCategory && matchesFederalState;
});

  // Handle search input change
  const handleSearch = (_: any, newValue?: string) => {
    setSearchQuery(newValue || '');
  };


  return (
    <div className={styles.container}>
      {/* Sidebar Component */}
      <Sidebar filters={filters} onFilterChange={setFilters} />

      {/* Main Content Section */}
      <div className={styles.content}>
        {/* Search Box Section */}
        <div className={styles.searchBox}>
          <TextField
            placeholder="Search by keyword or bill..."
            value={searchQuery}
            onChange={handleSearch}
            iconProps={{ iconName: 'Search' }}
          />
        </div>
        {/* Result Count */}
        <div className={styles.resultCount}>
        {loading ? (
            <span>Loading...</span>
          ) : (
            <span>{filteredResolutions.length} result{filteredResolutions.length !== 1 ? 's' : ''} found</span>
          )}
        </div>

        <hr />
                {/* Show error message */}
                {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
        {/* Render Filtered Resolutions */}
        {!loading && filteredResolutions.map((res) => (
          <div key={res.Id} className={styles.resolution}>
            <div className={styles.resolutionContent}>
            <div className={styles.headerRow}>
      <span className={styles.resId}>ID: {res.Id}</span>
      <div className={styles.resolutionActions}>
        <IconButton iconProps={{ iconName: 'Search' }} title="View" />
        <IconButton iconProps={{ iconName: 'Download' }} title="Download" />
      </div>
    </div>
              <span className={styles.judiciaryTag}>{res.Judiciary_x0028_Region_x0029_?.toUpperCase()}- 119th Congress</span>
              <h4>{res.Title}</h4>
              <p>{res.Summary}</p>
              <small><strong>Introduced:</strong> {res.Created?.split('T')[0]}</small><br />
              <small><strong>BillType:</strong> {res.BillType}</small><br />
              <small><strong>Business Unit:</strong> {res.BusinessUnit}</small><br />
              <small><strong>Category:</strong> {res.Category}</small><br />
              <small><strong>Keywords:</strong> {res.KeyWord}</small><br />
              <small><strong>Modified:</strong> {res.Modified?.split('T')[0]}</small><br />
              <small><strong>DynamicTags:</strong> {res.DynamicTags}</small><br />
              
            </div>
            {/* <div className={styles.resolutionActions}>
              <IconButton iconProps={{ iconName: 'Search' }} />
              <IconButton iconProps={{ iconName: 'Download' }} />
            </div> */}
          </div>
        ))}

        {/* No Results Message */}
        {!loading && filteredResolutions.length === 0 && !error && (
          <MessageBar messageBarType={MessageBarType.warning}>No matching resolutions found.</MessageBar>
        )}
      </div>
    </div>
  );
};

export default BillFolderSearch;


