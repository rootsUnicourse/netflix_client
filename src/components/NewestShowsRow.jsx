import React, { useEffect, useState } from 'react';
import ContentRow from './ContentRow';
import newestShowsService from '../services/newestShowsService';

const NewestShowsRow = () => {
  const [newestShows, setNewestShows] = useState([]);
  
  useEffect(() => {
    // Get the newest shows
    const shows = newestShowsService.getNewestShows(10);
    setNewestShows(shows);
  }, []);

  // Don't render if no shows found
  if (!newestShows || newestShows.length === 0) {
    return null;
  }

  return (
    <ContentRow 
      title="New on Netflix" 
      items={newestShows} 
    />
  );
};

export default NewestShowsRow; 