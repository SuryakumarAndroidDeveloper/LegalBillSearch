import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useState,useEffect } from 'react';
import styles from "./BillFolderSearch.module.scss";
import { SPFI } from "@pnp/sp";
//import { SPFx } from "@pnp/sp/presets/all";
import { ChoiceGroup, IChoiceGroupOption, Dropdown, IDropdownOption, Label, TextField } from '@fluentui/react';

interface SidebarProps {
  sp: SPFI;
  filters: {
    federalState: string;
    businessUnit: string[];
    category: string[];
    startDate: string;
    endDate: string;
    selectedStateRegion: string[];
    priority: string;
    progressOfBill: string;
  };
  onFilterChange: (newFilters: unknown) => void;
}


export const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange ,sp}) => {
 // const [selectedCongress, setSelectedCongress] = useState<string | undefined>('all');
  const [categoryOptions, setCategoryOptions] = useState<IDropdownOption[]>([]);
  const [businessUnitOptions, setBusinessUnitOptions] = useState<IDropdownOption[]>([]);
  const [stateRegionOptions, setStateRegionOptions] = useState<IDropdownOption[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<IDropdownOption[]>([]);
  const [progressOptions, setProgressOptions] = useState<IDropdownOption[]>([]);

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

//       const stateField = await sp.web.lists.getByTitle('State');
//  console.log("StateField",stateField);

 const stateItems = await sp.web.lists.getByTitle('State').items.select("Title")();
 const stateOptions = stateItems.map((item: { Title: string }) => ({
   key: item.Title,
   text: item.Title,
 }));
 setStateRegionOptions([{ key: 'all', text: 'All' }, ...stateOptions]);
     

      const Priority= await sp.web.lists
        .getByTitle('Bill & Proposal')
        .fields.getByInternalNameOrTitle('Priority')
        .select("Choices")();

        if (Priority.Choices && Array.isArray(Priority.Choices)) {
          const options = Priority.Choices.map((choice: string) => ({
            key: choice,
            text: choice,
          }));
          setPriorityOptions([{ key: 'all', text: 'All' }, ...options]);
        }

        const ProgressoftheBill= await sp.web.lists
        .getByTitle('Bill & Proposal')
        .fields.getByInternalNameOrTitle('ProgressoftheBill')
        .select("Choices")();

        if (ProgressoftheBill.Choices && Array.isArray(ProgressoftheBill.Choices)) {
          const options = ProgressoftheBill.Choices.map((choice: string) => ({
            key: choice,
            text: choice,
          }));
          setProgressOptions([{ key: 'all', text: 'All' }, ...options]);
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
      {filters.federalState === 'state' && (
  <div className={styles.filterSection}>
    <Label>Select State/Region</Label>
    <Dropdown
      className={styles.dropdowndesign}
      placeholder="Select State/Region"
      options={stateRegionOptions}
      selectedKeys={filters.selectedStateRegion}
      onChange={(ev, option) => {
        if (!option) return;

        let updatedStates: string[];

        if (option.key === 'all') {
          updatedStates = ['all'];
        } else {
          const current = filters.selectedStateRegion.filter(k => k !== 'all');

          if (filters.selectedStateRegion.includes(option.key.toString())) {
            updatedStates = current.filter(k => k !== option.key); // uncheck
          } else {
            updatedStates = [...current, option.key.toString()]; // check
          }
        }

        if (updatedStates.length === 0) updatedStates = ['all'];

        onFilterChange({ ...filters, selectedStateRegion: updatedStates });
      }}
      multiSelect
    />
  </div>
)}



      

      <div className={styles.filterSection}>
        <Label>Category</Label>
        <Dropdown
  className={styles.dropdowndesign}
  placeholder="Select Category"
  options={categoryOptions}
  selectedKeys={filters.category}
  onChange={(ev, option) => {
    if (!option) return;

    let updatedCategories: string[];

    if (option.key === 'all') {
      // Selecting "All" clears other selections
      updatedCategories = ['all'];
    } else {
      // Remove "all" if it's selected
      const current = filters.category.filter(k => k !== 'all');

      if (filters.category.includes(option.key.toString())) {
        updatedCategories = current.filter(k => k !== option.key); // uncheck
      } else {
        updatedCategories = [...current, option.key.toString()]; // check
      }
    }

    // If user unselects all items, revert to "All"
    if (updatedCategories.length === 0) updatedCategories = ['all'];

    onFilterChange({ ...filters, category: updatedCategories });
  }}
  multiSelect
/>
      </div>

      <div className={styles.filterSection}>
        <Label>Business Unit</Label>
        <Dropdown
  className={styles.dropdowndesign}
  placeholder="Select Business Unit"
  options={businessUnitOptions}
  selectedKeys={filters.businessUnit}
  onChange={(ev, option) => {
    if (!option) return;

    let updatedUnits: string[];

    if (option.key === 'all') {
      updatedUnits = ['all'];
    } else {
      const current = filters.businessUnit.filter(k => k !== 'all');

      if (filters.businessUnit.includes(option.key.toString())) {
        updatedUnits = current.filter(k => k !== option.key);
      } else {
        updatedUnits = [...current, option.key.toString()];
      }
    }

    if (updatedUnits.length === 0) updatedUnits = ['all'];

    onFilterChange({ ...filters, businessUnit: updatedUnits });
  }}
  multiSelect
/>
      </div>

      {/* Priority Filter */}
<div className={styles.filterSection}>
  <Label>Priority</Label>
  <Dropdown
    className={styles.dropdowndesign}
    placeholder="Select Priority"
    options={priorityOptions}
    selectedKey={filters.priority}
    onChange={(_, option) => {
      if (option) {
        const newPriority = option.key === 'all' ? undefined : option.key.toString();
        onFilterChange({ ...filters, priority: newPriority });
      }
    }}
  />
</div>

{/* Progress of the Bill Filter */}
<div className={styles.filterSection}>
  <Label>Progress of the Bill</Label>
  <Dropdown
    className={styles.dropdowndesign}
    placeholder="Select Progress"
    options={progressOptions}
    selectedKey={filters.progressOfBill}
    onChange={(_, option) => {
      if (option) {
        const newProgress = option.key === 'all' ? undefined : option.key.toString();
        onFilterChange({ ...filters, progressOfBill: newProgress });
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
