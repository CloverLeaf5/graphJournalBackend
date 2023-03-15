const axios = require("axios")

const NUM_ELEMENTS = 10;

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
        // Keep only up to the first NUM_ELEMENTS results
        dataArray = dataArray.slice(0,NUM_ELEMENTS);
        let returnArray = [];
        dataArray.forEach(movie => {
            returnArray.push({
                //concatenate DB Path and Poster Path for the image
                title: movie.title,
                release: movie.release_date,
                imageDBPath: `${imagePath}`,
                imagePosterPath:`${movie.poster_path}`
            })
        });
        return returnArray;
    }
}

exports.getShows = async (title) => {
    const endpoint = "https://api.themoviedb.org/3/search/tv";
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
        // Keep only up to the first NUM_ELEMENTS results
        dataArray = dataArray.slice(0,NUM_ELEMENTS);
        let returnArray = [];
        dataArray.forEach(movie => {
            returnArray.push({
                //concatenate DB Path and Poster Path for the image
                title: movie.name,
                release: movie.first_air_date,
                imageDBPath: `${imagePath}`,
                imagePosterPath:`${movie.poster_path}`
            })
        });
        return returnArray;
    }
}

// Defaults to 10 results
exports.getBooks = async (title) => {
    const endpoint = "https://www.googleapis.com/books/v1/volumes";
    const imagePath = "";
    const params = new URLSearchParams();
    params.append('key', process.env.GOOGLE_BOOKS_API_KEY);
    params.append('q', title);

    const response = await axios
    .get(endpoint, {params})
    .catch((err) => {
        console.log(err);
        return;
    });

    if (response && response.data){
        let dataArray =  response.data.items;
        // Keep only up to the first NUM_ELEMENTS results
        dataArray = dataArray.slice(0,NUM_ELEMENTS);
        let returnArray = [];
        dataArray.forEach(book => {
            // Has complete entry
            if (book.volumeInfo.title && book.volumeInfo.authors && book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail){  // Would fail if there are no imageLinks
                returnArray.push({
                    //concatenate DB Path and Poster Path for the image
                    title: book.volumeInfo.title,
                    author: book.volumeInfo.authors[0],
                    imageDBPath: `${imagePath}`,
                    imagePosterPath:`${book.volumeInfo.imageLinks.thumbnail}`
                })
            } else if (book.volumeInfo.title && book.volumeInfo.authors) { // No image links, send empty string
                returnArray.push({
                    //concatenate DB Path and Poster Path for the image
                    title: book.volumeInfo.title,
                    author: book.volumeInfo.authors[0],
                    imageDBPath: `${imagePath}`,
                    imagePosterPath:`${imagePath}`
                })
            } // Skip the entry if there is no title and author
            
        });
        console.log(returnArray)
        return returnArray;
    }
}

// Movies/Shows = TMDB https://www.themoviedb.org/settings/api
// Books = Google https://developers.google.com/books/docs/v1/using