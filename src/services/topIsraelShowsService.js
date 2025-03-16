import topIsraelShowsData from '../assets/data/topIsraelShows.json';

// Import the images directly to ensure they're properly bundled
import OrionAndTheDarkImg from '../assets/images/orionandthedark.jpeg';
import PlayersImg from '../assets/images/players.jpeg';
import HorribleBosses2Img from '../assets/images/horriblebosses2.png';
import AmericanAssassinImg from '../assets/images/americanassassin.png';
import SuperMarioBrosMovieImg from '../assets/images/thesupermariobrosmovie.png';
import MinionsImg from '../assets/images/minions.png';
import LoverStalkerKillerImg from '../assets/images/loverstalkerkiller.jpeg';
import ElectricStateImg from '../assets/images/theelectricstate.jpg';
import PlanktonTheMovieImg from '../assets/images/planktonthemovie.jpg';
import SeraphimFallsImg from '../assets/images/seraphimfalls.png';

// Map of image paths to actual imported images
const imageMap = {
  '../images/orionandthedark.jpeg': OrionAndTheDarkImg,
  '../images/players.jpeg': PlayersImg,
  '../images/horriblebosses2.png': HorribleBosses2Img,
  '../images/americanassassin.png': AmericanAssassinImg,
  '../images/thesupermariobrosmovie.png': SuperMarioBrosMovieImg,
  '../images/minions.png': MinionsImg,
  '../images/loverstalkerkiller.jpeg': LoverStalkerKillerImg,
  '../images/theelectricstate.jpg': ElectricStateImg,
  '../images/planktonthemovie.jpg': PlanktonTheMovieImg,
  '../images/seraphimfalls.png': SeraphimFallsImg
};

/**
 * Service to provide the top 10 most watched programs in Israel
 */
class TopIsraelShowsService {
  /**
   * Get the top Israel shows
   * @returns {Array} - Array of top shows in Israel
   */
  getTopIsraelShows() {
    const { topIsraelShows } = topIsraelShowsData;
    
    // Map the image paths to actual imported images
    return topIsraelShows.map(show => ({
      ...show,
      image: imageMap[show.image] || show.image
    }));
  }
}

export default new TopIsraelShowsService(); 