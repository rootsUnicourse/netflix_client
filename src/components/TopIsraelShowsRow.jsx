import React, { useEffect, useState } from 'react';
import TopTenRow from './TopTenRow';
import topIsraelShowsService from '../services/topIsraelShowsService';

const TopIsraelShowsRow = () => {
  const [topShows, setTopShows] = useState([]);
  
  useEffect(() => {
    // Get the top shows in Israel
    const shows = topIsraelShowsService.getTopIsraelShows();
    setTopShows(shows);
  }, []);

  // Don't render if no shows found
  if (!topShows || topShows.length === 0) {
    return null;
  }

  return (
    <TopTenRow 
      title="Top 10 Movies in Israel Today" 
      items={topShows} 
    />
  );
};

export default TopIsraelShowsRow; 