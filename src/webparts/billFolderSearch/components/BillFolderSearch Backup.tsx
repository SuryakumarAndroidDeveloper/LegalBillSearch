// import * as React from 'react';
// import { useState } from 'react';
// import { WebPartContext } from "@microsoft/sp-webpart-base"; // SPFx context
// import { TextField, IconButton, MessageBar, MessageBarType } from '@fluentui/react'; // Fluent UI components
// import Sidebar from "./Sidebar"; // Import Sidebar component
// import styles from "./BillFolderSearch.module.scss"; // Import module-specific styles

// // Props Interface
// export interface IBillFolderSearchProps {
//   context: WebPartContext; // SPFx context
// }

// // Functional Component Definition
// const BillFolderSearch: React.FC<IBillFolderSearchProps> = (props) => {
//   //const { context } = props; // Destructure context from props
//   const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state

//   // Sample resolutions data for demonstration
//   const resolutions = [
//     {
//       id: 1,
//       title: 'H. Con. Res. 14',
//       date: '02/18/2025',
//       description: 'Establishing the congressional budget for fiscal year 2025...',
//     },
//     {
//       id: 2,
//       title: 'R. Ver. Res. 14',
//       date: '03/14/2023',
//       description: 'Establishing the congressional budget for fiscal year 2025...',
//     },
//   ];

//   // Filter resolutions based on search query
//   const filteredResolutions = resolutions.filter((res) =>
//     res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.date.includes(searchQuery)
//   );

//   // Handle search input change
//   const handleSearch = (_: any, newValue?: string) => {
//     setSearchQuery(newValue || '');
//   };

//   return (
//     <div className={styles.container}>
//       {/* Sidebar Component */}
//       <Sidebar />

//       {/* Main Content Section */}
//       <div className={styles.content}>
//         {/* Search Box Section */}
//         <div className={styles.searchBox}>
//           <TextField
//             placeholder="Search by keyword or bill..."
//             value={searchQuery}
//             onChange={handleSearch}
//             iconProps={{ iconName: 'Search' }}
//           />
//         </div>

//         {/* Result Count */}
//         <div className={styles.resultCount}>
//           <span>{filteredResolutions.length} result{filteredResolutions.length !== 1 ? 's' : ''} found</span>
//         </div>

//         <hr />

//         {/* Render Filtered Resolutions */}
//         {filteredResolutions.map((res) => (
//           <div key={res.id} className={styles.resolution}>
//             <div className={styles.resolutionContent}>
//               <span className={styles.tag}>FEDERAL - 119th Congress</span>
//               <h4>{res.title}</h4>
//               <p>{res.description}</p>
//               <small><strong>Introduced:</strong> {res.date}</small>
//             </div>
//             <div className={styles.resolutionActions}>
//               <IconButton iconProps={{ iconName: 'Search' }} />
//               <IconButton iconProps={{ iconName: 'Download' }} />
//             </div>
//           </div>
//         ))}

//         {/* No Results Message */}
//         {filteredResolutions.length === 0 && (
//           <MessageBar messageBarType={MessageBarType.warning}>No matching resolutions found.</MessageBar>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillFolderSearch;
