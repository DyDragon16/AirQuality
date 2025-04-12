"use client";

import { Navbar } from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { useWeatherData } from "@/hooks/useWeatherData";
import { CITY_DATA } from "@/constants/cities";
import { getAQIColor, getAQIText } from "@/utils/aqi";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CityAQIData {
  name: string;
  aqi: number;
  slug: string;
  flag?: string;
  region?: string;
}

const FLAGS: { [key: string]: string } = {
  "Hà Nội": "🇻🇳",
  "Hồ Chí Minh": "🇻🇳",
  "Đà Nẵng": "🇻🇳",
  "Hải Phòng": "🇻🇳",
  "Cần Thơ": "🇻🇳",
  "Huế": "🇻🇳",
  "Nha Trang": "🇻🇳",
  "Đà Lạt": "🇻🇳",
  "Sa Pa": "🇻🇳",
};

export default function AirQualityPage() {
  const [cities, setCities] = useState<CityAQIData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create hooks for each city
  const hanoiWeather = useWeatherData(CITY_DATA["Hà Nội"].endpoint);
  const hcmWeather = useWeatherData(CITY_DATA["Hồ Chí Minh"].endpoint);
  const danangWeather = useWeatherData(CITY_DATA["Đà Nẵng"].endpoint);
  const haiphongWeather = useWeatherData(CITY_DATA["Hải Phòng"].endpoint);
  const canthoWeather = useWeatherData(CITY_DATA["Cần Thơ"].endpoint);
  const hueWeather = useWeatherData(CITY_DATA["Huế"].endpoint);
  const nhatrangWeather = useWeatherData(CITY_DATA["Nha Trang"].endpoint);
  const dalatWeather = useWeatherData(CITY_DATA["Đà Lạt"].endpoint);
  const sapaWeather = useWeatherData(CITY_DATA["Sa Pa"].endpoint);

  useEffect(() => {
    if (
      !hanoiWeather.isLoading && hanoiWeather.weatherData?.current &&
      !hcmWeather.isLoading && hcmWeather.weatherData?.current &&
      !danangWeather.isLoading && danangWeather.weatherData?.current &&
      !haiphongWeather.isLoading && haiphongWeather.weatherData?.current &&
      !canthoWeather.isLoading && canthoWeather.weatherData?.current &&
      !hueWeather.isLoading && hueWeather.weatherData?.current &&
      !nhatrangWeather.isLoading && nhatrangWeather.weatherData?.current &&
      !dalatWeather.isLoading && dalatWeather.weatherData?.current &&
      !sapaWeather.isLoading && sapaWeather.weatherData?.current
    ) {
      const allCitiesData = [
        { name: "Hà Nội", aqi: 170, slug: CITY_DATA["Hà Nội"].slug, region: CITY_DATA["Hà Nội"].region },
        { name: "Sa Pa", aqi: 162, slug: CITY_DATA["Sa Pa"].slug, region: CITY_DATA["Sa Pa"].region },
        { name: "Hồ Chí Minh", aqi: 160, slug: CITY_DATA["Hồ Chí Minh"].slug, region: CITY_DATA["Hồ Chí Minh"].region },
        { name: "Hải Phòng", aqi: 159, slug: CITY_DATA["Hải Phòng"].slug, region: CITY_DATA["Hải Phòng"].region },
        { name: "Cần Thơ", aqi: 156, slug: CITY_DATA["Cần Thơ"].slug, region: CITY_DATA["Cần Thơ"].region },
        { name: "Huế", aqi: 152, slug: CITY_DATA["Huế"].slug, region: CITY_DATA["Huế"].region },
        { name: "Đà Nẵng", aqi: 151, slug: CITY_DATA["Đà Nẵng"].slug, region: CITY_DATA["Đà Nẵng"].region },
        { name: "Nha Trang", aqi: 140, slug: CITY_DATA["Nha Trang"].slug, region: CITY_DATA["Nha Trang"].region },
        { name: "Đà Lạt", aqi: 126, slug: CITY_DATA["Đà Lạt"].slug, region: CITY_DATA["Đà Lạt"].region }
      ].sort((a, b) => b.aqi - a.aqi);

      setCities(allCitiesData);
      setLoading(false);
    }
  }, [
    hanoiWeather.isLoading, hanoiWeather.weatherData,
    hcmWeather.isLoading, hcmWeather.weatherData,
    danangWeather.isLoading, danangWeather.weatherData,
    haiphongWeather.isLoading, haiphongWeather.weatherData,
    canthoWeather.isLoading, canthoWeather.weatherData,
    hueWeather.isLoading, hueWeather.weatherData,
    nhatrangWeather.isLoading, nhatrangWeather.weatherData,
    dalatWeather.isLoading, dalatWeather.weatherData,
    sapaWeather.isLoading, sapaWeather.weatherData
  ]);

  const getAQIColorClass = (aqi: number) => {
    const color = getAQIColor(aqi);
    return `bg-[${color}] text-white`;
  };

  const getMostPollutedCity = () => {
    return cities.length > 0 ? cities[0] : null;
  };

  const getCleanestCity = () => {
    return cities.length > 0 ? cities[cities.length - 1] : null;
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Ranking Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Xếp hạng thành phố theo AQI* trực tiếp
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Xếp hạng chất lượng không khí các thành phố lớn trên thế giới
              </p>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thành phố</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">AQI* Việt Nam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cities.map((city, index) => (
                        <tr key={city.slug} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                          <td className="py-3 px-4">
                            <Link href={`/city/${city.slug}`} className="flex items-center group">
                              <span className="text-lg mr-2">{FLAGS[city.name]}</span>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{city.name}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAQIColorClass(city.aqi)}`}>
                                {city.aqi} - {getAQIText(city.aqi)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Side Rankings */}
          <div className="space-y-8">
            {/* Most Polluted City */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thành phố ô nhiễm nhất Việt Nam
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  getMostPollutedCity() && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link href={`/city/${getMostPollutedCity()?.slug}`} className="group">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 flex items-center">
                              <span className="text-lg mr-2">{FLAGS[getMostPollutedCity()?.name || ""]}</span>
                              {getMostPollutedCity()?.name}
                            </h3>
                            <p className="text-sm text-gray-500">{getMostPollutedCity()?.region}</p>
                          </Link>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getAQIColorClass(getMostPollutedCity()?.aqi || 0)}`}>
                          {getMostPollutedCity()?.aqi} - {getAQIText(getMostPollutedCity()?.aqi || 0)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Cleanest City */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thành phố sạch nhất Việt Nam
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  getCleanestCity() && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link href={`/city/${getCleanestCity()?.slug}`} className="group">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 flex items-center">
                              <span className="text-lg mr-2">{FLAGS[getCleanestCity()?.name || ""]}</span>
                              {getCleanestCity()?.name}
                            </h3>
                            <p className="text-sm text-gray-500">{getCleanestCity()?.region}</p>
                          </Link>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getAQIColorClass(getCleanestCity()?.aqi || 0)}`}>
                          {getCleanestCity()?.aqi} - {getAQIText(getCleanestCity()?.aqi || 0)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 