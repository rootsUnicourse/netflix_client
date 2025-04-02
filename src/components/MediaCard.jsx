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
        // If no item, don't return a placeholder
        if (!item) return null;
        
        // For horizontal images, prefer backdrop over poster when available
        if (item.backdropPath) return item.backdropPath;
        if (item.posterPath) return item.posterPath;
        if (item.additionalImages && item.additionalImages.length > 0) {
            // Verify the additionalImage isn't a placeholder
            const firstImage = item.additionalImages[0];
            if (firstImage && !firstImage.includes('placeholder')) return firstImage;
        }
        
        if (item.imageUrl && !item.imageUrl.includes('placeholder')) return item.imageUrl;
        if (item.posterUrl && !item.posterUrl.includes('placeholder')) return item.posterUrl;
        if (item.backdropUrl && !item.backdropUrl.includes('placeholder')) return item.backdropUrl;
        
        // Fallbacks
        if (item.img && !item.img.includes('placeholder')) return item.img;
        
        // Check if there's a poster object with a path
        if (item.poster) {
            if (typeof item.poster === 'string' && !item.poster.includes('placeholder')) 
                return item.poster;
            if (item.poster.path && !item.poster.path.includes('placeholder')) 
                return item.poster.path;
        }
        
        // Check if there's an image object with a path
        if (item.image) {
            if (typeof item.image === 'string' && !item.image.includes('placeholder')) 
                return item.image;
            if (item.image.path && !item.image.path.includes('placeholder')) 
                return item.image.path;
        }
        
        // No valid image found
        return null;
    };

    const handleClick = () => {
        if (onClick) {
            onClick(media);
        } else {
            // Navigate to media detail page if no onClick handler is provided
            navigate(`/media/${media._id}`);
        }
    };

    // Don't render if we don't have a valid image
    const imageUrl = getImageUrl(media);
    if (!imageUrl) return null;

    return (
        <MediaCardContainer onClick={handleClick}>
            <MediaImage 
                src={imageUrl} 
                alt={media.title || 'Media'} 
                onError={(e) => {
                    console.warn(`Image failed to load for: ${media?.title || 'Unknown title'}`);
                    // Instead of setting a placeholder, hide the component
                    e.target.style.display = 'none'; 
                }}
            />
        </MediaCardContainer>
    );
};

export default MediaCard; 