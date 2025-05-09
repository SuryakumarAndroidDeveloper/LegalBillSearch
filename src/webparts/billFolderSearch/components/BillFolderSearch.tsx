import * as React from 'react';
import { useState,useEffect } from 'react';
import { SPFI, spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base"; // SPFx context
import { TextField, MessageBar, MessageBarType } from '@fluentui/react'; // Fluent UI components
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
  interface IResolution {
    Id: number;
    Title: string;
    Summary?: string;
    DynamicTags?: string;
    Created?: string;
    Modified?: string;
    BusinessUnit?: string;
    Category?: string;
    KeyWord?: string;
    Judiciary_x0028_Region_x0029_?: string;
    BillType?: string;
    DocumentLink?: string;
    AddendumDate?: string;
    ProgressoftheBill?: string;
    Priority?: string;
  }

  const [resolution, setResolutions] = useState<IResolution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    federalState: 'both',
    businessUnit: ['all'],
    category: ['all'],
    startDate: '',
    endDate: '',
    selectedStateRegion: ['all'],
    Priority: 'all',
    ProgressoftheBill: 'all',
  });

  // Fetch data from SharePoint in useEffect
  useEffect(() => {
    (async () => {
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
            "DocumentLink",
            "Category",
            "KeyWord",
            "Judiciary_x0028_Region_x0029_",
            "BillType",
            "AddendumDate",
            "Priority",
            "ProgressoftheBill"
          )
          .top(5000)();
  
        setResolutions(items);
        setLoading(false);
      } catch (err: unknown) {
        let message = "Unknown error";
  
        if (err instanceof Error) {
          message = err.message;
        }
  
        setError("Error fetching items: " + message);
        setLoading(false);
        console.error("Error fetching items:", err);
      }
    })().catch((err) => {
      console.error("Unhandled fetchItems error:", err);
    });
  }, []);

  

