'use strict';

(function () {
  const STORAGE_KEY = 'apsara-lang';
  const FALLBACK_LANG = 'en';
  const LANGUAGE_TO_HTML = { en: 'en', kh: 'km' };

  const translations = {
          en: {
            nav: {
              logo: '\ud83d\udcca Apsara Report',
              home: 'Home',
              dashboard: 'Dashboard',
              addEntry: 'Add Entry',
              viewList: 'View List',
              settings: 'Settings',
              admin: 'Admin'
            },
            language: {
              toggleLabel: 'Switch language',
              toggleTitle: 'Toggle application language',
              optionLabel: {
                en: 'Switch to English',
                kh: 'Switch to Khmer'
              }
            },
            theme: {
              toggle: {
                title: 'Toggle theme',
                dark: '\ud83c\udf19 Dark',
                light: '\u2600\ufe0f Light',
                darkAria: 'Switch to dark theme',
                lightAria: 'Switch to light theme'
              }
            },
            index: {
              welcomeTitle: 'Welcome to Apsara Report',
              welcomeDescription: 'Track and organize your equipment fleet with real-time updates and smart dashboards.',
              featuresTitle: 'Key features',
              feature: {
                dashboard: {
                  title: '\ud83d\udcc8 Dashboards',
                  text: 'Visualize the status of your inventory across locations at a glance.'
                },
                add: {
                  title: '\u2795 Quick entry',
                  text: 'Capture new equipment details quickly with guided forms.'
                },
                list: {
                  title: '\ud83d\udccb Smart lists',
                  text: 'Search, sort, and filter your inventory using flexible tools.'
                }
              },
              recentAdditions: 'Recently added items',
              noEquipmentHtml: 'No equipment yet. <a href="form.html">Add your first item</a>'
            },
            stats: {
              totalEquipment: 'Total equipment',
              itemsRegistered: 'Items registered',
              computers: 'Computers',
              printers: 'Printers',
              activeUnits: 'Active units',
              operationalUnits: 'Operational units',
              underRepair: 'Under repair',
              nonFunctional: 'Out of service',
              totalUnits: 'Total units'
            },
            buttons: {
              goToDashboard: 'Go to dashboard',
              addEquipment: 'Add equipment',
              viewAll: 'View all',
              edit: 'Edit',
              delete: 'Delete',
              view: 'View'
            },
            common: {
              labels: {
                type: 'Type',
                brand: 'Brand',
                model: 'Model',
                serialNumber: 'Serial number',
                status: 'Status',
                location: 'Location',
                assignedTo: 'Assigned to',
                customerId: 'Customer ID',
                customerPhone: 'Customer phone',
                dateAdded: 'Date check-in',
                actions: 'Actions',
                details: 'Details'
              }
            },
            types: {
              desktop: 'Desktop',
              laptop: 'Laptop',
              printer: 'Printer',
              computer: 'Computer (Legacy)',
              computerLegacy: 'Computer (Legacy)'
            },
            status: {
              working: 'Working',
              maintenance: 'Maintenance',
              broken: 'Broken',
              done: 'Done'
            },
            list: {
              title: 'Equipment list',
              button: {
                addNew: '+ Add new'
              },
              placeholder: {
                search: '\ud83d\udd0d Search by brand, model, serial, customer, or phone...'
              },
              filters: {
                phonePlaceholder: '📞 Filter by phone...',
                dateFrom: 'From date',
                dateTo: 'To date',
                allTypes: 'All types',
                type: {
                  computer: 'Computer (Legacy)',
                  desktop: 'Desktop',
                  laptop: 'Laptop',
                  printer: 'Printer',
                  computerLegacy: 'Computer (Legacy)'
                },
                allStatus: 'All statuses',
                status: {
                  working: 'Working',
                  maintenance: 'Maintenance',
                  broken: 'Broken',
                  done: 'Done'
                }
              },
              modal: {
                title: 'Edit equipment',
                close: 'Close',
                saveChanges: 'Save changes',
                cancel: 'Cancel'
              },
              viewModal: {
                title: 'Equipment images',
                noImage: 'No images attached for this item.',
                imageAlt: 'Attachment {{count}}',
                print: 'Print',
                printUnavailable: 'Open an equipment record before printing.',
                printGenerated: 'Generated on',
                printBlocked: 'Unable to open print view. Please allow pop-ups and try again.',
                printHeading: 'Equipment Summary',
                preview: 'Preview',
                previewTitle: 'Customize print layout',
                previewDescription: 'Choose the sections to include before printing.',
                previewPrint: 'Save & Print',
                previewCancel: 'Cancel',
                previewClose: 'Hide preview',
                previewPaperSizeLabel: 'Paper size',
                previewPaperSize: {
                  auto: 'Browser default',
                  a4: 'A4',
                  letter: 'Letter'
                }
              },
              emptyMessageHtml: 'No equipment yet. <a href="form.html">Add your first item</a>',
              filterNoResults: 'No items match your filters.',
              error: {
                loadEquipment: 'Unable to load the equipment list. Please check the server.',
                loadEquipmentDetails: 'Unable to load equipment details.'
              },
              confirm: {
                delete: 'Are you sure you want to delete this equipment?'
              }
            },
            export: {
              download: '⬇️ Download Excel',
              noData: 'No data to export.',
              success: 'Export started. Check your downloads.'
            },
            messages: {
              updateSuccess: 'Equipment updated successfully!',
              updateError: 'Unable to update equipment.',
              deleteSuccess: 'Equipment deleted successfully!',
              deleteError: 'Unable to delete equipment.',
              loadRecentItemsError: 'Unable to load recent items.',
              imageTooLarge: 'One or more images are too large. Each file must be under 2MB.',
              imageCountExceeded: 'Too many images selected. You can upload up to {{max}} files.',
              imageReadError: 'Failed to process the attachments. Please try again.'
            },
            adminConsole: {
              updateUser: 'Update User',
              placeholder: {
                passwordEdit: 'Leave blank to keep current password'
              },
              message: {
                editingUser: 'Editing {{username}}. Update details and save to apply changes.'
              },
              action: {
                cannotDeleteSelf: 'You cannot delete the account you are signed in with.'
              },
              confirm: {
                deleteUser: 'Are you sure you want to delete this user? This action cannot be undone.'
              },
              success: {
                deleted: 'User deleted successfully.'
              },
              error: {
                deleteFailed: 'Unable to delete user.',
                userNotFound: 'User not found. Refresh the list and try again.'
              }
            },
            storage: {
              status: {
                healthy: 'Healthy',
                warning: 'Warning',
                critical: 'Critical',
                full: 'Full',
                unknown: 'Unknown'
              },
              summary: {
                overallUsage: 'Overall storage usage',
                totalUsage: '{{used}} used / {{total}} total',
                activeCluster: 'Active cluster',
                activeClusterValue: '{{cluster}}',
                activeClusterCaption: 'Current primary cluster',
                freeCapacity: 'Free capacity',
                freeCapacityValue: '{{amount}} available',
                freeCapacityCaption: 'Remaining storage capacity'
              },
              clusterTitle: 'Cluster {{name}}',
              badge: {
                active: 'Active'
              },
              metrics: {
                used: 'Used',
                available: 'Available',
                percent: 'Percent',
                documents: 'Documents'
              },
              noData: 'No storage data available.',
              error: {
                load: 'Unable to load storage data.',
                refresh: 'Unable to refresh storage data.'
              },
              button: {
                refresh: '\ud83d\udd04 Refresh',
                refreshing: '\ud83d\udd04 Refreshing...',
                refreshed: '\u2705 Refreshed',
                error: '\u274c Error'
              }
            },
            dashboard: {
              title: 'Equipment dashboard',
              subtitle: 'Monitor equipment health and trends at a glance.',
              storageTitle: '\ud83d\udcbe Storage usage',
              computerCardTitle: '\ud83d\udcbb Computers',
              printerCardTitle: '\ud83d\udda8\ufe0f Printers',
              chart: {
                type: 'By type',
                status: 'By status',
                brand: 'By brand',
                statusByType: 'Status by type'
              }
            },
            settings: {
              title: 'Background & Display',
              subtitle: 'Personalize the animated backdrop used across the experience.',
              description: 'Select a theme to update the login overlay and application surfaces.',
              checklist: {
                heading: 'Quick tips',
                items: {
                  instant: 'Click a tile to preview instantly.',
                  save: 'Use Save selection to remember your choice for next visits.',
                  reset: 'Need to revert? Reset to default brings back the classic gradient.'
                }
              },
              preview: {
                badge: 'Live preview',
                title: 'Login overlay preview',
                subtitle: 'Changes apply to the landing overlay and global background.',
                chip: 'Selected theme: {{name}}'
              },
              helper: {
                autoApply: 'Selecting a theme updates the preview immediately. Save to keep it for later.'
              },
              option: {
                selectedTag: 'Active',
                instantApply: 'Applies instantly'
              },
              options: {
                default: {
                  title: 'Classic Gradient',
                  description: 'Keeps the original calming gradient backdrop.'
                },
                techLoop: {
                  title: 'Tech Loop',
                  description: 'Pulsing blues flow like circulating data.'
                },
                techWorld: {
                  title: 'Global Grid',
                  description: 'Teal currents sweep across a connected world.'
                },
                futuristicHud: {
                  title: 'Futuristic HUD',
                  description: 'Neon grids and sweeping scanner lights.'
                },
                signalTech: {
                  title: 'Signal Matrix',
                  description: 'Emerald waves ripple with telemetry pulses.'
                },
                smartCity: {
                  title: 'Smart City Lights',
                  description: 'Vertical light trails inspired by skyline beacons.'
                },
                blueData: {
                  title: 'Blue Data Stream',
                  description: 'Azure gradients layered with floating highlights.'
                },
                shootingStars: {
                  title: 'Shooting Stars',
                  description: 'Light streaks race across a midnight sky.'
                },
                blueParticles: {
                  title: 'Blue Particles',
                  description: 'Gentle particle glow over a deep blue canvas.'
                }
              },
              buttons: {
                save: 'Save selection',
                saving: 'Saving...',
                saved: 'Saved',
                reset: 'Reset to default'
              },
              alerts: {
                saved: 'Background updated successfully.',
                reset: 'Background reset to default.',
                error: 'Unable to update the background. Please try again.'
              },
              print: {
                title: 'Print Layout Defaults',
                subtitle: 'Decide which sections appear when printing equipment entries.',
                description: 'Adjust the summary content and save to reuse the layout each time.',
                controls: {
                  includeMeta: {
                    title: 'Include heading meta',
                    description: 'Displays the generated on timestamp beneath the title.'
                  },
                  includeNotes: {
                    title: 'Include notes section',
                    description: 'Shows the captured notes in the printout.'
                  },
                  includeComputerSpecs: {
                    title: 'Include computer specifications',
                    description: 'Adds the computer specification grid when printing desktops or laptops.'
                  },
                  includePrinterSpecs: {
                    title: 'Include printer specifications',
                    description: 'Adds printer-specific details when printing printer records.'
                  },
                  includeAttachments: {
                    title: 'Include attachments',
                    description: 'Outputs embedded images beneath the summary.'
                  },
                  includeFooter: {
                    title: 'Include footer reference',
                    description: 'Prints the source URL at the bottom of the page.'
                  }
                },
                preview: {
                  title: 'Print layout preview',
                  meta: 'Generated on Sep 14, 2025 • 14:32',
                  details: 'Details',
                  note: 'Notes',
                  computerSpecs: 'Computer specifications',
                  printerSpecs: 'Printer specifications',
                  attachments: 'Attachments',
                  footer: 'https://apsara.local/equipment/12345'
                },
                helper: {
                  instant: 'Changes update the preview immediately. Remember to save to keep them.'
                },
                buttons: {
                  save: 'Save print defaults',
                  saving: 'Saving...',
                  saved: 'Saved',
                  reset: 'Reset to defaults'
                },
                alerts: {
                  saved: 'Print defaults updated successfully.',
                  reset: 'Print defaults restored.',
                  error: 'Unable to update print defaults. Please try again.'
                }
              }
            },
            settings: {
              title: 'Background & Display',
              subtitle: 'Customize the animated backdrop for the application.',
              description: 'Select a theme to update the login overlay and application surfaces.',
              checklist: {
                heading: 'Quick tips',
                items: {
                  instant: 'Click a tile to preview instantly.',
                  save: 'Use Save selection to remember your choice for next visits.',
                  reset: 'Need to revert? Reset to default brings back the classic gradient.'
                }
              },
              preview: {
                badge: 'Live preview',
                title: 'Login overlay preview',
                subtitle: 'Changes apply to the landing overlay and global background.',
                chip: 'Selected theme: {{name}}'
              },
              helper: {
                autoApply: 'Selecting a theme updates the preview immediately. Save to keep it for later.'
              },
              option: {
                selectedTag: 'Active',
                instantApply: 'Applies instantly'
              },
              options: {
                default: {
                  title: 'Classic Gradient',
                  description: 'Keeps the original calming gradient backdrop.'
                },
                techLoop: {
                  title: 'Tech Loop',
                  description: 'Pulsing blues flow like circulating data.'
                },
                techWorld: {
                  title: 'Global Grid',
                  description: 'Teal currents sweep across a connected world.'
                },
                futuristicHud: {
                  title: 'Futuristic HUD',
                  description: 'Neon grids and sweeping scanner lights.'
                },
                signalTech: {
                  title: 'Signal Matrix',
                  description: 'Emerald waves ripple with telemetry pulses.'
                },
                smartCity: {
                  title: 'Smart City Lights',
                  description: 'Vertical light trails inspired by skyline beacons.'
                },
                blueData: {
                  title: 'Blue Data Stream',
                  description: 'Azure gradients layered with floating highlights.'
                },
                shootingStars: {
                  title: 'Shooting Stars',
                  description: 'Light streaks race across a midnight sky.'
                },
                blueParticles: {
                  title: 'Blue Particles',
                  description: 'Gentle particle glow over a deep blue canvas.'
                }
              },
              buttons: {
                save: 'Save selection',
                saving: 'Saving...',
                saved: 'Saved',
                reset: 'Reset to default'
              },
              alerts: {
                saved: 'Background updated successfully.',
                reset: 'Background reset to default.',
                error: 'Unable to update the background. Please try again.'
              },
              print: {
                title: 'Print Layout Defaults',
                subtitle: 'Decide which sections appear when printing equipment entries.',
                description: 'Adjust the summary content and save to reuse the layout each time.',
                controls: {
                  includeMeta: {
                    title: 'Include heading meta',
                    description: 'Displays the generated on timestamp beneath the title.'
                  },
                  includeNotes: {
                    title: 'Include notes section',
                    description: 'Shows the captured notes in the printout.'
                  },
                  includeComputerSpecs: {
                    title: 'Include computer specifications',
                    description: 'Adds the computer specification grid when printing desktops or laptops.'
                  },
                  includePrinterSpecs: {
                    title: 'Include printer specifications',
                    description: 'Adds printer-specific details when printing printer records.'
                  },
                  includeAttachments: {
                    title: 'Include attachments',
                    description: 'Outputs embedded images beneath the summary.'
                  },
                  includeFooter: {
                    title: 'Include footer reference',
                    description: 'Prints the source URL at the bottom of the page.'
                  }
                },
                preview: {
                  title: 'Print layout preview',
                  meta: 'Generated on Sep 14, 2025 • 14:32',
                  details: 'Details',
                  note: 'Notes',
                  computerSpecs: 'Computer specifications',
                  printerSpecs: 'Printer specifications',
                  attachments: 'Attachments',
                  footer: 'https://apsara.local/equipment/12345'
                },
                helper: {
                  instant: 'Changes update the preview immediately. Remember to save to keep them.'
                },
                buttons: {
                  save: 'Save print defaults',
                  saving: 'Saving...',
                  saved: 'Saved',
                  reset: 'Reset to defaults'
                },
                alerts: {
                  saved: 'Print defaults updated successfully.',
                  reset: 'Print defaults restored.',
                  error: 'Unable to update print defaults. Please try again.'
                }
              }
            },
            form: {
              title: 'Add equipment',
              fields: {
                type: 'Equipment type *',
                brand: 'Brand *',
                model: 'Model *',
                serialNumber: 'Serial number',
                status: 'Status *',
                location: 'Location',
                purchaseDate: 'Purchase date',
                checkInDate: 'Date check-in',
                warrantyExpiry: 'Warranty expiry',
                assignedTo: 'Assigned to',
                customerId: 'Customer ID',
                customerPhone: 'Customer phone',
                image: 'Attach images',
                processor: 'Processor',
                ram: 'RAM',
                storage: 'Storage',
                os: 'Operating system',
                printerType: 'Printer type',
                printTechnology: 'Print technology',
                connectivity: 'Connectivity',
                notes: 'Notes'
              },
              options: {
                type: {
                  default: 'Select type',
                  desktop: 'Desktop',
                  laptop: 'Laptop',
                  printer: 'Printer'
                },
                status: {
                  working: 'Working',
                  maintenance: 'Maintenance',
                  broken: 'Broken',
                  done: 'Done'
                },
                printerType: {
                  default: 'Select type',
                  inkjet: 'Inkjet',
                  laser: 'Laser',
                  thermal: 'Thermal',
                  dotMatrix: 'Dot matrix'
                },
                printTechnology: {
                  default: 'Select option',
                  color: 'Color',
                  monochrome: 'Monochrome'
                }
              },
              placeholders: {
                brand: 'e.g., HP, Dell, Canon',
                model: 'e.g., LaserJet Pro, Inspiron 15',
                serialNumber: 'Enter serial number',
                location: 'e.g., Head office, Room 305',
                assignedTo: 'Person responsible',
                customerId: 'Enter customer code',
                customerPhone: 'e.g., 012 345 678',
                checkInDate: 'Select check-in date',
                processor: 'e.g., Intel Core i5',
                ram: 'e.g., 8GB, 16GB',
                storage: 'e.g., 256GB SSD, 1TB HDD',
                os: 'e.g., Windows 11, Ubuntu',
                connectivity: 'e.g., USB, WiFi, Ethernet',
                notes: 'Additional notes'
              },
              helpers: {
                image: 'Upload up to 5 JPG or PNG files. Each must be under 2MB.'
              },
              computerSpecsTitle: 'Computer specifications',
              printerSpecsTitle: 'Printer specifications',
              buttons: {
                submit: 'Submit',
                processing: 'Processing...',
                clear: 'Clear form',
                cancel: 'Cancel'
              }
            }
          },
          kh: {
            nav: {
              logo: '\ud83d\udcca Apsara Report',
              home: '\u1791\u17bb\u1780\u17d2\u1798\u1784\u17cb',
              dashboard: '\u1794\u178f\u17d2\u178f\u179b\u17c4\u1793\u17b8\u1780\u17b6\u179a',
              addEntry: '\u1794\u178f\u17d2\u178f\u1794\u17c0\u1784\u179b\u17b6\u1793',
              viewList: '\u1798\u1793\u17b6\u17c6\u1796\u17bb\u1793\u1796\u17bb\u1793',
              settings: '\u1780\u17b6\u1793\u17cb\u178f\u17bb\u1790',
              admin: 'Admin'
            },
            language: {
              toggleLabel: '\u1794\u178f\u17d2\u178f\u1794\u17ba\u1780\u179b\u17c1\u1784',
              toggleTitle: '\u1794\u178f\u17d2\u178f\u1794\u17ba\u1780\u179b\u17c1\u1784\u1793\u17c3\u179f\u17ca\u17d2\u1787\u17b6\u1793\u17cb',
              optionLabel: {
                en: '\u1794\u17b6\u179f\u200b\u1780\u17bb\u178f\u17cb\u17a2\u1784\u1780\u17d2\u179b\u17c1\u179f',
                kh: '\u1794\u17b6\u179f\u200b\u1780\u17bb\u178f\u17cb\u1781\u17d2\u1798\u17c2'
              }
            },
            theme: {
              toggle: {
                title: '\u1794\u178a\u17cb\u1794\u17d2\u179a\u179c\u17b6\u1793\u179c\u17b6\u1793\u1796\u17bb\u1793',
                dark: '\ud83c\udf19 \u179a\u17c6\u17c7\u178a\u17b8\u178f',
                light: '\u2600\ufe0f \u179a\u17c6\u1794\u17d2\u179a\u17be\u1780',
                darkAria: '\u1794\u178f\u17d2\u178f\u17b7\u1791\u200b\u17b7\u1780\u17d2\u178a\u179a\u17c6\u17c7\u178a\u17b8\u178f',
                lightAria: '\u1794\u178f\u17d2\u178f\u17b7\u1791\u200b\u17b7\u1780\u17d2\u178a\u179a\u17c6\u1794\u17d2\u179a\u17be\u1780'
              }
            },
            index: {
              welcomeTitle: '\u179f\u17bc\u1798\u179f\u17c5\u17a0\u17d2\u178f\u17c6\u1780\u1794\u1789\u200b\u179f\u17d2\u179a\u17bc\u1794\u17b6\u1799\u1780\u17b6\u179a\u17bb\u1793 Apsara',
              welcomeDescription: '\u178a\u17bb\u1791\u1791\u17b6\u1780\u17d2\u179a\u17bb\u1793\u179b\u1784\u17cb\u17a2\u17b6\u178f\u17cb\u1793\u17c3\u179f\u17ca\u17b8\u1780\u17b6\u1794\u178e\u17c3\u179b\u1784\u17cb\u1798\u17bb\u1793\u1796\u17bb\u1793\u1796\u17bb\u1793\u1798\u17c9\u17c1\u1782\u17b6\u1794\u1797\u17b6\u1793\u1798\u17bb\u1793\u200b\u1780\u17d2\u179a\u17bb\u1793\u1796\u17bb\u1793 \u1798\u17c9\u17bb\u179b\u17a2\u17d2\u1794\u17bc\u1793\u178f\u17b7\u1791\u1793\u17d2\u179a\u17bb\u1793',
              featuresTitle: '\u179b\u1780\u17d2\u1794\u1784\u1797\u17b6\u1793\u1796\u17bb\u1780\u17d2\u179f',
              feature: {
                dashboard: {
                  title: '\ud83d\udcc8 \u1794\u17d2\u179a\u178f\u17b6\u1784\u179f\u1798\u17bc\u1798',
                  text: '\u1798\u17c9\u17bb\u179b\u1798\u17c9\u17bb\u179b\u178f\u17d2\u179a\u17b6\u1780\u17d2\u178f\u17bb\u1793\u1791\u17bc\u1798\u17b6\u179b\u1796\u17bb\u1793\u1796\u17bb\u1793\u1798\u17bb\u1793\u17a2\u17b6\u179f\u17cb\u17a0\u17d2\u178f\u17c2\u1793\u200b\u1797\u17c6\u1793\u17d2\u1799\u17c1\u179f\u200b\u1798\u17bb\u1793\u1780\u17d2\u179a\u17bb\u1793\u1796\u17bb\u1793'
                },
                add: {
                  title: '\u2795 \u1794\u178f\u17d2\u178f\u1781\u17bc\u179f\u1798\u17b6\u1793',
                  text: '\u17c6\u1796\u17b6\u178f\u200b\u1798\u17c9\u17bb\u179b\u1796\u17c1\u1794\u179f\u1793\u17b6\u178a\u17b6\u1793\u1798\u17bb\u1793\u200b\u1780\u17d2\u179a\u17bb\u1793\u1796\u17bb\u1793\u17a2\u1780\u17d2\u178f\u17bb\u1793\u1796\u17bb\u1793\u178f\u17b6\u179a'
                },
                list: {
                  title: '\ud83d\udccb \u1798\u17d2\u179b\u1793\u1794\u17bd\u1793\u17d2\u179c',
                  text: '\u179a\u17c6\u1794\u178f\u17d2\u179a\u17b6\u1791\u17d2\u179c\u17bb\u1793\u179f\u17d2\u179c\u17b6\u1780\u1794\u1784\u17cb\u1793\u17c3\u200b\u1796\u17bb\u1793\u1796\u17bb\u1793\u1797\u17b6\u1793\u179f\u17c6\u1798\u1796\u1791\u17d2\u1799\u17c1\u179f'
                }
              },
              recentAdditions: '\u1780\u17b6\u1794\u178f\u17d2\u178f\u1781\u17bc\u179f\u1798\u17b6\u1793\u1794\u178f\u17d2\u179f\u1797\u17d2\u1799\u17bb\u178f',
              noEquipmentHtml: '\u1798\u17b7\u1793\u178f\u17b6\u178f\u1791\u17bb\u1798\u200b\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793 <a href="form.html">\u1794\u178f\u17d2\u178f\u1781\u17bc\u179f\u1798\u17b6\u1793\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793\u1780\u178e\u17d2\u1786\u17bb\u1793</a>'
            },
            stats: {
              totalEquipment: '\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793\u17a2\u17b6\u179f\u200b\u179f\u17d2\u178f\u179a',
              itemsRegistered: '\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793\u179f\u17d2\u179a\u17bc\u1780\u179f\u1780\u178f',
              computers: '\u1780\u17bb\u1796\u17d2\u179a\u1791\u17b7\u1793\u1780',
              printers: '\u1798\u17b6\u179f\u17ca\u17b7\u1793\u1796\u17c9\u17c1\u1784',
              activeUnits: '\u17a2\u17b6\u179f\u17cb\u17a2\u1798\u17d2\u1796\u17b8\u1793\u17c8',
              operationalUnits: '\u17a2\u17b6\u179f\u17cb\u1794\u17be\u178f\u17d2\u178f\u1784\u17cb\u200b\u179f\u1798\u17bc\u1798',
              underRepair: '\u1794\u178f\u17d2\u178f\u17b9\u1784\u17cd\u1798\u17d2\u1798\u1796\u17b6\u178f',
              nonFunctional: '\u1798\u17b7\u1793\u178f\u17d2\u1799\u17c1\u179f\u179f\u1798\u17bc\u1798',
              totalUnits: '\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793\u179f\u17d2\u179a'
            },
            buttons: {
              goToDashboard: '\u1791\u17bc\u178f\u17bd\u178f\u179c\u1784\u17cb\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793',
              addEquipment: '\u1794\u178f\u17d2\u178f\u1794\u17c0\u1784\u1796\u17bb\u1793\u1796\u17bb\u1793',
              viewAll: '\u1798\u17b8\u179f\u17c6\u1798\u17b9\u1784',
              edit: '\u1794\u17b6\u179f\u1780\u17d2\u179f\u17c4',
              delete: '\u1794\u17b6\u179f\u1780\u17d2\u179f\u17c4',
              view: '\u1794\u17d2\u1791\u17b8'
            },
            common: {
              labels: {
                type: '\u1796\u17bb\u1793\u1780',
                brand: '\u1798\u17b6\u179f',
                model: '\u1798\u17bb\u179b\u179c\u17b6\u1793',
                serialNumber: '\u179b\u17c1\u1780\u178f\u17d2\u179a\u17bc\u1794',
                status: '\u1798\u17b7\u1793\u1780\u200b\u1796\u1798\u17c9\u17b8',
                location: '\u1794\u17d2\u179a\u17b6\u1780\u17cf\u1798\u17bb\u1793',
                assignedTo: '\u179f\u17bb\u1780\u17d2\u1790\u17bb',
                customerId: '\u179b\u17c1\u1780\u179f\u1798\u1785\u17d2\u179a\u17bb\u1780',
                customerPhone: '\u1791\u17bc\u178f\u17c0\u179b\u17cb\u179f\u1798\u1785\u17d2\u179a\u17bb\u1780',
                dateAdded: 'កាលបរិច្ឆេទចូល',
                actions: '\u179a\u17c6\u1794',
                details: 'ព័ត៌មានលម្អិត'
              }
            },
            types: {
              desktop: 'Desktop',
              laptop: 'Laptop',
              printer: '\u1798\u17b6\u179f\u17ca\u17b7\u1793',
              computer: '\u1780\u17bb\u1796\u17d2\u179a\u1791\u17b7\u1793\u1780',
              computerLegacy: '\u1780\u17bb\u1796\u17d2\u179a\u1791\u17b7\u1793\u1780 (Legacy)'
            },
            status: {
              working: '\u179f\u1798\u17bc\u1798',
              maintenance: '\u1798\u17c9\u17bb\u179b\u179f\u17b6\u178f\u17cb\u178f',
              broken: '\u1796\u1798\u17c9\u17b8',
              done: 'Done'
            },
            list: {
              title: '\u1794\u17d2\u179a\u1791\u17bb\u178f\u1794\u17d2\u178f\u1798\u178f\u17d2\u1799\u17c1\u179f',
              button: {
                addNew: '+ \u1794\u17b6\u179f'
              },
              placeholder: {
                search: '\ud83d\udd0d \u179f\u17d2\u179c\u17b6\u1780\u1798\u17b6\u179f\u1798\u17b6\u179f \u1798\u17bb\u179b\u179c\u17b6\u1793 \u179b\u17c1\u1780\u178f\u17d2\u179a\u17bc\u1794 \u17a2\u178f\u17bb\u1793 \u179f\u1798\u1785\u17d2\u179a\u17bb\u1780 \u1792\u17bd\u1794\u17c2\u179b...'
              },
              filters: {
                phonePlaceholder: '📞 ស្វែងរកតាមលេខទូរស័ព្ទ...',
                dateFrom: 'ចាប់ពីកាលបរិច្ឆេទ',
                dateTo: 'ដល់កាលបរិច្ឆេទ',
                dateLabel: 'ច្រោះតាមកាលបរិច្ឆេទបញ្ចូល',
                allTypes: '\u1796\u17bb\u1793\u1780\u1791\u17d2\u1799\u17c1\u179f',
                type: {
                  desktop: 'Desktop',
                  laptop: 'Laptop',
                  printer: '\u1798\u17b6\u179f\u17ca\u17b7\u1793',
                  computer: 'Computer (Legacy)',
                  computerLegacy: 'Computer (Legacy)'
                },
                allStatus: '\u1798\u17b7\u1793\u1780\u1791\u17d2\u1799\u17c1\u179f',
                status: {
                  working: '\u179f\u1798\u17bc\u1798',
                  maintenance: '\u1798\u17c9\u17bb\u179b\u179f\u17b6\u178f\u17cb\u178f',
                  broken: '\u1796\u1798\u17c9\u17b8',
                  done: 'Done'
                }
              },
              modal: {
                title: '\u1794\u17d2\u179a\u178f\u17b6\u179f\u1796\u17bb\u1793\u1796\u17bb\u1793',
                close: '\u1794\u17d2\u1791\u17b8',
                saveChanges: '\u1794\u17d2\u178f\u179b\u17b6\u1784\u1796\u17bb\u1793\u1796\u17bb\u1793',
                cancel: '\u179c\u17be'
              },
              viewModal: {
                title: 'Equipment images',
                noImage: 'No images attached for this item.',
                imageAlt: 'Attachment {{count}}',
                print: 'បោះពុម្ព',
                printUnavailable: 'សូមបើកព័ត៌មានឧបករណ៍មុនពេលបោះពុម្ព។',
                printGenerated: 'បានបង្កើតនៅ',
                printBlocked: 'មិនអាចបើកទំព័របោះពុម្ពបានទេ។ សូមអនុញ្ញាតឱ្យបង្អួចលេចឡើង ហើយព្យាយាមម្តងទៀត។',
                printHeading: 'សេចក្តីសង្ខេបឧបករណ៍',
                preview: 'មើលមុន',
                previewTitle: 'ប្ដូររៀបចំបោះពុម្ព',
                previewDescription: 'ជ្រើសផ្នែកដែលត្រូវបញ្ចូលមុនពេលបោះពុម្ព។',
                previewPrint: 'រក្សាទុក និងបោះពុម្ព',
                previewCancel: 'បោះបង់',
                previewClose: 'បិទការមើលមុន',
                previewPaperSizeLabel: 'ទំហំក្រដាស',
                previewPaperSize: {
                  auto: 'លំនាំដើមកម្មវិធីរកឃើញ',
                  a4: 'A4',
                  letter: 'Letter'
                }
              },
              emptyMessageHtml: '\u1798\u17b7\u1793\u178f\u17b6\u178f\u1791\u17bb\u1798\u200b\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793 <a href="form.html">\u1794\u178f\u17d2\u178f\u1781\u17bc\u179f\u1798\u17b6\u1793\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793\u1780\u178e\u17d2\u1786\u17bb\u1793</a>',
              filterNoResults: '\u1798\u17b7\u1793\u178f\u17d2\u1799\u17c1\u179f\u1794\u17d2\u179a\u17bd\u1798\u17c6\u179b\u17ba',
              error: {
                loadEquipment: '\u1796\u17b8\u1780\u1793\u17c3\u1790\u17b9\u1794\u1780\u1794\u1793\u1791\u1780\u17b6\u1794\u1794\u17d2\u179a\u178f\u17c6',
                loadEquipmentDetails: '\u1796\u17bb\u1793\u1791\u17c2\u1784\u17cb\u1796\u1793\u17dd'
              },
              confirm: {
                delete: '\u1780\u17d2\u179a\u1784\u17cf\u178f\u1789\u17d2\u178f\u17bc\u179b\u1794\u178f\u17d2\u178f\u1794\u17d2\u178f'
              }
            },
            export: {
              download: '⬇️ ទាញយក Excel',
              noData: 'មិនមានទិន្នន័យសម្រាប់ទាញយកទេ។',
              success: 'ការទាញយកបានចាប់ផ្តើមហើយ។ សូមពិនិត្យថតទាញយករបស់អ្នក។'
            },
            messages: {
              updateSuccess: '\u1796\u17bb\u1793\u1794\u17bb\u179c\u200b\u17a2\u1785\u17d2\u179a\u17bb\u1784\u1794\u17d8\u179f',
              updateError: '\u1796\u17b8\u1780\u179f\u17d2\u1791\u17bb\u178f\u1794\u17d2\u179a\u178f\u17c6',
              deleteSuccess: '\u1796\u17bb\u1793\u1794\u17bb\u179c\u17d6\u17d6\u1798\u17c9\u17c1',
              deleteError: '\u1796\u17b8\u1780\u179f\u17d2\u1791\u17bb\u178f\u179b\u17c1\u1780',
              loadRecentItemsError: '\u1796\u17b8\u1780\u179f\u17d2\u1791\u17bb\u178f\u1780\u17b6\u1794',
              imageTooLarge: 'One or more images are too large. Each file must be under 2MB.',
              imageCountExceeded: 'Too many images selected. You can upload up to {{max}} files.',
              imageReadError: 'Failed to process the attachments. Please try again.'
            },
            adminConsole: {
              updateUser: 'Update User',
              placeholder: {
                passwordEdit: 'Leave blank to keep current password'
              },
              message: {
                editingUser: 'Editing {{username}}. Update details and save to apply changes.'
              },
              action: {
                cannotDeleteSelf: 'You cannot delete the account you are signed in with.'
              },
              confirm: {
                deleteUser: 'Are you sure you want to delete this user? This action cannot be undone.'
              },
              success: {
                deleted: 'User deleted successfully.'
              },
              error: {
                deleteFailed: 'Unable to delete user.',
                userNotFound: 'User not found. Refresh the list and try again.'
              }
            },
            storage: {
              status: {
                healthy: '\u1780\u1793\u17c8\u17a0\u17bc\u1792\u179b\u17c4',
                warning: '\u179c\u17bd\u1794\u17b9',
                critical: '\u1780\u17d2\u179a\u17b8\u179b\u17c1\u179a\u1785\u17bc\u179f\u17cb',
                full: '\u1794\u1793\u1791',
                unknown: '\u1798\u17b7\u1793\u178f\u17b6\u178f'
              },
              summary: {
                overallUsage: '\u1780\u17d2\u179a\u1784\u1793\u17c3\u1794\u178f\u17d2\u178f\u200b\u179f\u17ca\u17b7\u1793\u179f\u17c6\u1798\u1796\u17b6\u178f',
                totalUsage: '{{used}} \u1798\u17c1\u1784\u1780\u17d2\u179a\u17bb\u179f / {{total}} \u1798\u17c1\u1784\u1780\u17d2\u179a\u17bb\u179f',
                activeCluster: '\u1780\u17d2\u179a\u1784\u178f\u17d2\u179a\u17b6\u1793 \u179f\u17d2\u17a0\u17bc\u1792',
                activeClusterValue: '{{cluster}}',
                activeClusterCaption: '\u1794\u17b7\u179f\u17d2\u179a\u17b6\u1784\u17cb\u1794\u178f\u17d2\u178f\u1793\u17c3\u1780\u17b6\u1794\u17cb',
                freeCapacity: '\u179f\u1798\u17c6\u17a2\u17d2\u179a\u17b9\u200b\u1791\u17b6\u178f\u200b\u17a0\u17d2\u178f\u17c4',
                freeCapacityValue: '{{amount}} \u1798\u17c1\u1784\u1780\u17d2\u179a\u17bb\u179f',
                freeCapacityCaption: '\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1794\u178f\u17d2\u178f\u1798\u17b6\u178f\u1780\u17b6\u1794\u178f\u17d2\u178f\u17c6\u1793\u17b7\u179f'
              },
              clusterTitle: '\u1780\u17d2\u179a\u1784\u178f\u17d2\u179a\u17b6\u1793 {{name}}',
              badge: {
                active: '\u179f\u17ca\u17bb\u1793\u1794\u17b7'
              },
              metrics: {
                used: '\u1794\u178f\u17d2\u178f\u1794\u1789\u17b6\u17c6',
                available: '\u1791\u17b6\u178f\u200b\u17a0\u17d2\u178f\u17c4',
                percent: '\u1795\u17b6\u1780\u179a\u17c9\u1784',
                documents: '\u17a2\u17b6\u179f\u17cb'
              },
              noData: '\u1798\u17b7\u1793\u178f\u17b6\u178f\u1791\u17bc\u178f\u17c0\u179b\u17cb\u200b\u1794\u17d2\u179a\u1791\u17bb\u178f\u179f\u17ca\u17b7\u1793',
              error: {
                load: '\u1798\u17c9\u17d2\u1793\u17bb\u1780\u179b\u17c4\u17c7\u1780\u17b6\u178f\u17c2\u1784\u17cb\u179f\u17ca\u17b7\u1793\u1794\u17d2\u179a\u1791\u17bb\u178f',
                refresh: '\u1798\u17c9\u17d2\u1793\u17bb\u1780\u179b\u17c4\u17c7\u1780\u17b6\u178f\u17c2\u1784\u17cb\u1792\u179b\u1798\u178f\u17b7\u1791\u1796\u1798\u17d2\u1798'
              },
              button: {
                refresh: '\ud83d\udd04 \u1794\u17c3\u1794\u17d2\u179a\u17b8\u179f',
                refreshing: '\ud83d\udd04 \u1798\u17c9\u17d2\u1799\u17b8\u179f\u17b7\u1791\u1796\u1798\u17d2\u1798...',
                refreshed: '\u2705 \u1794\u17c3\u1794\u17d2\u179a\u17b8\u179f\u200b\u179f\u17c6\u1784',
                error: '\u274c \u1794\u178e\u17c4\u17c7'
              }
            },
            dashboard: {
              title: '\u179f\u1782\u178e\u17c4\u17c7\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793',
              subtitle: '\u179f\u1798\u17bc\u1798\u1794\u17bd\u1793\u200b\u17a2\u17b6\u179f\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793\u1797\u17b6\u1793\u179f\u17c6\u1798\u17d2\u1799\u17c1\u179f',
              storageTitle: '\ud83d\udcbe \u1794\u17d2\u179a\u1791\u17bb\u178f\u1794\u179f\u17d2\u178f\u1780\u17b7\u1793\u1780\u17d2\u179a\u17b6\u1793\u1796\u17bb\u1793',
              computerCardTitle: '\ud83d\udcbb \u1780\u17bb\u1796\u17d2\u179a\u1791\u17b7\u1793\u1780',
              printerCardTitle: '\ud83d\udda8\ufe0f \u1798\u17b6\u179f\u17ca\u17b7\u1793',
              chart: {
                type: '\u17a2\u17b6\u179f\u17cb\u1793\u17c3\u1796\u17bb\u1793\u1780',
                status: '\u179f\u17d2\u178f\u17bc\u179a\u178a\u17b6\u1793\u179f\u17c6\u1798\u178f\u17d2\u1799\u17c1\u179f',
                brand: '\u17a2\u17b6\u179f\u17cb\u1793\u17c3\u1798\u17b6\u179f',
                statusByType: '\u179f\u17d2\u178f\u17bc\u179a\u17b8\u1793\u17c3\u1796\u17bb\u1793\u1780'
              }
            },
            form: {
              title: '\u1794\u178f\u17d2\u178f\u1781\u17bc\u179f\u1798\u17b6\u1793\u17cb\u1796\u17bb\u1793\u1796\u17bb\u1793',
              fields: {
                type: '\u1796\u17bb\u1793\u1780\u17a2\u17b6\u179f\u17cb *',
                brand: '\u1798\u17b6\u179f *',
                model: '\u1798\u17bb\u179b\u179c\u17b6\u1793 *',
                serialNumber: '\u179b\u17c1\u1780\u178f\u17d2\u179a\u17bc\u1794',
                status: '\u179f\u1798\u17bc\u1798\u1794\u17bd\u1793 *',
                location: '\u1791\u17c2\u1798\u17c9\u1784',
                purchaseDate: '\u1780\u17b6\u179f\u17b6\u1794\u17d2\u179a\u1794\u178f\u17d2\u178f\u1796\u17c9\u17c1\u1784',
                checkInDate: 'កាលបរិច្ឆេទចូល',
                warrantyExpiry: '\u1780\u17b6\u179f\u17b6\u1794\u17d2\u179a\u179c\u1793\u1791\u179b\u1799\u17b6\u1793\u1797\u17d2\u1799\u17bb\u179f',
                assignedTo: '\u179f\u17b6\u179a\u17bb\u1794\u17ba\u1780',
                customerId: '\u179b\u17c1\u1780\u1793\u17b9\u1791\u200b\u17a0\u17bc\u178f',
                customerPhone: '\u1791\u17bc\u178f\u17c0\u179b\u17cb\u1793\u17c3\u1790\u17b9\u1794',
                image: 'Attach images',
                processor: '\u1796\u17b8\u1780\u17b7\u1793\u178f\u17d2\u178f',
                ram: 'RAM',
                storage: '\u1794\u17d2\u179a\u1791\u17bb\u178f',
                os: '\u1794\u17d2\u179a\u17bc\u1794\u17b7\u17a2\u17bb\u179e\u17b6\u1793',
                printerType: '\u1796\u17bb\u1793\u1780\u1798\u17b6\u179f\u17ca\u17b7\u1793',
                printTechnology: '\u1794\u17d2\u179a\u1791\u17bb\u178f\u178f\u17bc\u1794\u178f\u17d2\u1790\u17bb\u1780\u1797\u17b6\u1793',
                connectivity: '\u179f\u17d2\u1794\u17be\u17a2\u1794\u178f\u17d2\u178f',
                notes: '\u1780\u17b6\u1793\u178a\u17cb\u17c3'
              },
              options: {
                type: {
                  default: '\u1787\u17d2\u179a\u17c1\u179f\u1796\u17bb\u1793\u1780',
                  desktop: 'Desktop',
                  laptop: 'Laptop',
                  printer: '\u1798\u17b6\u179f\u17ca\u17b7\u1793'
                },
                status: {
                  working: '\u1798\u17b7\u1793\u200b\u1794\u17bd\u1793\u178f\u17d2\u178f\u1784\u17cb',
                  maintenance: '\u1794\u178f\u17d2\u178f\u17b9\u1784\u17cd\u1798\u17d2\u1798\u179f\u1780',
                  broken: '\u1781\u17c5\u1796',
                  done: 'Done'
                },
                printerType: {
                  default: '\u1787\u17d2\u179a\u17c1\u179f\u1796\u17bb\u1793\u1780',
                  inkjet: '\u17a2\u17b8\u1784\u17cb\u1792\u17d2\u179f\u17c1\u1784',
                  laser: '\u179b\u17b6\u179f\u17c1\u1784',
                  thermal: '\u1790\u17ba\u1798\u17bb\u1784',
                  dotMatrix: '\u178c\u17bc\u178f\u17cb\u1798\u17c9\u17b8\u1780\u17d2\u179f'
                },
                printTechnology: {
                  default: '\u1787\u17d2\u179a\u17c1\u179f\u1794\u179f\u17d2\u178f\u1780\u17b6\u178f\u1798\u17d2\u1799\u17c1\u179f',
                  color: '\u1794\u17bb\u179c',
                  monochrome: '\u1781\u17c2\u179f\u179f\u1785\u17bc\u179f'
                }
              },
              placeholders: {
                brand: '\u17a2\u17ba\u179f\u179b\u17be\u179f HP, Dell, Canon',
                model: '\u17a2\u17ba\u179f LaserJet Pro, Inspiron 15',
                serialNumber: '\u179b\u17c1\u1780\u178f\u17d2\u179a\u17bc\u1794 \u179f\u17d2\u179a\u179b\u17c0\u1784',
                location: '\u1791\u17c2\u1798\u17c9\u1784\u17a2\u1794\u1784\u17d2\u1781\u17b8 \u1794\u17d2\u179a\u17bb\u1794\u17d2\u1799\u17b3\u179b',
                assignedTo: '\u17a2\u17ba\u179f\u179b\u17be\u179f\u1794\u17d2\u179a\u178f\u17b6\u17a2\u178f\u17b7\u1791\u17c1\u179f',
                customerId: '\u179b\u17c1\u1780\u1799\u17b6\u1793\u17cb\u1794\u17d2\u179a\u1794\u178f\u17d2\u179f\u17d0\u17b6\u178f',
                customerPhone: '\u17a2\u17ba\u179f 012 345 678',
                checkInDate: 'ជ្រើសកាលបរិច្ឆេទចូល',
                processor: '\u17a2\u17ba\u179f Intel Core i5',
                ram: '\u17a2\u17ba\u179f 8GB, 16GB',
                storage: '\u17a2\u17ba\u179f 256GB SSD, 1TB HDD',
                os: '\u17a2\u17ba\u179f Windows 11, Ubuntu',
                connectivity: '\u17a2\u17ba\u179f USB, WiFi, Ethernet',
                notes: '\u1780\u17b6\u1793\u178a\u17cb\u1794\u178f\u17d2\u178f\u1791\u17c1\u179f'
              },
              helpers: {
                image: 'Upload up to 5 JPG or PNG files. Each must be under 2MB.'
              },
              computerSpecsTitle: '\u179b\u1780\u17d2\u1794\u1784\u17d2\u1798\u1786\u17b6\u1793\u1780\u17bb\u1796\u17d2\u179a\u1791\u17b7\u1793\u1780',
              printerSpecsTitle: '\u179b\u1780\u17d2\u1794\u1784\u17d2\u1798\u1786\u17b6\u1793\u1798\u17b6\u179f\u17ca\u17b7\u1793',
              buttons: {
                submit: '\u1794\u178f\u17d2\u178f\u1794\u17c0\u1784\u1798\u17bb\u1793',
                processing: '\u1798\u17c9\u17d2\u1799\u17b8\u179f\u17b7\u1791\u1796\u1798\u17d2\u1798...',
                clear: '\u179f\u1793\u17d2\u1791\u179f\u1798\u17b6\u179f\u1780',
                cancel: '\u1794\u178f\u17d2\u178f\u1794\u178f\u17c6'
              }
            }
          }
  };

    const listeners = new Set();
    let currentLang = FALLBACK_LANG;

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* storage unavailable */
      }
    }
  };

  const resolvePath = (obj, path) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

  const formatValue = (value, params) => {
    if (!params || typeof value !== 'string') {
      return value;
    }
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => {
      if (Object.prototype.hasOwnProperty.call(params, name)) {
        return params[name];
      }
      return '';
    });
  };

  const translate = (key, options = {}) => {
    const { fallback, params } = options;

    const byLang = resolvePath(translations[currentLang], key);
    if (typeof byLang === 'string') {
      return formatValue(byLang, params);
    }

    const fallbackValue = resolvePath(translations[FALLBACK_LANG], key);
    if (typeof fallbackValue === 'string') {
      return formatValue(fallbackValue, params);
    }

    if (typeof fallback === 'string') {
      return formatValue(fallback, params);
    }

    return key;
  };

  const toDatasetKey = (suffix) => `i18nFallback${suffix}`;

  const ensureFallback = (element, attr) => {
    const datasetKey = toDatasetKey(attr ? attr.replace(/[^a-zA-Z0-9]/g, '') : 'Text');
    if (!Object.prototype.hasOwnProperty.call(element.dataset, datasetKey)) {
      if (attr) {
        element.dataset[datasetKey] = element.getAttribute(attr) || '';
      } else {
        element.dataset[datasetKey] = element.innerHTML.trim();
      }
    }
    return element.dataset[datasetKey];
  };

  const applyTranslations = () => {
    const mappings = [
      { selector: '[data-i18n]', apply: (el, key) => {
        const fallback = ensureFallback(el);
        el.innerHTML = translate(key, { fallback });
      } },
      { selector: '[data-i18n-placeholder]', apply: (el, key) => {
        const fallback = ensureFallback(el, 'placeholder');
        el.setAttribute('placeholder', translate(key, { fallback }));
      } },
      { selector: '[data-i18n-title]', apply: (el, key) => {
        const fallback = ensureFallback(el, 'title');
        el.setAttribute('title', translate(key, { fallback }));
      } },
      { selector: '[data-i18n-aria-label]', apply: (el, key) => {
        const fallback = ensureFallback(el, 'aria-label');
        el.setAttribute('aria-label', translate(key, { fallback }));
      } },
      { selector: '[data-i18n-aria-description]', apply: (el, key) => {
        const fallback = ensureFallback(el, 'aria-description');
        el.setAttribute('aria-description', translate(key, { fallback }));
      } }
    ];

    mappings.forEach(({ selector, apply }) => {
      document.querySelectorAll(selector).forEach((element) => {
        const key = element.getAttribute(selector.replace('[', '').replace(']', ''));
        if (!key) {
          return;
        }
        apply(element, key);
      });
    });
  };

  const updateLanguageToggle = () => {
    document.querySelectorAll('[data-lang-option]').forEach((button) => {
      const lang = button.getAttribute('data-lang-option');
      const isActive = lang === currentLang;
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.classList.toggle('is-active', isActive);
      const ariaKey = `language.optionLabel.${lang}`;
      const fallback = ensureFallback(button, 'aria-label');
      button.setAttribute('aria-label', translate(ariaKey, { fallback }));
      const titleFallback = ensureFallback(button, 'title');
      if (titleFallback) {
        button.setAttribute('title', translate(ariaKey, { fallback: titleFallback }));
      }
    });
  };

  const updateDocumentLanguage = () => {
    document.documentElement.setAttribute('data-lang', currentLang);
    document.documentElement.setAttribute('lang', LANGUAGE_TO_HTML[currentLang] || LANGUAGE_TO_HTML[FALLBACK_LANG]);
  };

  const setLanguage = (lang, options = {}) => {
    const { persist = true, silent = false } = options;
    currentLang = Object.prototype.hasOwnProperty.call(translations, lang) ? lang : FALLBACK_LANG;

    if (persist) {
      safeStorage.set(STORAGE_KEY, currentLang);
    }

    updateDocumentLanguage();
    applyTranslations();
    updateLanguageToggle();

    if (!silent) {
      listeners.forEach((callback) => {
        try {
          callback(currentLang);
        } catch (error) {
          console.error('I18n listener error:', error);
        }
      });
    }
  };

  const getInitialLanguage = () => {
    const stored = safeStorage.get(STORAGE_KEY);
    if (stored && Object.prototype.hasOwnProperty.call(translations, stored)) {
      return stored;
    }
    const attrLang = document.documentElement.getAttribute('data-lang');
    if (attrLang && Object.prototype.hasOwnProperty.call(translations, attrLang)) {
      return attrLang;
    }
    return FALLBACK_LANG;
  };

  const handleToggleClick = (event) => {
    const button = event.target.closest('[data-lang-option]');
    if (!button) {
      return;
    }
    const targetLang = button.getAttribute('data-lang-option');
    if (!targetLang || targetLang === currentLang) {
      return;
    }
    setLanguage(targetLang);
  };

  const init = () => {
    currentLang = getInitialLanguage();
    setLanguage(currentLang, { persist: false, silent: true });

    const toggleGroup = document.querySelector('[data-lang-toggle]');
    if (toggleGroup) {
      toggleGroup.addEventListener('click', handleToggleClick);
    }
  };

  window.I18n = {
    t: (key, options) => translate(key, options),
    setLanguage,
    getLanguage: () => currentLang,
    onChange(callback) {
      if (typeof callback === 'function') {
        listeners.add(callback);
        return () => listeners.delete(callback);
      }
      return () => {};
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
