import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Styled components
const MediaCardContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 0,
    paddingTop: '150%', // Maintain aspect ratio for posters (2:3)
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
        zIndex: 2,
    },
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    margin: '5px',
    backgroundColor: '#333', // Add background color for cards without images
}));

const MediaImage = styled('img')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
});

const MediaTitle = styled(Typography)({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

const RecentlyAddedTag = styled(Box)({
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'red',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 1,
});

const MediaCard = ({ media, onClick }) => {
    const navigate = useNavigate();
    
    // Check if a media item was recently added (within the last 30 days)
    const isRecentlyAdded = (releaseDate) => {
        if (!releaseDate) return false;
        
        const released = new Date(releaseDate);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        return released >= thirtyDaysAgo;
    };

    // Get image URL based on available properties
    const getImageUrl = (item) => {
        if (!item) return 'https://via.placeholder.com/300x450?text=No+Image';
        
        // Try different image properties in order of preference
        if (item.posterPath) return item.posterPath;
        if (item.backdropPath) return item.backdropPath;
        if (item.additionalImages && item.additionalImages.length > 0) return item.additionalImages[0];
        if (item.imageUrl) return item.imageUrl;
        if (item.posterUrl) return item.posterUrl;
        if (item.backdropUrl) return item.backdropUrl;
        
        // Fallbacks
        if (item.img) return item.img;
        
        // Check if there's a poster object with a path
        if (item.poster) {
            if (typeof item.poster === 'string') return item.poster;
            if (item.poster.path) return item.poster.path;
        }
        
        // Check if there's an image object with a path
        if (item.image) {
            if (typeof item.image === 'string') return item.image;
            if (item.image.path) return item.image.path;
        }
        
        // Fallback
        return 'https://via.placeholder.com/300x450?text=No+Image';
    };

    const handleClick = () => {
        if (onClick) {
            onClick(media);
        } else {
            // Navigate to media detail page if no onClick handler is provided
            navigate(`/media/${media._id}`);
        }
    };

    return (
        <MediaCardContainer onClick={handleClick}>
            <MediaImage 
                src={getImageUrl(media)} 
                alt={media.title} 
                onError={(e) => {
                    console.warn(`Image failed to load for: ${media.title}`);
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                }}
            />
            <MediaTitle variant="body2">{media.title}</MediaTitle>
            {isRecentlyAdded(media.releaseDate) && (
                <RecentlyAddedTag>
                    NEW
                </RecentlyAddedTag>
            )}
        </MediaCardContainer>
    );
};

export default MediaCard; 