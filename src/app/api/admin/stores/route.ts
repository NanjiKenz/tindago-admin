import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';




export async function GET() {
  try {
    // Fetch stores data - REST API returns plain JSON (null if no data)
    const storesData = await fetchFirebase('stores');

    // Handle null/empty response
    if (!storesData || typeof storesData !== 'object') {
      return NextResponse.json({ stores: [] });
    }

    // Fetch all ledgers and orders data upfront for performance
    const [ledgersData, ordersData, reviewsData] = await Promise.all([
      fetchFirebase('ledgers/stores'),
      fetchFirebase('orders'),
      fetchFirebase('reviews')
    ]);

    // Convert to array with IDs and map fields properly
    const stores = Object.entries(storesData).map(([id, store]: [string, any]) => {
      // Search for formattedAddress in all possible locations
      let fullAddress = store.formattedAddress || 
                       store.businessInfo?.formattedAddress ||
                       store.location?.formattedAddress ||
                       store.address?.formattedAddress ||
                       store.locationDetails?.formattedAddress ||
                       store.storeLocation?.formattedAddress;
      
      if (!fullAddress) {
        // Build complete address from all available components
        const addressParts = [];
        
        // Check if address field itself contains the full street address
        const addressField = store.businessInfo?.address || store.address;
        
        // Street address - check all possible fields and variations
        const street = store.businessInfo?.streetAddress || 
                       store.streetAddress || 
                       store.businessInfo?.street ||
                       store.street || 
                       store.businessInfo?.houseNumber ||
                       store.houseNumber ||
                       store.businessInfo?.houseNo ||
                       store.houseNo ||
                       store.streetName ||
                       store.buildingName;
        
        // If address field looks like a full street address (contains numbers or 'Street'), use it
        if (addressField && (addressField.match(/\d/) || addressField.toLowerCase().includes('street') || addressField.toLowerCase().includes('avenue'))) {
          addressParts.push(addressField);
        } else {
          // Otherwise use street if available
          if (street) addressParts.push(street);
          // Then add address if different
          if (addressField && addressField !== street) {
            addressParts.push(addressField);
          }
        }
        
        // Barangay
        const barangay = store.businessInfo?.barangay || store.barangay;
        if (barangay) addressParts.push(barangay);
        
        // If no parts found, check for complete address fields
        if (addressParts.length > 0) {
          fullAddress = addressParts.join(', ');
        } else {
          fullAddress = store.businessInfo?.fullAddress || 
                       store.fullAddress || 
                       store.storeAddress || 
                       store.businessAddress || 
                       store.location || 
                       'Address not provided';
        }
      }
      
      // Calculate performance metrics from ledger and orders
      let totalSales = 0;
      let totalOrders = 0;
      let totalRating = 0;
      let ratingCount = 0;

      // Get sales from ledger (PAID/SETTLED transactions only)
      if (ledgersData && ledgersData[id] && ledgersData[id].transactions) {
        const transactions = ledgersData[id].transactions;
        Object.values(transactions).forEach((txn: any) => {
          if (txn.status === 'PAID' || txn.status === 'SETTLED') {
            totalSales += txn.amount || 0;
          }
        });
      }

      // Get order count from orders collection
      if (ordersData) {
        Object.values(ordersData).forEach((order: any) => {
          if (order.storeId === id) {
            totalOrders++;
          }
        });
      }

      // Get average rating from reviews
      if (reviewsData) {
        Object.values(reviewsData).forEach((review: any) => {
          if (review.storeId === id && review.rating) {
            totalRating += review.rating;
            ratingCount++;
          }
        });
      }

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      return {
        storeId: id,
        ...store,
        address: fullAddress,
        // Map createdAt to joinedDate for compatibility with StoreManagement component
        joinedDate: store.joinedDate || store.createdAt || store.approvedAt || new Date().toISOString(),
        // Add accurate performance metrics
        performanceMetrics: {
          totalSales: totalSales,
          totalOrders: totalOrders,
          rating: averageRating,
          responseTime: 0 // Removed as requested
        }
      };
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stores' },
      { status: 200 }
    );
  }
}
