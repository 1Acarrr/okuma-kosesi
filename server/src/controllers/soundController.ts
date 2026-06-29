import { Request, Response } from 'express';

export class SoundController {
  // Get available ambient sounds
  static async getSounds(req: Request, res: Response) {
    try {
      const sounds = [
        {
          id: 'rain',
          name: 'Yağmur Sesi',
          description: 'Rahat yağmur sesi',
          category: 'nature',
          duration: 0, // 0 means infinite loop
          source: 'https://example.com/sounds/rain.mp3',
          license: 'CC0-1.0'
        },
        {
          id: 'fireplace',
          name: 'Şömine',
          description: 'Sıcak şömine ateşi',
          category: 'nature',
          duration: 0,
          source: 'https://example.com/sounds/fireplace.mp3',
          license: 'CC0-1.0'
        },
        {
          id: 'forest',
          name: 'Orman',
          description: 'Doğa sesleri',
          category: 'nature',
          duration: 0,
          source: 'https://example.com/sounds/forest.mp3',
          license: 'CC0-1.0'
        },
        {
          id: 'city',
          name: 'Şehir',
          description: 'Şehir ambiyansı',
          category: 'urban',
          duration: 0,
          source: 'https://example.com/sounds/city.mp3',
          license: 'CC0-1.0'
        },
        {
          id: 'coffee-shop',
          name: 'Kahve Dükkanı',
          description: 'Kahve dükkanı ortamı',
          category: 'urban',
          duration: 0,
          source: 'https://example.com/sounds/coffee-shop.mp3',
          license: 'CC0-1.0'
        },
        {
          id: 'library',
          name: 'Kütüphane',
          description: 'Sessiz kütüphane ortamı',
          category: 'indoor',
          duration: 0,
          source: 'https://example.com/sounds/library.mp3',
          license: 'CC0-1.0'
        }
      ];
      
      res.json({
        success: true,
        data: sounds,
        count: sounds.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sounds'
      });
    }
  }

  // Get sound by ID
  static async getSound(req: Request, res: Response) {
    try {
      const { soundId } = req.params;
      
      // Placeholder implementation
      res.json({
        success: true,
        data: {
          id: soundId,
          name: 'Ambient Sound',
          category: 'nature'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sound'
      });
    }
  }
}
