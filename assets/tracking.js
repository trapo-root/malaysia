// Client-side logging utility
const logger = {
    // Log levels
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    },
    
    // Current log level (only logs at this level or higher will be sent to server)
    currentLevel: 1, // Default to info
    
    // Whether to also log to console (for development)
    consoleOutput: false,
    
    // Send log to server
    async sendToServer(type, message, data = null) {
        try {
            // Only send logs at or above the current level
            if (this.levels[type] < this.currentLevel) return;
            
            // Send log to server
            await fetch('https://trapo.com/tracking-orders/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    message,
                    data
                })
            });
            
            // Also log to console if enabled
            if (this.consoleOutput) {
                if (type === 'error') {
                    console.error(message, data || '');
                } else if (type === 'warn') {
                    console.warn(message, data || '');
                } else {
                    console.log(`[${type.toUpperCase()}] ${message}`, data || '');
                }
            }
        } catch (e) {
            // If sending to server fails, log to console as fallback
            console.error('Failed to send log to server:', e);
            console.error(`[${type.toUpperCase()}] ${message}`, data || '');
        }
    },
    
    // Convenience methods for different log levels
    debug(message, data = null) {
        this.sendToServer('debug', message, data);
    },
    
    info(message, data = null) {
        this.sendToServer('info', message, data);
    },
    
    warn(message, data = null) {
        this.sendToServer('warn', message, data);
    },
    
    error(message, data = null) {
        this.sendToServer('error', message, data);
    }
};

// Function to store the session cookie with expiration time (24 hours)
function storeSessionCookie(sessionCookie) {
    if (!sessionCookie) return false;
    
    try {
        // Calculate expiration time (24 hours from now)
        const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        // Store both the cookie and its expiration time
        const cookieData = {
            cookie: sessionCookie,
            expires: expirationTime
        };
        
        localStorage.setItem('wmsSessionData', JSON.stringify(cookieData));
        logger.info('Session cookie stored with expiration', { expiration: new Date(expirationTime).toLocaleString() });
        return true;
    } catch (error) {
        logger.error('Error storing session cookie', { error: error.message });
        return false;
    }
}

// Function to retrieve a valid session cookie if one exists
function getStoredSessionCookie() {
    try {
        const cookieDataStr = localStorage.getItem('wmsSessionData');
        if (!cookieDataStr) return null;
        
        const cookieData = JSON.parse(cookieDataStr);
        const currentTime = new Date().getTime();
        
        // Check if the cookie has expired
        if (cookieData.expires && cookieData.expires > currentTime) {
            const hoursRemaining = Math.round((cookieData.expires - currentTime) / (60 * 60 * 1000));
            logger.info('Using stored session cookie', { expiresIn: `${hoursRemaining} hours` });
            return cookieData.cookie;
        } else {
            // Cookie expired, remove it
            logger.info('Stored session cookie expired, removing');
            localStorage.removeItem('wmsSessionData');
            return null;
        }
    } catch (error) {
        logger.error('Error retrieving session cookie', { error: error.message });
        localStorage.removeItem('wmsSessionData');
        return null;
    }
}

