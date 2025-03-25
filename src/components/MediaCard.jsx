import React from 'react';
import { Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Styled components
const MediaCardContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 0,
    paddingTop: '56.25%', // 16:9 aspect ratio for horizontal display
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

const MediaCard = ({ media, onClick }) => {
    const navigate = useNavigate();
    
    // Get image URL based on available properties
    const getImageUrl = (item) => {
        if (!item) return 'https://via.placeholder.com/300x170?text=No+Image';
        
        // For horizontal images, prefer backdrop over poster when available
        if (item.backdropPath) return item.backdropPath;
        if (item.posterPath) return item.posterPath;
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
        return 'https://via.placeholder.com/300x170?text=No+Image';
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
                    e.target.src = 'https://via.placeholder.com/300x170?text=No+Image';
                }}
            />
        </MediaCardContainer>
    );
};

export default MediaCard; 