// Filter logic including sidebar filters
const filteredResolutions = resolution.filter((res) => {
  const title = res?.Title?.toLowerCase() || '';
  const created = res?.Created?.toLowerCase() || '';
  const createdDate = created ? new Date(created) : null;
  const businessUnit = res?.BusinessUnit ? String(res.BusinessUnit).toLowerCase() : '';
  const category = res?.Category ? String(res.Category).toLowerCase() : '';
  const summary = res?.Summary?.toLowerCase() || '';
  const keywords = res?.KeyWord ? String(res.KeyWord).toLowerCase() : '';
  const dynamicTags = res?.DynamicTags ? String(res.DynamicTags).toLowerCase() : '';



  const judiciary = res?.Judiciary_x0028_Region_x0029_?.toLowerCase() || '';

  const matchesSearch =
    title.includes(searchQuery.toLowerCase()) ||
    created.includes(searchQuery.toLowerCase()) ||
    summary.includes(searchQuery.toLowerCase()) ||
    keywords.includes(searchQuery.toLowerCase()) ||
    dynamicTags.includes(searchQuery.toLowerCase());

   // Extract unit flags
  //  const isCirtus = businessUnit.includes('cirtus');
  //  const isFIJI = businessUnit.includes('fiji');
  //  const isPOM = businessUnit.includes('pom');
 
   // Match against selected filter
  //  const matchesBusinessUnit =
  //    filters.businessUnit === 'all' ||
  //    (filters.businessUnit === 'Cirtus' && isCirtus) ||
  //    (filters.businessUnit === 'FIJI' && isFIJI) ||
  //    (filters.businessUnit === 'POM' && isPOM);

  // const matchesBusinessUnit =
  // filters.businessUnit === 'all' ||
  // businessUnit.includes(filters.businessUnit.toLowerCase());

  //   const matchesCategoryChanges =
  // filters.category === 'all' ||
  // category.toLowerCase() === filters.category.toLowerCase();

  const matchesBusinessUnit =
  filters.businessUnit.includes('all') ||
  filters.businessUnit.some(unit => businessUnit.includes(unit.toLowerCase()));

const matchesCategoryChanges =
  filters.category.includes('all') ||
  filters.category.some(cat => category.includes(cat.toLowerCase()));

  const matchesSelectedStateRegion =
  filters.federalState !== 'state' || // Skip check if federalState is not "state"
  filters.selectedStateRegion.includes('all') || // Match all if 'all' is selected
  (judiciary && filters.selectedStateRegion.some(region => judiciary.includes(region.toLowerCase())));

  const matchesPriority =
  filters.Priority === 'all' ||
  (res.Priority && res.Priority.toLowerCase() === filters.Priority.toLowerCase());

  // const matchesPriority =
  // !filters.Priority || (res.Priority && res.Priority.toLowerCase() === filters.Priority.toLowerCase());


const matchesProgressOfBill =
  filters.ProgressoftheBill === 'all' ||
  (res.ProgressoftheBill && res.ProgressoftheBill.toLowerCase() === filters.ProgressoftheBill.toLowerCase());

  const matchesFederalState =
    filters.federalState === 'both' ||
    (filters.federalState === 'federal' && judiciary.includes('federal')) ||
    (filters.federalState === 'state' && !judiciary.includes('federal'));

    let matchesDateRange = true;
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    if (!createdDate || createdDate < start) {
      matchesDateRange = false;
    }
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    // To include the end day fully, add 1 day
    end.setDate(end.getDate() + 1);
    if (!createdDate || createdDate >= end) {
      matchesDateRange = false;
    }
  }
  

  return (matchesSearch && matchesBusinessUnit && matchesFederalState && matchesCategoryChanges && matchesDateRange && matchesSelectedStateRegion && matchesPriority && matchesProgressOfBill);
});

  // Handle search input change
  const handleSearch = (_: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    setSearchQuery(newValue || '');
  };

  // Handle card click event
  const handleCardClick = (url: string): void => {
    window.open(url, '_blank');

  };


  return (
    <div className={styles.container}>
    {/* Sidebar Component */}
    <Sidebar sp={sp} filters={filters} onFilterChange={setFilters} />
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
        {error && (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        )}
        

  
        {/* Render Filtered Resolutions */}
        {!loading &&
          filteredResolutions.map((res) => (
            <div key={res.Id} className={styles.resolution} onClick={() => handleCardClick(res.DocumentLink? res.DocumentLink : '')}>
              <div className={styles.resolutionContent}>
                <div className={styles.headerRow}>
                  {/* <span className={styles.resId}>ID: {res.Id}</span> */}
                  {/* <div className={styles.resolutionActions}>
                    <IconButton iconProps={{ iconName: 'Search' }} title="View" />
                    <IconButton iconProps={{ iconName: 'Download' }} title="Download" />
                  </div> */}
                </div>
                <span className={styles.judiciaryTag}>
                  {res.Judiciary_x0028_Region_x0029_?.toUpperCase()}
                </span>
                {/* <span className={styles.billtypeTag}>
                  {res.BillType?.toUpperCase()}
                </span> */}
                <h4 className={styles.restitle}>{res.Title}</h4>
                <p className={styles.ressummary}>{res.Summary}</p>
                <small><strong>Introduced:</strong> {res.Created?.split('T')[0]}</small><br />
                <small><strong>AddendumDate:</strong> {res.AddendumDate}</small><br />
                <small><strong>ProgressOfBill:</strong> {res.ProgressoftheBill}</small><br />
                <small><strong>Priority:</strong> {res.Priority}</small><br />
                {/* <small><strong>BillType:</strong> {res.BillType}</small><br />
                <small><strong>Business Unit:</strong> {res.BusinessUnit}</small><br />
                <small><strong>Category:</strong> {res.Category}</small><br />
                <small><strong>Keywords:</strong> {res.KeyWord}</small><br />
                <small><strong>Modified:</strong> {res.Modified?.split('T')[0]}</small><br />
                <small><strong>DynamicTags:</strong> {res.DynamicTags}</small><br /> */}
              </div>
            </div>
          ))}
  
        {/* No Results Message */}
        {!loading && filteredResolutions.length === 0 && !error && (
          <MessageBar messageBarType={MessageBarType.warning}>
            No matching resolutions found.
          </MessageBar>
        )}
      </div>
    </div>
  );
};

export default BillFolderSearch;


