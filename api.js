module.exports = function (app, db) {
    const { default: axios } = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
        app.get('/api/test', function (req, res) {
            res.json({
                name: 'tshifhiwa'
            });
        });

    app.get('/api/users', async function (req, res) {

        let users = [];
        users = await db.many('select * from users');
        res.json(
        {data:users}
        )
    });
app.post('/api/signup', async function (req, res) {
    
        try {
            const { username, password,firstname,lastname } = req.body;
             const salt = await bcrypt.genSalt(10);
             const hash = await bcrypt.hash(password, salt);
            
            let registerUsers = `insert into users(username, password,firstname,lastname) values($1, $2, $3,$4)`
            await db.none(registerUsers, [username,hash,firstname,lastname]);
            res.json({
                status: 'success',
            });
        
        } catch (error) {
            console.log(error); res.json({
                status:500
            })
            
        }
    });
    app.post('/api/login', async function (req, res, next) {
        
        try {
            const { username,password} = req.body;
        console.log(username,password);
            const theUser = await db.oneOrNone(`select * from users where username = $1`, [username]);
            console.log(theUser)
           if (theUser === null) {
            throw Error('Invalid username')
             }
          const decrypt=  bcrypt.compare(password,theUser.password) 
            if ( !decrypt) {
                return Error('wrong password')
                
                 }
                 
                const token = jwt.sign({
                  username:theUser.username
                 }, process.env.SECRET_TOKEN);
                res.json({
                      data:theUser,token,
                     message: `${username} is logged in`
                 });
            
        } catch (error) {
            console.log(error);
        }
       
    });
    
    function authenticateToken(req, res, next) {

        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!req.headers.authorization || !token) {
            res.sendStatus(401);
            return;
        }
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

        const { username } = decoded;

        if (username && username) {
            next();
        } else {
            res.status(403).json({
                message: 'unauthorized'
            });
        }

    }
    app.put('/api/playlist',authenticateToken, async function (req, res) {

        try {
            //https://api.themoviedb.org/3/movie/MOVIE_ID?api_key=7e719bfe3cd3786ebf0a05d3b138853d&append_to_response=videos
            const { username } = req.body;
            await db.none('update user_playlist set movie_list +1 where username =$1',[username]);
            const movies= await storeuser_playlist(username)
            const theUser = await db.oneOrNone(`select * from user_playlist where username = $1`, [username]);

            const token = jwt.sign({
                username
            }, process.env.SECRET_TOKEN);

            res.json({
                token,
                movies,
                theUser
            });

            res.json({
                status: 'success'
            })
        } catch (err) {
            console.log(err);
            res.json({
                status: 'error',
                error: err.message
            })
        }
    });
    app.get('/search', async function (req, res) {
        try {
            const{movie}  = req.query;
            const results =await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=c6cee035e53c73c0d41e58e03e25ff6b&query=${movie}`);
          console.log(results.data);
        res.json({
            data: results.data
        })  
        } catch (error) {
            console.log(error);
        }
    });
    app.post('/api/movie/:id', async function (req, res) {
        try {
            const { username } = req.body
            const { id } = req.params;

            const thisUser = await db.oneOrNone(`select * from users where username = $1`, [username])

            if (!thisUser) {
                console.log('')
            } else {
                await db.none(`insert into user_playlist (users_id, movie_list) values ($1, $2)`, [thisUser.id, id])

                res.status(200).json({
                    thisUser,
                    message: 'A movie added into the playlist'
                    
                })
            }

        } catch (error) {
            console.error(error.message);
        }
    })

    app.get('/api/playlist/:username', async function (req, res) {
        try {

            const { username } = req.params

            const thisUser = await db.oneOrNone(`SELECT * FROM users WHERE username = $1`, [username])
            
            if (!thisUser) {
                console.log('empty')
            }

            const movieIds = await db.manyOrNone(`SELECT * FROM user_playlist WHERE users_id = $1`, [thisUser.id]);

            const moviesPromises = movieIds.map(async (movie) => {
                return await getMovieById(movie.movie_list)
            })

            const movies = await Promise.all(moviesPromises)

            res.json({
                thisUser: thisUser,
                data: movies,
            })
        } catch(error) {
            console.log(error)
            res.status(500).json({
               error: e.message
            })
        }
    })
    app.delete('/api/playlist:id', async function (req, res, next) {
        
            try {
                const { id } = req.params
                const remove = await db.none(`delete from user_playlist WHERE user_id = $1 and movie_list = $2`, [id, movie_list]);
                res.json({
                    status: 'movie deleted',
                    data:remove
                })
            } catch (error) {
                res.json({
                    status: 'success',
                    error: err.stack
                })
            }
        
    });


}