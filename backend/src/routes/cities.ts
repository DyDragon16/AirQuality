import { Router, RequestHandler } from 'express';
import { cityDataService } from '../services/cityDataService';

const router = Router();

interface CityParams {
  id?: string;
  slug?: string;
  query?: string;
}

// GET /api/cities - Lấy danh sách tất cả các thành phố
const getAllCities: RequestHandler = async (req, res) => {
  try {
    const includeHidden = req.query.includeHidden === 'true'; // Query param để quyết định có lấy thành phố ẩn hay không
    const allCities = await cityDataService.getCities();
    
    // Lọc thành phố theo trạng thái ẩn nếu cần
    const cities = includeHidden 
      ? allCities // Trả về tất cả thành phố nếu includeHidden=true
      : allCities.filter(city => !city.hidden); // Chỉ trả về thành phố không ẩn
    
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/cities/:id - Lấy thông tin một thành phố theo ID
const getCityById: RequestHandler = async (req, res) => {
  try {
    const city = await cityDataService.getCityById(req.params.id);
    if (!city) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.json(city);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/cities/slug/:slug - Lấy thông tin một thành phố theo slug
const getCityBySlug: RequestHandler = async (req, res) => {
  try {
    const city = await cityDataService.getCityBySlug(req.params.slug);
    if (!city) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.json(city);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/cities/search/:query - Tìm kiếm thành phố
const searchCities: RequestHandler = async (req, res) => {
  try {
    const cities = await cityDataService.searchCities(req.params.query);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/cities/last-update - Lấy thời gian cập nhật cuối cùng
const getLastUpdate: RequestHandler = (_req, res) => {
  try {
    const lastUpdate = cityDataService.getLastUpdateTime();
    res.json({ lastUpdate });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

router.get('/', getAllCities);
router.get('/last-update', getLastUpdate);
router.get('/:id', getCityById);
router.get('/slug/:slug', getCityBySlug);
router.get('/search/:query', searchCities);

export default router; 