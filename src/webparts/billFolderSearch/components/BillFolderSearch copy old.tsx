import * as React from 'react';
import styles from "./BillFolderSearch.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { TextField, Dropdown, Checkbox, IconButton, MessageBar, MessageBarType } from '@fluentui/react';
import { useState } from 'react';

export interface IBillFolderSearchProps {
  context: WebPartContext;
}
export const BillFolderSearch: React.FC<IBillFolderSearchProps> = (props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isThirdCheckboxChecked, setIsThirdCheckboxChecked] = useState<boolean>(false);

  // Sample resolution data
  const resolutions = [
    {
      id: 1,
      title: 'H. Con. Res. 14',
      date: '02/18/2025',
      description: 'Establishing the congressional budget for fiscal year 2025...',
    },
    {
      id: 2,
      title: 'R. Ver. Res. 14',
      date: '03/14/2023',
      description: 'Establishing the congressional budget for fiscal year 2025...',
    },
    // Add more if needed
  ];

  // Filtered data based on searchQuery
  const filteredResolutions = resolutions.filter((res) =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.date.includes(searchQuery)
  );

  const handleSearch = (_: any, newValue?: string) => {
    setSearchQuery(newValue || '');
  };

  const handleThirdCheckboxChange = (_: any, checked?: boolean) => {
    setIsThirdCheckboxChecked(checked || false);
  };

  return (
    <div className={styles.profile}>
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
        <span>{filteredResolutions.length} result{filteredResolutions.length !== 1 ? 's' : ''} found</span>

        {/* Sort Dropdown */}
        <Dropdown
          placeholder="Sort by..."
          options={[
            { key: 'last_action', text: 'Last Action' },
            { key: 'introduced_date', text: 'Introduced Date' },
            { key: 'sponsor', text: 'Sponsor' },
            { key: 'title', text: 'Title' },
          ]}
          onChange={(event, option) => console.log('Sort by:', option?.text)}
        />
      </div>

      <hr />

      {/* Render Filtered Resolutions */}
      {filteredResolutions.map((res) => (
        <div key={res.id} className={styles.resolution}>
          <div className={styles.resolutionContent}>
            <span className={styles.tag}>FEDERAL - 119th Congress</span>
            <span className={styles.tag}>PRO BILL ANALYSIS</span>

            <h4>{res.title}</h4>
            <p>{res.description}</p>

            <small>
              <strong>Introduced:</strong> {res.date}
            </small>
          </div>

          <div className={styles.resolutionActions}>
            <IconButton iconProps={{ iconName: 'Search' }} />
            <IconButton iconProps={{ iconName: 'Download' }} />
            <Checkbox checked={isThirdCheckboxChecked} onChange={handleThirdCheckboxChange} />
          </div>
        </div>
      ))}

      {/* No Results Message */}
      {filteredResolutions.length === 0 && (
        <MessageBar messageBarType={MessageBarType.warning}>No matching resolutions found.</MessageBar>
      )}
    </div>
  );
};

export default BillFolderSearch;
