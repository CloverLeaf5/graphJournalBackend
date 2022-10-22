const axios = require("axios")

const NUM_ELEMENTS = 5;

exports.getMovies = async (title) => {
    const endpoint = "https://api.themoviedb.org/3/search/movie";
    const imagePath = "https://image.tmdb.org/t/p/w500";
    const params = new URLSearchParams();
    params.append('api_key', process.env.TMDB_API_KEY);
    params.append('query', title);
    params.append('page', '1');
    params.append('include_adult', 'false');

    const response = await axios
    .get(endpoint, {params})
    .catch((err) => {
        console.log(err);
        return;
    });

    if (response && response.data){
        let dataArray =  response.data.results;
        // Keep only up to the first 10 results
        dataArray = dataArray.slice(0,NUM_ELEMENTS);
        let returnArray = [];
        dataArray.forEach(movie => {
            returnArray.push({
                title: movie.title,
                release: movie.release_date,
                image: `${imagePath}${movie.poster_path}`
            })
        });
        return returnArray;
    }
}