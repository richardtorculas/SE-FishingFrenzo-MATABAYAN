import provinces_data from 'philippines/provinces';
import cities_data from 'philippines/cities';

export const provinces = [
  ...provinces_data.map(p => p.name).sort(),
  'Metro Manila'
].sort();

// Cities grouped by province name
const cityMap = {};
cities_data.forEach(city => {
  const province = city.province
    ? provinces_data.find(p => p.key === city.province)?.name
    : 'Metro Manila';
  if (!province) return;
  if (!cityMap[province]) cityMap[province] = [];
  cityMap[province].push(city.name);
});

export const citiesByProvince = cityMap;
