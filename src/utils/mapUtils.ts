import { nanoid } from 'nanoid';
import { MapObject } from '../core/types';

export const generateMapObjects = (count: number, gridSize: number): MapObject[] => {
  const objects: MapObject[] = [];
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.4 ? 'tree' : 'rock';
    const scale = 0.8 + Math.random() * 0.4;
    const health = Math.floor(scale * 100) + 50;
    
    objects.push({
      id: nanoid(),
      type,
      position: [
        (Math.random() - 0.5) * gridSize,
        (Math.random() - 0.5) * gridSize
      ],
      resourceYield: {
        type: type === 'tree' ? 'wood' : 'stone',
        amount: Math.floor(Math.random() * 20) + 10
      },
      removalCost: Math.floor(Math.random() * 50) + 20,
      scale,
      health,
      maxHealth: health,
      reward: Math.floor(health / 2)
    });
  }
  return objects;
};
