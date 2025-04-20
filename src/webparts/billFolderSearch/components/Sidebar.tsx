import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useState,useEffect } from 'react';
import styles from "./BillFolderSearch.module.scss";
import { spfi } from "@pnp/sp";
//import { SPFx } from "@pnp/sp/presets/all";
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption, Label, TextField } from '@fluentui/react';

interface FiltersType {
  federalState: string;
  businessUnit: string;
  category: string;
  startDate: string;
  endDate: string;
}

interface SidebarProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
  sp: ReturnType<typeof spfi>;
}


export const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange ,sp}) => {
 // const [selectedCongress, setSelectedCongress] = useState<string | undefined>('all');
  const [categoryOptions, setCategoryOptions] = useState<IDropdownOption[]>([]);
  const [businessUnitOptions, setBusinessUnitOptions] = useState<IDropdownOption[]>([]);

  const federalStateOptions: IChoiceGroupOption[] = [
    { key: 'federal', text: 'Federal' },
    { key: 'state', text: 'State' },
    { key: 'both', text: 'Both Federal and State(s)' },
  ];
  
  // Fetch Category field choices from SharePoint
  useEffect(() => {
    (async () => {
      const categoryField = await sp.web.lists
        .getByTitle('Bill & Proposal')
        .fields.getByInternalNameOrTitle('Category')
        .select("Choices")();
  
      if (categoryField.Choices && Array.isArray(categoryField.Choices)) {
        const options = categoryField.Choices.map((choice: string) => ({
          key: choice,
          text: choice,
        }));
        setCategoryOptions([{ key: 'all', text: 'All' }, ...options]);
      }
  
      const businessUnitField = await sp.web.lists
        .getByTitle('Bill & Proposal')
        .fields.getByInternalNameOrTitle('BusinessUnit')
        .select("Choices")();
  
      if (businessUnitField.Choices && Array.isArray(businessUnitField.Choices)) {
        const options = businessUnitField.Choices.map((choice: string) => ({
          key: choice,
          text: choice,
        }));
        setBusinessUnitOptions([{ key: 'all', text: 'All' }, ...options]);
      }
    })().catch((error) => {
      console.error('Error fetching field choices:', error);
    });
  }, [sp]);
  const handleFederalStateChange = (_: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption): void => {
    if (option) {
      onFilterChange({ ...filters, federalState: option.key });
    }
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value?: string):void => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className={styles.sidebar}>
      <h4 className={styles.heading}><SlidersHorizontal style={{ width: '14px', height: '14px' }} className="w-1 h-1 text-gray-600" />Filter Results</h4>

      <div className={styles.filterSection}>
        <Label>Federal/State</Label>
        <ChoiceGroup
          styles={{ flexContainer: { gap: '4px' } }}
          selectedKey={filters.federalState}
          options={federalStateOptions}
          onChange={handleFederalStateChange}
        />
      </div>

      <div className={styles.filterSection}>
        <Label>Category</Label>
        <Dropdown className={styles.dropdowndesign}
          placeholder="Select Category"
          options={categoryOptions}
          selectedKey={filters.category}
          onChange={(ev, option) => {
            if (option) {
              onFilterChange({ ...filters, category: option.key.toString() });
            }
          }}
        />
      </div>

      <div className={styles.filterSection}>
        <Label>Business Unit</Label>
          <Dropdown className={styles.dropdowndesign}
          placeholder="Select BusinessUnit"
          options={businessUnitOptions}
          selectedKey={filters.businessUnit}
          onChange={(ev, option) => {
            if (option) {
              onFilterChange({ ...filters, businessUnit: option.key.toString() });
            }
          }}
        />
      </div>

      {/* Date Range Filter */}
      <div className={styles.filterSection}>
        <Label>Introduced Date</Label>
        <div className={styles.dateRange} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <TextField
            type="date"
            value={filters.startDate}
            onChange={(_, val) => handleDateChange('startDate', val)}
            styles={{ fieldGroup: { flex: 1 } }}
          />
          <TextField
            type="date"
            value={filters.endDate}
            onChange={(_, val) => handleDateChange('endDate', val)}
            styles={{ fieldGroup: { flex: 1 } }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
