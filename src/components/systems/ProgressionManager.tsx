import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { progressionService } from '../../services/progressionService';

export const ProgressionManager: React.FC = () => {
  const lastUpdate = React.useRef(Date.now());
  
  React.useEffect(() => {
    const initializeProgression = () => {
      const state = useGameStore.getState();
      const now = Date.now();

      // 1. Check for Daily Reset
      const lastActiveDate = new Date(state.lastActive).toDateString();
      const currentDate = new Date(now).toDateString();
      
      if (lastActiveDate !== currentDate) {
        // Daily refresh
        useGameStore.setState({
          dailyMissions: progressionService.generateDailyMissions(),
          lastDailyClaim: now, // Logic for daily login streak can be here
        });
      } else if (state.dailyMissions.length === 0) {
          // First time initialization
          useGameStore.setState({
            dailyMissions: progressionService.generateDailyMissions()
          });
      }

      // 2. Check for Season Initial/Reset
      if (!state.season || state.season.endTime < now) {
        const seasonDuration = 30 * 24 * 60 * 60 * 1000;
        const newSeason = {
          current: (state.season?.current || 0) + 1,
          startTime: now,
          endTime: now + seasonDuration,
          name: `Season ${ (state.season?.current || 0) + 1}: Pioneers`
        };

        // Reset rank partially
        const newPoints = progressionService.softResetRank(state.rankedPoints);
        
        useGameStore.setState({
          season: newSeason,
          rankedPoints: newPoints,
          seasonPass: {
            level: 1,
            xp: 0,
            nextLevelXp: 1000,
            isPremium: false,
            claimedFree: [],
            claimedPremium: []
          }
        });
      }

      // 3. Initialize Live Events if none or expired
      if (state.activeLiveEvents.length === 0 || state.activeLiveEvents.some(ev => ev.endTime < now)) {
        const validEvents = state.activeLiveEvents.filter(ev => ev.endTime >= now);
        if (validEvents.length === 0) {
          useGameStore.setState({
            activeLiveEvents: [progressionService.generateLiveEvent()]
          });
        } else {
          useGameStore.setState({ activeLiveEvents: validEvents });
        }
      }
    };

    initializeProgression();

    // Check periodically for expiration
    const interval = setInterval(() => {
      const now = Date.now();
      const state = useGameStore.getState();

      // Check event expiration
      if (state.activeLiveEvents.some(ev => ev.endTime < now)) {
        useGameStore.setState({
          activeLiveEvents: state.activeLiveEvents.filter(ev => ev.endTime >= now)
        });
        
        // Maybe generate a new one if all expired
        if (state.activeLiveEvents.length === 0) {
            useGameStore.setState({
                activeLiveEvents: [progressionService.generateLiveEvent()]
            });
        }
      }

      // Check season expiration
      if (state.season && state.season.endTime < now) {
        initializeProgression();
      }

      lastUpdate.current = now;
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
};
