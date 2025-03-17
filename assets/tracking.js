document.addEventListener('DOMContentLoaded', () => {
    // Initialize all DOM elements
    const trackingForm = document.getElementById('trackingForm');
    const trackingStatus = document.getElementById('trackingStatus');
    const statusLine = document.getElementById('statusLine');
    const currentStatusDisplay = document.getElementById('currentStatusDisplay');
    const trackingNumberDisplay = document.getElementById('trackingNumberDisplay');
    const warehouseDisplay = document.getElementById('warehouse_display');
    const customerOrderNumberDisplay = document.getElementById('customerOrderNumberDisplay');
    const deliveryDateDisplay = document.getElementById('deliveryDateDisplay');
    const timelineStepsDetailed = document.getElementById('timelineStepsDetailed');
    const timelineLoader = document.getElementById('timelineLoader');
    const orderNumberInput = document.getElementById('orderNumber');
    const trackingFeedback = document.getElementById('trackingFeedback');

    // Status mapping to step numbers (used if needed for reference)
    const statusMap = {
        'RECEIVED': 1,       // Ordered
        'INPROCESS': 2,      // In Process (new state)
        'IN PROCESS': 2,
        'ALLOCATING': 2,     
        'ALLOCATED': 2,      
        'PICKING': 2,        
        'STAGING': 2,        
        'PROCESSING': 3,     // Ready to Ship
        'PACKED': 3,         
        'LOADED': 4,         // Picked Up
        'DISPATCHED': 4,     
        'INTRANSIT': 5,      // In Transit
        'OUTFORDELIVERY': 6, // Out for Delivery
        'DELIVERED': 7       // Delivered
    };

    /**
     * Returns a canonical status (uppercase) from the raw status or isInProcess flags
     * - This consolidates “ALLOCATING,” “PICKING,” etc. into “IN PROCESS,”
     *   or uses trackingDetails.deliveryStatus if provided.
     */
    function getCanonicalStatus(rawStatus, isInProcessFlag, trackingDetails) {
        if (isInProcessFlag) {
            return 'IN PROCESS';
        }
        if (rawStatus.match(/ALLOCAT|PICKING|IN PROCESS|STAGING/i)) {
            return 'IN PROCESS';
        }
        // If we have a trackingDetails.deliveryStatus, let it override
        if (trackingDetails && trackingDetails.deliveryStatus) {
            return trackingDetails.deliveryStatus.toUpperCase();
        }
        return rawStatus ? rawStatus.toUpperCase() : 'UNKNOWN';
    }

    /**
     * Converts a canonical status to a progress percentage for the status bar
     * (You can adjust these percentages as you see fit.)
     */
    function getProgressPercentage(status) {
        switch (status) {
            case 'RECEIVED':
                return 0;
            case 'IN PROCESS':
                return 25;
            case 'PROCESSING':
            case 'PACKED':
                return 50;
            case 'LOADED':
            case 'DISPATCHED':
                return 60;
            case 'INTRANSIT':
                return 70;
            case 'OUTFORDELIVERY':
                return 90;
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
    async function trackOrder(orderNumber) {
        try {
            // Create a 10-second timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out. The tracking server is taking too long to respond.')), 10000);
            });
            
            // Create the fetch promise
            const fetchPromise = fetch('https://trapo.com/tracking-orders/track.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderNumber }),
                credentials: 'include'
            });
            
            // Race the fetch against the timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (window.sessionStorage) {
                // Check for existing cached data to avoid repeated API calls
                const cachedData = sessionStorage.getItem(`order_${orderNumber}`);
                if (cachedData) {
                    console.log('Using cached data for', orderNumber);
                    return JSON.parse(cachedData);
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the successful response
            if (window.sessionStorage && data.success) {
                sessionStorage.setItem(`order_${orderNumber}`, JSON.stringify(data));
            }
            
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
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

        customerOrderNumberDisplay.textContent = order.documentNo || order.custOrderNo || 'N/A';

        // Set the delivery date (prioritize trackingDetails if available)
        let deliveryDate = order.deliveryDate || order.updatedDate || 'N/A';
        if (order.trackingDetails && order.trackingDetails.deliveryStatusDate) {
            deliveryDate = order.trackingDetails.deliveryStatusDate;
        }
        deliveryDateDisplay.textContent = formatDate(deliveryDate);

        // Resolve the final, canonical status
        const rawStatus = order.orderStatus || 'UNKNOWN';
        const canonicalStatus = getCanonicalStatus(
            rawStatus,
            order.isInProcess || data.hasInProcessState,
            order.trackingDetails
        );
        
        // Format it for display
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

        // 1) Update the status line’s width
        const progressPercentage = getProgressPercentage(upperStatus);
        statusLine.style.width = `${progressPercentage}%`;

        // 2) Determine which steps to hide or show
        const allSteps = document.querySelectorAll('.status-step');
        const inProcessStep = document.querySelector('.status-step[data-step="2"]'); 
        const pickupStep = document.querySelector('.status-step[data-step="4"]');
        const outForDeliveryStep = document.querySelector('.status-step[data-step="6"]');

        // If we are "IN PROCESS," show step 2, hide "Picked Up" & "Out for Delivery."
        if (upperStatus === 'IN PROCESS') {
            if (inProcessStep) inProcessStep.style.display = '';
            if (pickupStep) pickupStep.style.display = 'none';
            if (outForDeliveryStep) outForDeliveryStep.style.display = 'none';
        } else {
            // Otherwise, hide in-process step, show the others (with mobile adjustments).
            if (inProcessStep) inProcessStep.style.display = 'none';

            if (window.innerWidth > 768) {
                if (pickupStep) pickupStep.style.display = '';
                if (outForDeliveryStep) outForDeliveryStep.style.display = '';
            } else {
                // Respect data-mobile-hide attribute
                allSteps.forEach(step => {
                    if (step.getAttribute('data-mobile-hide') === 'true') {
                        step.style.display = 'none';
                    } else {
                        step.style.display = '';
                    }
                });
            }
        }

        // 3) Mark each step as completed, active, or pending
        allSteps.forEach(step => {
            step.classList.remove('active', 'completed', 'pending');
            step.classList.add('pending');
        });

        // We can still use statusMap if we want a numeric step. Otherwise, we rely on the progress bar alone.
        let currentStepNumber = statusMap[upperStatus] || 1;
        
        // Mark steps up to current as "completed," the current one as "active," etc.
        allSteps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            if (stepNumber < currentStepNumber) {
                step.classList.remove('pending', 'active');
                step.classList.add('completed');
            } else if (stepNumber === currentStepNumber) {
                step.classList.remove('pending', 'completed');
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
                step.classList.add('pending');
            }
        });
    }

    /**
     * Displays the detailed tracking timeline
     */
    function displayTrackingTimeline(trackingDetails) {
        timelineStepsDetailed.innerHTML = '';

        // Extract + normalize events
        let events = extractEvents(trackingDetails);

        // If there's a final “delivery status,” treat that like an event
        if (trackingDetails.deliveryStatus && trackingDetails.deliveryStatusDate) {
            events.push({
                date: trackingDetails.deliveryStatusDate,
                desc: `Order ${trackingDetails.deliveryStatus}`,
                loc: ''
            });
        }

        if (events.length === 0) {
            const noDataEntry = document.createElement('li');
            noDataEntry.className = 'timeline-step default';
            noDataEntry.textContent = 'No detailed tracking information available';
            timelineStepsDetailed.appendChild(noDataEntry);
            return;
        }

        // Sort by date ascending
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Build timeline entries (prepend so newest appear at the top if you want that order)
        events.forEach(evt => {
            const formattedTime = formatDate(evt.date);
            // Remove “, status id: XXXXX” from desc
            let desc = evt.desc.replace(/,\s*status id:\s*\d+/gi, '');
            const statusClass = getStatusClassFromDescription(desc);

            const timelineEntry = createTimelineEntry(
                desc,
                formattedTime,
                evt.loc,
                statusClass
            );
            
            // Prepend to show the most recent event at the top
            timelineStepsDetailed.prepend(timelineEntry);
        });
    }

    /**
     * Extracts + normalizes timeline events from various potential API structures
     */
    function extractEvents(trackingDetails) {
        let rawEvents = [];

        if (trackingDetails.TrackingEvent) {
            // Possibly an array or single event
            rawEvents = Array.isArray(trackingDetails.TrackingEvent)
                ? trackingDetails.TrackingEvent
                : [trackingDetails.TrackingEvent];
        } else if (trackingDetails.events && trackingDetails.events.event) {
            rawEvents = Array.isArray(trackingDetails.events.event)
                ? trackingDetails.events.event
                : [trackingDetails.events.event];
        } else if (trackingDetails.detailList && trackingDetails.detailList.WmsTrackingDetailView) {
            rawEvents = Array.isArray(trackingDetails.detailList.WmsTrackingDetailView)
                ? trackingDetails.detailList.WmsTrackingDetailView
                : [trackingDetails.detailList.WmsTrackingDetailView];
        } else if (Array.isArray(trackingDetails)) {
            // If trackingDetails is directly an array
            rawEvents = trackingDetails;
        }

        // Normalize
        return rawEvents.map(e => {
            return {
                date: e.eventTime || e.time || e.detailDate || '',
                desc: e.eventDesc || e.description || e.detailDesc || 'Status update',
                loc: e.eventLocation || e.location || ''
            };
        });
    }

    /**
     * Maps event descriptions to a status class for icons (timeline styling).
     */
    function getStatusClassFromDescription(description) {
        const desc = description.toLowerCase();

        if (desc.includes('delivered') || desc.includes('successfully')) {
            return 'delivered';
        } else if (desc.includes('out for delivery')) {
            return 'out-for-delivery';
        } else if (desc.includes('transit') || desc.includes('inbound')) {
            return 'in-transit';
        } else if (desc.includes('processed') || desc.includes('picked up')) {
            return 'processed';
        } else if (desc.includes('departed') || desc.includes('outbound')) {
            return 'departed';
        } else if (desc.includes('sorted')) {
            return 'sorted';
        } else {
            return 'default';
        }
    }

    /**
     * Creates a timeline entry element
     */
    function createTimelineEntry(title, datetime, description, statusClass = 'default') {
        // Main li element
        const entry = document.createElement('li');
        entry.className = `timeline-step ${statusClass}`;

        // Optional mapping to icons
        const iconMap = {
            'delivered': 'truck',
            'intransit': 'shipping-fast',
            'in-transit': 'shipping-fast',
            'processing': 'box-open',
            'processed': 'box-open',
            'received': 'shopping-cart',
            'departed': 'plane-departure',
            'out-for-delivery': 'truck-loading'
        };
        entry.setAttribute('data-icon', iconMap[statusClass] || 'circle');

        // Time element
        const timeElement = document.createElement('div');
        timeElement.className = 'timeline-time';
        timeElement.textContent = datetime;

        // Content container
        const contentElement = document.createElement('div');
        contentElement.className = 'timeline-content';

        // Title
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        contentElement.appendChild(titleElement);

        // Description
        if (description && description !== title && description.trim() !== '') {
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
            
            // Fallback standard parse
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;

            return formatDateObject(date);
        } catch (e) {
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
        // Replace underscores with spaces, etc.
        return status
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
});