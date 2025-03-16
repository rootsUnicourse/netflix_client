import newestShowsData from '../assets/data/newestShows.json';

// Import the images directly to ensure they're properly bundled
import RurouniKenshinImg from '../assets/images/rurounikenshin.jpeg';
import TheVinceImg from '../assets/images/thevince.jpeg';
import BleachImg from '../assets/images/bleach.jpeg';
import OutsiderImg from '../assets/images/outsider.jpeg';
import GarfieldShowImg from '../assets/images/thegarfieldshow.png';
import MarioBrosImg from '../assets/images/mariobros.png';
import CaptainsOfWorldImg from '../assets/images/captainsoftheworld.jpeg';
import Extraction2Img from '../assets/images/extraction2.jpeg';
import SwordOfDestinyImg from '../assets/images/swordofdestiny.jpeg';
import ShotCallerImg from '../assets/images/shotcaller.png';

// Map of image paths to actual imported images
const imageMap = {
  '../images/rurounikenshin.jpeg': RurouniKenshinImg,
  '../images/thevince.jpeg': TheVinceImg,
  '../images/bleach.jpeg': BleachImg,
  '../images/outsider.jpeg': OutsiderImg,
  '../images/thegarfieldshow.png': GarfieldShowImg,
  '../images/mariobros.png': MarioBrosImg,
  '../images/captainsoftheworld.jpeg': CaptainsOfWorldImg,
  '../images/extraction2.jpeg': Extraction2Img,
  '../images/swordofdestiny.jpeg': SwordOfDestinyImg,
  '../images/shotcaller.png': ShotCallerImg
};

/**
 * Service to provide the newest shows on Netflix
 */
class NewestShowsService {
  /**
   * Get the newest shows
   * @param {number} limit - Maximum number of shows to return
   * @returns {Array} - Array of newest shows
   */
  getNewestShows(limit = 10) {
    const { newestShows } = newestShowsData;
    
    // Map the image paths to actual imported images
    const showsWithCorrectImages = newestShows.map(show => ({
      ...show,
      image: imageMap[show.image] || show.image
    }));
    
    // Sort by year (newest first)
    return [...showsWithCorrectImages]
      .sort((a, b) => b.year - a.year)
      .slice(0, limit);
  }
}

export default new NewestShowsService(); 