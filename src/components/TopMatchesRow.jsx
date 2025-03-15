import React, { useEffect, useState } from 'react';
import ContentRow from './ContentRow';
import recommendationService from '../services/recommendationService';

// Default TopMatchesRow component with props
const TopMatchesRow = ({ user, selectedProfile }) => {
  const [topMatches, setTopMatches] = useState([]);
  
  // Get top matches when both user and profile are available
  useEffect(() => {
    if (user && selectedProfile) {
      const matches = recommendationService.getTopMatches(user, selectedProfile, 10);
      setTopMatches(matches);
      console.log('Top matches:', matches); // For debugging
    }
  }, [user, selectedProfile]);

  // Don't render if no matches found
  if (!topMatches || topMatches.length === 0) {
    return null;
  }

  return (
    <ContentRow 
      title="Top 10 Matches For You" 
      items={topMatches} 
    />
  );
};

export default TopMatchesRow; 