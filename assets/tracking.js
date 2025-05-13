document.addEventListener('DOMContentLoaded', () => {
    // Initialize all DOM elements
    const trackingForm = document.getElementById('trackingForm');
    const trackingStatus = document.getElementById('trackingStatus');
    const statusLine = document.getElementById('statusLine');
    const currentStatusDisplay = document.getElementById('currentStatusDisplay');
    const trackingNumberDisplay = document.getElementById('trackingNumberDisplay');
    const warehouseDisplay = document.getElementById('warehouse_display');

    const timelineStepsDetailed = document.getElementById('timelineStepsDetailed');
    const timelineLoader = document.getElementById('timelineLoader');
    const orderNumberInput = document.getElementById('orderNumber');
    const trackingFeedback = document.getElementById('trackingFeedback');

    // Status mapping to 6 steps
    const statusMap = {
        // Step 1: Ordered (includes all processing states)
        'RECEIVED': 1,
        'ORDER PLACED': 1,
        'ORDER CONFIRMED': 1,
        'IN PROCESS': 1,
        'INPROCESS': 1,
        'ALLOCATING': 1,
        'ALLOCATED': 1,
        'PICKING': 1,
        'STAGING': 1,
        'PROCESSING': 1,
        'PACKED': 1,
        'READY': 1,
        
        // Step 2: Shipped Out
        'SHIPPED OUT': 2,
        'LOADED': 2,
        'PICKED UP': 2,
        
        // Step 3: Out for Delivery (includes all transit states)
        'OUT FOR DELIVERY': 3,
        'OUTFORDELIVERY': 3,
        'OUT_FOR_DELIVERY': 3,
        'IN TRANSIT': 3,
        'INTRANSIT': 3,
        'DISPATCHED': 3,
        'DEPARTED': 3,
        
        // Step 4: Delivered
        'DELIVERED': 4,
        'COMPLETED': 4
    };

    /**
     * Returns a canonical status (uppercase) from the raw status or isInProcess flags
     * - This consolidates “ALLOCATING,” “PICKING,” etc. into “IN PROCESS,”
     *   or uses trackingDetails.deliveryStatus if provided.
     */
    function getCanonicalStatus(rawStatus, isInProcessFlag, trackingDetails) {
        // First prioritize the deliveryStatus from tracking details if available
        if (trackingDetails?.deliveryStatus) {
            const deliveryStatus = trackingDetails.deliveryStatus.toUpperCase();
            // Check if this status is directly in our map
            if (Object.keys(statusMap).includes(deliveryStatus)) {
                return deliveryStatus;
            }
            // If not directly in map, try to match patterns
            if (deliveryStatus.match(/DELIVERED|COMPLETED/i)) return 'DELIVERED';
            if (deliveryStatus.match(/OUTFORDELIVERY|OUT[_ ]?FOR[_ ]?DELIVERY|INTRANSIT|IN[_ ]?TRANSIT|DISPATCHED|DEPARTED/i)) return 'OUT FOR DELIVERY';
            if (deliveryStatus.match(/LOADED|PICKED[_ ]?UP|SHIPPED/i)) return 'SHIPPED OUT';
            if (deliveryStatus.match(/PROCESSING|PACKED|READY|INPROCESS|IN[_ ]?PROCESS|ALLOCAT|PICKING|STAGING|RECEIVED|ORDER[_ ]?PLACED|ORDER[_ ]?CONFIRMED/i)) return 'ORDERED';
        }
        
        // If no tracking details or couldn't match deliveryStatus, check raw status
        const status = (rawStatus || '').toUpperCase();
        if (status.match(/DELIVERED|COMPLETED/i)) return 'DELIVERED';
        if (status.match(/OUTFORDELIVERY|OUT[_ ]?FOR[_ ]?DELIVERY|INTRANSIT|IN[_ ]?TRANSIT|DISPATCHED|DEPARTED/i)) return 'OUT FOR DELIVERY';
        if (status.match(/LOADED|PICKED[_ ]?UP|SHIPPED/i)) return 'SHIPPED OUT';
        if (status.match(/PROCESSING|PACKED|READY|INPROCESS|IN[_ ]?PROCESS|ALLOCAT|PICKING|STAGING|RECEIVED|ORDER[_ ]?PLACED|ORDER[_ ]?CONFIRMED/i)) return 'ORDERED';
        
        // If no match found and we're in process, or if no status matches
        return 'ORDERED';
    }

    /**
     * Converts a canonical status to a progress percentage for the status bar
     * (You can adjust these percentages as you see fit.)
     */
    function getProgressPercentage(status) {
        switch (status) {
            case 'ORDERED':
                return 0;
            case 'SHIPPED OUT':
                return 33;
            case 'OUT FOR DELIVERY':
                return 67;
            case 'DELIVERED':
                return 100;
            default:
                return 0;
        }
    }

    /**
     * Checks URL parameters and automatically triggers tracking if ?tracking=xxxx is present.
     */
    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const trackingParam = urlParams.get('tracking');
        
        if (trackingParam) {
            orderNumberInput.value = trackingParam;
            trackOrderByNumber(trackingParam);
        }
    }

    /**
     * Main function to track an order by its number
     */
    async function trackOrderByNumber(orderNumber) {
        if (!orderNumber) {
            alert('Please enter a tracking number or Shopify order name');
            return;
        }
        
        const trackButton = document.querySelector('.track-button');
        
        // Show loading states
        trackButton.classList.add('loading');
        trackingFeedback.style.display = 'block';
        trackingFeedback.textContent = 'Connecting to tracking server...';
        timelineLoader.style.display = 'none';
        trackingStatus.style.display = 'none';
        
        try {
            setTimeout(() => {
                if (trackingFeedback.style.display === 'block') {
                    trackingFeedback.textContent = 'Searching for your order...';
                }
            }, 500);
            
            const orderData = await trackOrder(orderNumber);
            
            trackingFeedback.textContent = 'Order found! Loading details...';
            
            // Small delay to show success text, then display results
            setTimeout(() => {
                displayOrderData(orderData);
                trackingFeedback.style.display = 'none';
            }, 300);
        } catch (error) {
            trackingFeedback.style.display = 'none';
            alert('Error: ' + error.message);
        } finally {
            trackButton.classList.remove('loading');
            timelineLoader.style.display = 'none';
        }
    }

    /**
     * The event listener for form submission
     */
    trackingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderNumber = orderNumberInput.value.trim();
        trackOrderByNumber(orderNumber);
    });

    // Check for URL parameters on page load
    checkUrlParameters();

    /**
     * Tracks an order by calling the PHP backend
     * and returns the order data (or throws if there's an error).
     */
    /**
     * Logs messages to the debug.log file via a fetch request
     * @param {string} message - The message to log
     * @param {string} level - The log level (info, error, warn)
     */
    async function logToDebugFile(message, level = 'info') {
        try {
            // Don't block the main flow with await
            fetch('https://www.trapo.com/tracking-orders/track.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Don't include credentials for logging requests
                credentials: 'omit',
                body: JSON.stringify({ 
                    message: message,
                    level: level,
                    source: 'tracking.js'
                })
            }).catch(() => {
                // Silently fail if logging fails
            });
        } catch (e) {
            // Silently fail if logging fails
        }
    }

    async function trackOrder(orderNumber) {
        try {
            // Create a 10-second timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out. The tracking server is taking too long to respond.')), 10000);
            });
            
            // Create the fetch promise with cache-busting parameter in URL only
            const nocache = Date.now() + Math.floor(Math.random() * 10000);
            const fetchPromise = fetch(`https://www.trapo.com/tracking-orders/track.php?nocache=${nocache}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderNumber }),
                // Change to 'same-origin' which is more compatible
                credentials: 'omit'
            });
            
            // Race the fetch against the timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            // Caching removed to ensure fresh data is always fetched

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Caching removed to ensure fresh data is always fetched
            
            return data;
        } catch (error) {
            logToDebugFile(`Fetch error: ${error.message}`, 'error');
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                throw new Error('Cannot connect to tracking server. Please check your internet connection and try again.');
            }
            throw error;
        }
    }

    /**
     * Displays the order data in the UI
     */
    function displayOrderData(data) {
        if (!data.success || !data.orderInfo || data.orderInfo.length === 0) {
            alert('No order information found');
            return;
        }
        
        // Show the first order returned
        const order = data.orderInfo[0];
        
        trackingNumberDisplay.textContent = order.trackingCode || 'Not assigned yet';

        // Determine the warehouse value
        let warehouseValue = 'Not Assigned';
        if (order.cleanCourierService && order.cleanCourierService.trim() !== '') {
            warehouseValue = order.cleanCourierService;
        } else if (order.courierServiceNo && order.courierServiceNo.trim() !== '') {
            warehouseValue = order.courierServiceNo.replace(/\[.*?\]\s*/, '').trim();
        } else if (order.warehouseName && order.warehouseName.trim() !== 'N/A') {
            warehouseValue = order.warehouseName;
        } else if (order.warehouse && order.warehouse.trim() !== '') {
            warehouseValue = order.warehouse;
        }
        if (warehouseDisplay) {
            warehouseDisplay.textContent = warehouseValue;
        }

        // Get events from tracking details if available
        let canonicalStatus = '';
        if (order.trackingDetails) {
            const events = extractEvents(order.trackingDetails);
            if (events.length > 0) {
                // Sort events by date descending
                events.sort((a, b) => {
                    // Parse DD/MM/YYYY HH:MM:SS format
                    function parseLocalDate(dateStr) {
                        if (!dateStr) return new Date(0);
                        
                        // Extract parts from DD/MM/YYYY HH:MM:SS
                        const parts = dateStr.split(' ');
                        if (parts.length !== 2) return new Date(0);
                        
                        const dateParts = parts[0].split('/');
                        const timeParts = parts[1].split(':');
                        
                        if (dateParts.length !== 3 || timeParts.length !== 3) return new Date(0);
                        
                        // Note: months are 0-indexed in JavaScript Date
                        return new Date(
                            parseInt(dateParts[2]), // year
                            parseInt(dateParts[1]) - 1, // month (0-indexed)
                            parseInt(dateParts[0]), // day
                            parseInt(timeParts[0]), // hour
                            parseInt(timeParts[1]), // minute
                            parseInt(timeParts[2])  // second
                        );
                    }
                    
                    const dateA = parseLocalDate(a.date);
                    const dateB = parseLocalDate(b.date);
                    
                    // Removed excessive date comparison logging
                    
                    return dateB - dateA; // Newest first
                });
                
                const latestEvent = events[0];
                // Map the latest event description to a status
                const desc = latestEvent.desc.toLowerCase();
                
                // Determine status directly from timeline events
                if (desc.includes('delivered') && !desc.includes('unsuccessful')) {
                    canonicalStatus = 'DELIVERED';
                } else if (desc.includes('unsuccessful') || desc.includes('failed')) {
                    // For unsuccessful delivery attempts, use OUT FOR DELIVERY status
                    // since the package is still with the courier and will be redelivered
                    canonicalStatus = 'OUT FOR DELIVERY';
                    logToDebugFile('Detected unsuccessful delivery, setting status to OUT FOR DELIVERY');
                } else if (desc.includes('out for delivery') || desc.includes('inbound')) {
                    canonicalStatus = 'OUT FOR DELIVERY';
                } else if (desc.includes('picked up') || desc.includes('outbound')) {
                    canonicalStatus = 'SHIPPED OUT';
                } else {
                    // If we can't determine from timeline, use getCanonicalStatus
                    canonicalStatus = getCanonicalStatus(order.orderStatus, order.isInProcess, null);
                }
                
                // Only log status changes when relevant
                if (canonicalStatus !== order.orderStatus) {
                    logToDebugFile(`Status determined from timeline: ${canonicalStatus} (original: ${order.orderStatus})`);
                }
            } else {
                // No events, use getCanonicalStatus
                canonicalStatus = getCanonicalStatus(order.orderStatus, order.isInProcess, null);
            }
        } else {
            // No tracking details, use getCanonicalStatus
            canonicalStatus = getCanonicalStatus(order.orderStatus, order.isInProcess, null);
        }

        // Update status text
        const formattedStatus = formatStatus(canonicalStatus);
        document.getElementById('statusText').textContent = formattedStatus.toUpperCase();

        // Update the progress bar + steps based on final status
        updateStatusSteps(canonicalStatus);

        // Update timeline details if available
        if (order.trackingDetails) {
            displayTrackingTimeline(order.trackingDetails);
        } else {
            // If no detailed tracking, just show the order status as a single step
            const currentDate = new Date();
            const formattedCurrentDate = formatDate(currentDate.toISOString());
            const statusEntry = createTimelineEntry(
                formattedStatus,
                formattedCurrentDate,
                `Order status: ${formattedStatus}`
            );
            timelineStepsDetailed.innerHTML = '';
            timelineStepsDetailed.appendChild(statusEntry);
        }

        // Show the tracking status section
        trackingStatus.style.display = 'block';
    }

    /**
     * Updates the status steps in the UI
     */
    function updateStatusSteps(currentStatus) {
        // Convert to uppercase for consistency
        const upperStatus = currentStatus.toUpperCase();

        // Map old statuses to new ones for progress calculation
        let mappedStatus = upperStatus;
        if (upperStatus === 'IN TRANSIT' || upperStatus === 'INTRANSIT') {
            mappedStatus = 'OUT FOR DELIVERY';
        } else if (upperStatus === 'IN PROCESS' || upperStatus === 'PROCESSING' || upperStatus === 'RECEIVED') {
            mappedStatus = 'ORDERED';
        }

        // Get the current step number from our status map
        const currentStep = statusMap[mappedStatus] || 1;

        // 1) Update the status line's width
        const progressPercentage = getProgressPercentage(mappedStatus);
        statusLine.style.width = `${progressPercentage}%`;

        // 2) Update all steps
        const allSteps = document.querySelectorAll('.status-step');
        allSteps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            step.style.display = ''; // Show all steps by default
            
            // Remove all classes first
            step.classList.remove('active', 'completed', 'pending');
            
            // Add appropriate classes based on current status
            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.add('pending');
            }
            
            // Handle mobile view
            if (window.innerWidth <= 768 && step.getAttribute('data-mobile-hide') === 'true') {
                step.style.display = 'none';
            }
        });
        

    }

    /**
     * Displays the detailed tracking timeline
     */
    function displayTrackingTimeline(trackingDetails) {
        // Only log a summary of tracking details instead of the full structure
        if (trackingDetails && trackingDetails.trackingCode) {
            logToDebugFile(`Processing tracking details for: ${trackingDetails.trackingCode}, status: ${trackingDetails.deliveryStatus || 'N/A'}`);
        }
        timelineStepsDetailed.innerHTML = '';
    
        // Get events directly from the API response
        let events = extractEvents(trackingDetails);
    
        if (events.length === 0) {
            const noDataEntry = document.createElement('li');
            noDataEntry.className = 'timeline-step default';
            noDataEntry.textContent = 'No detailed tracking information available';
            timelineStepsDetailed.appendChild(noDataEntry);
            return;
        }
    
        // Sort by date ascending with improved handling for invalid dates
        events.sort((a, b) => {
            // Handle invalid dates by putting them at the beginning
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
            if (isNaN(dateA.getTime())) return -1;
            if (isNaN(dateB.getTime())) return 1;
            
            return dateA - dateB;
        });
    
        // Build timeline entries (prepend so newest appear at the top)
        events.forEach(evt => {
            // Skip events with empty dates or descriptions
            if (!evt.date || !evt.desc) return;
            const formattedTime = formatDate(evt.date);
            const statusClass = getStatusClassFromDescription(evt.desc);
    
            const timelineEntry = createTimelineEntry(
                evt.desc,
                formattedTime,
                evt.loc,
                statusClass
            );
            
            // Prepend to show the most recent event at the top
            timelineStepsDetailed.prepend(timelineEntry);
        });
    }

    /**
     * Extracts timeline events from the S3 API response
     * Uses raw data from https://s3.ap-southeast-1.amazonaws.com/tracking.istoreisend-wms.com/
     */
    function extractEvents(trackingDetails) {
        let rawEvents = [];
    
        // Only handle the WMS tracking detail view structure
        if (trackingDetails.detailList && trackingDetails.detailList.WmsTrackingDetailView) {
            rawEvents = Array.isArray(trackingDetails.detailList.WmsTrackingDetailView)
                ? trackingDetails.detailList.WmsTrackingDetailView
                : [trackingDetails.detailList.WmsTrackingDetailView];
        }
    
        // Map the fields and ensure proper date format
        return rawEvents.map(e => ({
            date: e.detailDate || '',
            desc: e.detailDesc || '',
            loc: e.detailLocation || '',
            // Add a parsed date for easier comparison
            parsedDate: e.detailDate ? new Date(
                e.detailDate.split('/')[2].split(' ')[0], // year
                parseInt(e.detailDate.split('/')[1]) - 1, // month (0-indexed)
                e.detailDate.split('/')[0], // day
                ...e.detailDate.split(' ')[1].split(':') // hour, minute, second
            ) : null
        }));
    }

    /**
     * Maps event descriptions to a status class for icons (timeline styling).
     */
    function getStatusClassFromDescription(description) {
        const desc = description.toLowerCase();
        
        // Map to our 6 main statuses
        if (desc.includes('delivered')) {
            return 'delivered';
        } else if (desc.includes('out for delivery')) {
            return 'out-for-delivery';
        } else if (desc.includes('transit') || desc.includes('loaded') || desc.includes('dispatched')) {
            return 'in-transit';
        } else if (desc.includes('processing') || desc.includes('packed') || desc.includes('ready')) {
            return 'processing';
        } else if (desc.includes('in process') || desc.includes('allocat') || desc.includes('picking') || desc.includes('staging')) {
            return 'in-process';
        } else if (desc.includes('received') || desc.includes('order placed')) {
            return 'received';
        }
        return 'default';
    }

    /**
     * Creates a timeline entry element
     */
    function createTimelineEntry(title, datetime, description, statusClass = 'default') {
        // Main li element
        const entry = document.createElement('li');
        entry.className = `timeline-step ${statusClass}`;

        // Icon mapping for each status type
        const iconMap = {
            'delivered': 'check-circle',     // Checkmark for completed delivery
            'completed': 'check-circle',
            'out-for-delivery': 'truck',     // Delivery truck
            'intransit': 'shipping-fast',    // Fast shipping truck
            'in-transit': 'shipping-fast',
            'departed': 'plane-departure',   // Plane departure
            'processing': 'box-open',        // Open box for processing
            'packed': 'box',                // Closed box for packed
            'in-process': 'cogs',           // Cogs for in process
            'received': 'clipboard-check',   // Clipboard for order received
            'order-placed': 'shopping-cart', // Shopping cart for order placed
            'default': 'circle'             // Default circle icon
        };
        entry.setAttribute('data-icon', iconMap[statusClass] || 'circle');

        // Time element
        const timeElement = document.createElement('div');
        timeElement.className = 'timeline-time';
        timeElement.textContent = datetime;

        // Content container
        const contentElement = document.createElement('div');
        contentElement.className = 'timeline-content';

        // Title - preserve the original title text without modifications
        const titleElement = document.createElement('h4');
        // Remove any trailing status IDs but keep the rest of the text intact
        titleElement.textContent = title.replace(/,\s*status id:\s*\d+(?=,|$)/gi, '');
        contentElement.appendChild(titleElement);

        // Description - only show if it adds additional information
        if (description && 
            description !== title && 
            description.trim() !== '' && 
            !title.toLowerCase().includes(description.toLowerCase())) {
            const descElement = document.createElement('p');
            descElement.textContent = description;
            contentElement.appendChild(descElement);
        }

        // Assemble
        entry.appendChild(timeElement);
        entry.appendChild(contentElement);

        return entry;
    }

    /**
     * Formats a date string for display as: 'Mar 13, 2025, 09:14 PM'
     */
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        try {
            // If it's already in target format, do nothing
            const targetFormatRegex = /^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2} [AP]M$/i;
            if (targetFormatRegex.test(dateStr)) {
                return dateStr;
            }
            
            // Handle Unix timestamps (seconds or milliseconds)
            if (/^\d{10,13}$/.test(dateStr)) {
                const timestamp = dateStr.length === 10 ? parseInt(dateStr) * 1000 : parseInt(dateStr);
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    return formatDateObject(date);
                }
            }
            
            // Handle ISO 8601 dates with timezone offset (common in APIs)
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
            if (isoDateRegex.test(dateStr)) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return formatDateObject(date);
                }
            }
            
            // Attempt European date format like DD/MM/YYYY HH:MM(:SS)
            const europeanDateRegex = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4}) (\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
            const match = dateStr.match(europeanDateRegex);
            if (match) {
                const [_, day, month, year, hour, minute, second] = match;
                const date = new Date(
                    parseInt(year), 
                    parseInt(month) - 1, 
                    parseInt(day), 
                    parseInt(hour), 
                    parseInt(minute), 
                    parseInt(second || 0)
                );
                if (!isNaN(date.getTime())) {
                    return formatDateObject(date);
                }
            }
            
            // Handle American date format MM/DD/YYYY HH:MM(:SS)
            const americanDateRegex = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
            const americanMatch = dateStr.match(americanDateRegex);
            if (americanMatch) {
                const [_, month, day, year, hour, minute, second] = americanMatch;
                const date = new Date(
                    parseInt(year), 
                    parseInt(month) - 1, 
                    parseInt(day), 
                    parseInt(hour || 0), 
                    parseInt(minute || 0), 
                    parseInt(second || 0)
                );
                if (!isNaN(date.getTime())) {
                    return formatDateObject(date);
                }
            }
            
            // Fallback standard parse
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                logToDebugFile(`Unable to parse date: ${dateStr}`);
                return dateStr; // Return original if we can't parse it
            }

            return formatDateObject(date);
        } catch (e) {
            logToDebugFile(`Error parsing date: ${e.message}, date string: ${dateStr}`, 'error');
            return dateStr;
        }
    }

    /**
     * Helper to format a Date object to 'Mar 13, 2025, 09:14 PM'
     */
    function formatDateObject(date) {
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        
        return `${month} ${day}, ${year}, ${time}`;
    }

    /**
     * Converts a raw status string to a nicer “title case” format
     */
    function formatStatus(status) {
        if (!status) return 'Unknown';

        // Map old statuses to new ones
        const statusMapping = {
            'IN TRANSIT': 'Out for Delivery',
            'INTRANSIT': 'Out for Delivery',
            'RECEIVED': 'Ordered',
            'IN PROCESS': 'Ordered',
            'PROCESSING': 'Ordered'
        };

        // Check if we need to map this status
        const mappedStatus = statusMapping[status.toUpperCase()] || status;

        // Replace underscores with spaces and convert to title case
        return mappedStatus
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
});