import { Router, Request, Response, NextFunction } from 'express';
import { getWeatherByCity } from '../controllers/weather.controller';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get('/weather/:city', asyncHandler(getWeatherByCity));

export default router; 