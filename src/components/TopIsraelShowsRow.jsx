import React, { useEffect, useState } from 'react';
import TopTenRow from './TopTenRow';
import topIsraelShowsService from '../services/topIsraelShowsService';

const TopIsraelShowsRow = () => {
  const [topShows, setTopShows] = useState([]);
  
  useEffect(() => {
    // Get the top shows in Israel
    const shows = topIsraelShowsService.getTopIsraelShows();
    
    // Add "Recently Added" flag to shows 1, 2, 7, and 8 (indexes 0, 1, 6, 7)
    // based on the reference image
    const showsWithFlags = shows.map((show, index) => ({
      ...show,
      recentlyAdded: [0, 1, 6, 7].includes(index)
    }));
    
    setTopShows(showsWithFlags);
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