// Function to login to iStoreISend WMS API via proxy server
async function loginToWMS() {
    try {
        // First check if we have a valid stored session cookie
        const storedCookie = getStoredSessionCookie();
        if (storedCookie) {
            logger.info('Using existing session cookie');
            return storedCookie;
        }
        
        logger.info('No valid session cookie found, logging in...');
        const response = await fetch('https://trapo.com/tracking-orders/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }
        
        const data = await response.json();
        logger.info('Login response received', { success: data.success });
        
        if (!data.success) {
            throw new Error(data.message || 'Login failed');
        }
        
        if (!data.sessionCookie) {
            throw new Error('No session cookie returned from server');
        }
        
        // Store the new session cookie
        storeSessionCookie(data.sessionCookie);
        
        return data.sessionCookie;
    } catch (error) {
        logger.error('Login error', { message: error.message });
        throw error;
    }
}

// Function to query order by Shopify order name via proxy server
async function queryOrderByShopifyName(orderName, sessionCookie) {
    try {
        logger.info('Querying order by Shopify name', { orderName });
        logger.debug('Session cookie details', { 
            type: typeof sessionCookie,
            isArray: Array.isArray(sessionCookie),
            length: Array.isArray(sessionCookie) ? sessionCookie.length : 'N/A'
        });
        
        const response = await fetch('https://trapo.com/tracking-orders/api/query-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderName,
                sessionCookie
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Query order error response', { status: response.status, response: errorText });
            throw new Error(`Order query failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        logger.info('Query order response received', { success: data.success });
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to query order');
        }
        
        if (!data.trackingCode) {
            throw new Error('No tracking code returned from server');
        }
        
        return data.trackingCode;
    } catch (error) {
        logger.error('Order query error', { message: error.message });
        throw error;
    }
}

// Helper function to format Shopify order names if needed
function formatShopifyOrderName(orderName) {
    if (orderName && !orderName.toUpperCase().startsWith('TMR-O') && orderName.toUpperCase().startsWith('TMR-')) {
        // If it starts with TMR- but not TMR-O, add the O
        return orderName.replace(/^TMR-/i, 'TMR-O');
    }
    return orderName;
}

// Function to determine if input is a tracking number or Shopify order name
function isTrackingNumber(input) {
    // Tracking numbers are typically alphanumeric and may contain hyphens
    // Shopify order names often start with specific prefixes like TMR-O
    const isShopifyOrder = input.toUpperCase().startsWith('TMR-O') || input.toUpperCase().startsWith('TMR-');
    logger.debug('Checking input type', { input, isShopifyOrder });
    return !isShopifyOrder;
}

// Function to track an order
async function trackOrder(input) {
    if (!input || input.trim() === '') {
        alert('Please enter a tracking number or Shopify order name.');
        return;
    }
    
    const trackingStatusSection = document.getElementById('trackingStatus');
    if (!trackingStatusSection) {
        logger.error('DOM element not found', { element: 'trackingStatus' });
        return;
    }
    const currentStatusDisplay = document.getElementById('currentStatusDisplay');
    const trackingNumberDisplay = document.getElementById('trackingNumberDisplay');
    const warehouseDisplay = document.getElementById('warehouseDisplay');
    const customerOrderNumberDisplay = document.getElementById('customerOrderNumberDisplay');
    const deliveryDateDisplay = document.getElementById('deliveryDateDisplay');
    const statusSteps = document.querySelectorAll('.status-step');
    const statusLine = document.getElementById('statusLine');
    const timelineStepsDetailed = document.getElementById('timelineStepsDetailed');
    const timelineLoader = document.getElementById('timelineLoader');
    const shareContainer = document.getElementById('shareContainer');
    
    // Show loading state
    trackingStatusSection.style.display = 'block';
    currentStatusDisplay.textContent = 'Loading...';
    timelineLoader.style.display = 'flex';
    timelineStepsDetailed.innerHTML = '';
    
    // Reset step statuses and line
    statusSteps.forEach(step => {
        step.classList.remove('active', 'completed', 'pending');
    });
    statusLine.style.width = '0%';
    
    let orderNumber = input.trim();
    
    try {
        // If input looks like a Shopify order name, try to get the tracking number
        if (!isTrackingNumber(orderNumber)) {
            logger.info('Processing as Shopify order name', { orderName: orderNumber });
            
            // Format Shopify order name if needed
            orderNumber = formatShopifyOrderName(orderNumber);
            logger.info('Using formatted order name', { orderName: orderNumber });
            
            // Login to WMS API via proxy server
            logger.info('Attempting to login to WMS API');
            const sessionCookie = await loginToWMS();
            logger.info('Login successful, session cookie received');
            
            // Query order by Shopify order name via proxy server
            logger.info('Querying order with name', { orderName: orderNumber });
            orderNumber = await queryOrderByShopifyName(orderNumber, sessionCookie);
            logger.info('Received tracking number', { trackingNumber: orderNumber });
        }
        
        // Update URL with the original user input without reloading page
        const url = new URL(window.location);
        url.searchParams.set('tracking', input.trim());
        window.history.pushState({}, '', url);
        
        // Fetch tracking data from S3
        const trackingUrl = `https://s3.ap-southeast-1.amazonaws.com/tracking.istoreisend-wms.com/${orderNumber}.xml`;
        const response = await fetch(trackingUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const xmlString = await response.text();
        timelineLoader.style.display = 'none';
        
        if (!xmlString || xmlString.trim() === '') {
            throw new Error('Empty response received');
        }
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        if (xmlDoc.querySelector('parsererror')) {
            throw new Error('Invalid XML format');
        }

        const wmsTrackingView = xmlDoc.querySelector('WmsTrackingView');
        if (!wmsTrackingView) {
            throw new Error('Tracking information not found in XML');
        }
        
        // Extract tracking information
        const trackingCode = wmsTrackingView.querySelector('trackingCode')?.textContent || 'Not available';
        const warehouse = wmsTrackingView.querySelector('warehouse')?.textContent || 'Not available';
        const customerOrderNo = wmsTrackingView.querySelector('customerOrderNo')?.textContent || 'Not available';
        
        // Update tracking information display
        trackingNumberDisplay.textContent = trackingCode;
        warehouseDisplay.textContent = warehouse;
        customerOrderNumberDisplay.textContent = customerOrderNo;
        
        // Show share container if available
        if (shareContainer) {
            shareContainer.style.display = 'flex';
        }
        
        // Process tracking status and timeline
        const trackingDetails = wmsTrackingView.querySelectorAll('trackingDetails > trackingDetail');
        if (!trackingDetails || trackingDetails.length === 0) {
            throw new Error('No tracking details found');
        }
        
        // Find the latest status
        let latestStatus = '';
        let latestDate = null;
        let latestTimestamp = 0;
        let deliveryDate = null;
        
        // Process each tracking detail to find the latest status and delivery date
        trackingDetails.forEach(detail => {
            const detailDateRaw = detail.querySelector('detailDate')?.textContent;
            const detailDesc = detail.querySelector('detailDesc')?.textContent || '';
            
            if (detailDateRaw) {
                try {
                    // Try to parse the date
                    let detailDate;
                    
                    // First try to match the DD/MM/YYYY HH:MM:SS format
                    const dateMatch = detailDateRaw.match(/(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})/);
                    if (dateMatch) {
                        const [, day, month, year, hours, minutes, seconds] = dateMatch;
                        detailDate = new Date(year, month-1, day, hours, minutes, seconds);
                    } else {
                        detailDate = new Date(detailDateRaw);
                    }
                    
                    if (!isNaN(detailDate.getTime())) {
                        const timestamp = detailDate.getTime();
                        
                        // Check if this is the latest status
                        if (timestamp > latestTimestamp) {
                            latestTimestamp = timestamp;
                            latestDate = detailDate;
                            latestStatus = detailDesc;
                        }
                        
                        // Check if this is a delivery status
                        if (detailDesc.toLowerCase().includes('delivered')) {
                            deliveryDate = detailDate;
                        }
                    }
                } catch (e) {
                    logger.error('Error parsing detail date', { error: e.message, date: detailDateRaw });
                }
            }
        });
        
        // If no delivery date was found, use the latest date
        if (!deliveryDate && latestDate) {
            deliveryDate = latestDate;
        }
        
        // Format and display the delivery date
        if (deliveryDate) {
            try {
                const day = deliveryDate.getDate();
                const month = deliveryDate.toLocaleString('en-US', { month: 'long' });
                const year = deliveryDate.getFullYear();
                const hours = deliveryDate.getHours().toString().padStart(2, '0');
                const minutes = deliveryDate.getMinutes().toString().padStart(2, '0');
                
                const formattedDeliveryDate = `${day} ${month} ${year} at ${hours}:${minutes}`;
                deliveryDateDisplay.textContent = formattedDeliveryDate;
            } catch (e) {
                logger.error('Error formatting delivery date', { error: e.message });
                deliveryDateDisplay.textContent = 'Date not available';
            }
        } else {
            deliveryDateDisplay.textContent = 'Not yet delivered';
        }
        
        // Update current status
        if (latestStatus) {
            currentStatusDisplay.textContent = latestStatus;
            
            // Set status color based on content
            if (latestStatus.toLowerCase().includes('delivered')) {
                currentStatusDisplay.style.color = '#28a745'; // Green for delivered
            } else if (latestStatus.toLowerCase().includes('transit') || 
                       latestStatus.toLowerCase().includes('shipping')) {
                currentStatusDisplay.style.color = '#007bff'; // Blue for in transit
            } else if (latestStatus.toLowerCase().includes('processing') || 
                       latestStatus.toLowerCase().includes('prepared')) {
                currentStatusDisplay.style.color = '#ffc107'; // Yellow/amber for processing
            } else {
                currentStatusDisplay.style.color = '#6c757d'; // Gray for other statuses
            }
        } else {
            currentStatusDisplay.textContent = 'Status not available';
            currentStatusDisplay.style.color = '#6c757d';
        }
        
        // Update status steps
        updateStatusSteps(trackingDetails);
        
        // Populate detailed timeline
        populateDetailedTimeline(trackingDetails);
        
    } catch (error) {
        timelineLoader.style.display = 'none';
        logger.error('Error tracking order', { message: error.message });
        currentStatusDisplay.textContent = 'Error: Could not retrieve tracking information';
        currentStatusDisplay.style.color = '#e12c7b';
        timelineStepsDetailed.innerHTML = `
            <li><i class="fas fa-exclamation-circle timeline-detail-icon"></i> 
            <strong>Error</strong>: ${error.message || 'Please check your input and try again.'}</li>
        `;
        if (shareContainer) {
            shareContainer.style.display = 'none';
        }
    }
}

// Function to update the status steps based on tracking details
function updateStatusSteps(trackingDetails) {
    const statusSteps = document.querySelectorAll('.status-step');
    const statusLine = document.getElementById('statusLine');
    
    if (!statusSteps || statusSteps.length === 0) return;
    
    // Define the status mapping
    const statusMapping = {
        'order': 1, // Order received
        'processing': 2, // Processing
        'shipping': 3, // Shipping
        'transit': 3, // In transit (same as shipping)
        'delivery': 4, // Out for delivery
        'delivered': 5  // Delivered
    };
    
    // Find the current step based on tracking details
    let currentStep = 0;
    
    Array.from(trackingDetails).forEach(detail => {
        const detailDesc = detail.querySelector('detailDesc')?.textContent?.toLowerCase() || '';
        
        // Check each status keyword
        Object.keys(statusMapping).forEach(keyword => {
            if (detailDesc.includes(keyword)) {
                const stepNumber = statusMapping[keyword];
                if (stepNumber > currentStep) {
                    currentStep = stepNumber;
                }
            }
        });
    });
    
    // If no step was determined, default to step 1
    if (currentStep === 0) currentStep = 1;
    
    // Update the status steps
    statusSteps.forEach(step => {
        const stepNumber = parseInt(step.getAttribute('data-step'));
        
        if (stepNumber < currentStep) {
            // Steps before current are completed
            step.classList.add('completed');
            step.classList.remove('active', 'pending');
        } else if (stepNumber === currentStep) {
            // Current step is active
            step.classList.add('active');
            step.classList.remove('completed', 'pending');
        } else {
            // Steps after current are pending
            step.classList.add('pending');
            step.classList.remove('active', 'completed');
        }
    });
    
    // Update the status line width
    const progressPercentage = ((currentStep - 1) / (statusSteps.length - 1)) * 100;
    statusLine.style.width = `${progressPercentage}%`;
}

// Function to populate the detailed timeline
function populateDetailedTimeline(trackingDetails) {
    const timelineStepsDetailed = document.getElementById('timelineStepsDetailed');
    if (!timelineStepsDetailed) return;
    
    timelineStepsDetailed.innerHTML = '';
    
    // Convert NodeList to Array and reverse to show newest first
    const detailsArray = Array.from(trackingDetails).reverse();
    
    if (detailsArray.length === 0) {
        timelineStepsDetailed.innerHTML = '<li>No tracking details available</li>';
        return;
    }
    
    detailsArray.forEach(detail => {
        const detailDateRaw = detail.querySelector('detailDate')?.textContent;
        
        console.log('Timeline detail date raw:', detailDateRaw);
        
        // Format the date or use a fallback for invalid dates
        let formattedDetailDate = 'Date not available';
        
        try {
            if (detailDateRaw) {
                // First try to match the DD/MM/YYYY HH:MM:SS format directly
                const dateMatch = detailDateRaw.match(/(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})/);
                if (dateMatch) {
                    // Extract components and format directly
                    const [, day, month, year, hours, minutes] = dateMatch;
                    const monthName = new Date(year, month-1, day).toLocaleString('en-US', { month: 'long' });
                    formattedDetailDate = `${parseInt(day)} ${monthName} ${year} at ${hours}:${minutes}`;
                } else {
                    // Try standard date parsing
                    const date = new Date(detailDateRaw);
                    
                    if (!isNaN(date.getTime())) {
                        // Format as '13 March 2025 at 12:05'
                        const day = date.getDate();
                        const month = date.toLocaleString('en-US', { month: 'long' });
                        const year = date.getFullYear();
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        
                        formattedDetailDate = `${day} ${month} ${year} at ${hours}:${minutes}`;
                    } else {
                        // If parsing fails, just show the raw date
                        formattedDetailDate = detailDateRaw;
                    }
                }
            }
        } catch (e) {
            logger.error('Error formatting timeline date', { error: e.message });
            formattedDetailDate = detailDateRaw || 'Date not available';
        }
        
        const detailDesc = detail.querySelector('detailDesc').textContent;
        console.log('Original detailDesc:', detailDesc);
        const descriptionWithoutStatusId = detailDesc.replace(/status id:\s*\d+,?/i, '').trim();
        
        let iconClass = 'fas fa-info-circle'; // Default icon
        
        if (detailDesc.toLowerCase().includes('picked up')) {
            iconClass = 'fas fa-box-open';
        } else if (detailDesc.toLowerCase().includes('outbound') || 
                  detailDesc.toLowerCase().includes('transit') || 
                  detailDesc.toLowerCase().includes('inbound')) {
            iconClass = 'fas fa-shipping-fast';
        } else if (detailDesc.toLowerCase().includes('delivery')) {
            iconClass = 'fas fa-route';
        } else if (detailDesc.toLowerCase().includes('delivered')) {
            iconClass = 'fas fa-home';
        } else if (detailDesc.toLowerCase().includes('order')) {
            iconClass = 'fas fa-shopping-cart';
        }

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <i class="${iconClass} timeline-detail-icon"></i>
            <strong>${formattedDetailDate}</strong>
        ${descriptionWithoutStatusId}
        `;
        timelineStepsDetailed.appendChild(listItem);
    });
}

// Form submit handler
document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('trackingForm');
    if (trackingForm) {
        trackingForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const orderNumber = document.getElementById('orderNumber').value.trim();
            await trackOrder(orderNumber);
        });
    }
    
    // Check for URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const trackingParam = urlParams.get('tracking');
    
    if (trackingParam) {
        // Set the input field value to what was in the URL
        const orderNumberInput = document.getElementById('orderNumber');
        if (orderNumberInput) {
            orderNumberInput.value = trackingParam;
            
            // Track the order using the parameter from the URL
            trackOrder(trackingParam);
        }
    }
    
    // Add copy link button functionality
    const copyTrackingLink = document.getElementById('copyTrackingLink');
    if (copyTrackingLink) {
        copyTrackingLink.addEventListener('click', function() {
            const currentUrl = window.location.href;
            navigator.clipboard.writeText(currentUrl).then(() => {
                const notification = document.getElementById('copyNotification');
                if (notification) {
                    notification.classList.add('show');
                    
                    setTimeout(() => {
                        notification.classList.remove('show');
                    }, 3000);
                }
            }).catch(err => {
                logger.error('Could not copy text', { error: err.message });
                alert('Failed to copy the link. Please try again.');
            });
        });
    }
});
