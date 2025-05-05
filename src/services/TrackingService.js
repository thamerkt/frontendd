// services/TrackingService.js
import EquipmentService from './EquipmentService';

export default {
  trackPageView: async (productId) => {
    try {
      // Get visitor data from localStorage
      const sessionKey = localStorage.getItem('session_key');
      if (!sessionKey) {
        console.error("Session key not found");
        return;
      }

      // Get device type (mobile, tablet, desktop)
      const deviceType = window.innerWidth < 768 ? 'mobile' : 
                         window.innerWidth < 1024 ? 'tablet' : 'desktop';

      // Get traffic source from URL parameters or referrer
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('utm_source') || 
                    (document.referrer ? 'referral' : 'direct');

      console.log('Tracking Page View');
      console.log(`Product ID: ${productId}`);
      console.log(`Source: ${source}`);
      console.log(`Device Type: ${deviceType}`);
      
      // Send tracking data
      const response = await EquipmentService.trackView({
        stuff: productId,
        visitor: sessionKey,
        device_type: deviceType,
        source: source
      });

      console.log('Track Page View Response:', response);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  },

  trackCartActivity: async (productId, action) => {
    try {
      // Get visitor data from localStorage
      const sessionKey = localStorage.getItem('session_key');
      if (!sessionKey) {
        console.error("Session key not found");
        return;
      }

      console.log('Tracking Cart Activity');
      console.log(`Product ID: ${productId}`);
      console.log(`Action: ${action}`);

      // Send cart activity tracking data
      const response = await EquipmentService.trackCart({
        stuff: productId,
        action: action,
        visitor: sessionKey
      });

      console.log('Track Cart Activity Response:', response);
    } catch (error) {
      console.error('Error tracking cart activity:', error);
    }
  },

  visitorsInit: async () => {
    try {
      // Check for existing session_key, otherwise generate one
      let sessionKey = localStorage.getItem('session_key');
      if (!sessionKey) {
        sessionKey = Math.random().toString(36).substr(2, 9); // Generate a random session key
        localStorage.setItem('session_key', sessionKey);
      }

      console.log('Initializing Visitor');
      console.log(`Session Key: ${sessionKey}`);

      // Send visitor data to backend
      const response = await EquipmentService.CreateVisitor({
        session_key: sessionKey
      });

      console.log('Visitor Initialization Response:', response);
    } catch (error) {
      console.error('Error creating visitor:', error);
    }
  }
};
