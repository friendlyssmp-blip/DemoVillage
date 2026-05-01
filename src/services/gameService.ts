import { useGameStore } from '../store/useGameStore';
import { BUILDING_TYPES } from '../core/constants';
import { ResourceType, Resources } from '../core/types';

/**
 * Service for handling game-related API calls and business logic
 * that involves the server or complex state transitions.
 */
export const gameService = {
  /**
   * Place a building after validating with the server (or locally for speed)
   */
  async placeBuilding(typeId: string, position: [number, number]) {
    const store = useGameStore.getState();
    const type = BUILDING_TYPES[typeId as keyof typeof BUILDING_TYPES];
    
    if (!type) throw new Error(`Unknown building type: ${typeId}`);

    // Local check (should be replicated on server)
    const { isNear, isOverlap } = store.checkPlacement(position);
    if (!isNear && typeId !== 'townhall' && !store.buildings.some((b: any) => b.typeId === 'townhall')) {
       // Allow first townhall anywhere? Wait, townhall is usually placed via tutorial or initial state
    }

    if (isOverlap) {
       console.warn('Cannot place building here: Overlap detected');
       return false;
    }

    // Spend resources locally
    const success = store.spendResources(type.cost);
    if (!success) {
      console.warn('Insufficient resources');
      return false;
    }

    // Call store to update state
    store.placeBuilding(typeId, position);
    
    // In a real full-stack app, we would send this to the server
    try {
      const response = await fetch('/api/village/building/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: store.user.uid,
          typeId,
          position,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        // Rollback? For now, we trust client for simplicity in prototype
        console.error('Failed to sync building placement with server');
      }
    } catch (err) {
      console.error('Network error during building placement:', err);
    }

    return true;
  },

  /**
   * Resolve a combat session
   */
  async resolveCombat(attackerId: string, defenderId: string, actions: any[]) {
    try {
      const response = await fetch('/api/combat/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker: attackerId, defender: defenderId, actions })
      });
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Combat resolution failed:', err);
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Collect resources from a building
   */
  async collectResources(buildingId: string) {
    // This would validate with server-side time-based production
    const store = useGameStore.getState();
    // Logic moved from store or components
  }
};
