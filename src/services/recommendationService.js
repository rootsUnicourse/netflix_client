import recommendedShowsData from '../assets/data/recommendedShows.json';

// Import the images directly to ensure they're properly bundled
import SpaceForceImg from '../assets/images/spaceforce.jpeg';
import SuitsImg from '../assets/images/suits.png';
import Extraction2Img from '../assets/images/extraction2.jpeg';
import WaterManImg from '../assets/images/thewaterman.png';
import ExtraordinaryImg from '../assets/images/extraordinary.jpeg';
import ShotCallerImg from '../assets/images/shotcaller.png';
import SwordOfDestinyImg from '../assets/images/swordofdestiny.jpeg';
import ReadyPlayerOneImg from '../assets/images/readyplayerone.png';
import CaptainsOfWorldImg from '../assets/images/captainsoftheworld.jpeg';
import ResidentAlienImg from '../assets/images/residentalien.png';

// Map of image paths to actual imported images
const imageMap = {
  '../images/spaceforce.jpeg': SpaceForceImg,
  '../images/suits.png': SuitsImg,
  '../images/extraction2.jpeg': Extraction2Img,
  '../images/thewaterman.png': WaterManImg,
  '../images/extraordinary.jpeg': ExtraordinaryImg,
  '../images/shotcaller.png': ShotCallerImg,
  '../images/swordofdestiny.jpeg': SwordOfDestinyImg,
  '../images/readyplayerone.png': ReadyPlayerOneImg,
  '../images/captainsoftheworld.jpeg': CaptainsOfWorldImg,
  '../images/residentalien.png': ResidentAlienImg,
};

/**
 * Simulates an AI recommendation algorithm that provides personalized content matches
 * based on user viewing history, preferences, and similar users' behavior.
 */
class RecommendationService {
  /**
   * Get personalized recommendations for a user
   * @param {Object} user - The user object
   * @param {Object} profile - The selected profile
   * @returns {Array} - Array of recommended shows with match percentages
   */
  getPersonalizedRecommendations(user, profile) {
    // In a real implementation, this would use actual AI algorithms
    // For now, we'll use the pre-defined data and simulate personalization
    
    // Get the base recommendations
    const { recommendedShows } = recommendedShowsData;
    
    // Map the image paths to actual imported images
    const showsWithCorrectImages = recommendedShows.map(show => ({
      ...show,
      image: imageMap[show.image] || show.image
    }));
    
    // Sort by match percentage (highest first)
    return [...showsWithCorrectImages].sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
  
  /**
   * Get top matches for a user (highest match percentages)
   * @param {Object} user - The user object
   * @param {Object} profile - The selected profile
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Array} - Array of top recommended shows
   */
  getTopMatches(user, profile, limit = 10) {
    const recommendations = this.getPersonalizedRecommendations(user, profile);
    return recommendations.slice(0, limit);
  }
}

export default new RecommendationService(); 