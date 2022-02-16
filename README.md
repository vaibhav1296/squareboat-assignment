## API Collection For Twitter Like Web App

Folowing API collection is built using NodeJS + ExpressJS for backend and MongoDB for database. It contains only two collections ***user*** and ***post***.
The application will have following features - 

- A user can create an account by registering himself.
- Login
- Create a post.
- See other users and follow them
- Like their posts
- Visit other user's profile.

Below are the API endpoints for different actions-

1. /user/register   *post*
    - {
    "name":,
    "email":,
    "password":,  This must be of length between 8 to 15
    "gender":,
    "age":
}

2. /user/login    *post*
    - {
    "email":,
    "password":
}

3. /user/logout   *delete* 
    - authorization token in headers

4. /user/profile ( current user profile )    *get*
    - authorization token in headers

5. /user/like/post_id       *post*
    - authorization token in headers

6. /user/post                 *post*
    - authorization token in headers
    - {
    "title":"A lovely night",
    "description":"I am having very lovely night"
}

7. /user/profile/id_of_user_whose_profile_you_want_to_see?userId=your_user_id     *get* 
    - authorization token in headers

8. /user/follow/id_of_user_whose_profile_you_want_to_follow?userId=your_user_id    *put*
    - authorization token in headers

9. /user/all      *get*
    - authorization token in headers


All the APIs have been deployed to Heroku and the URL prefix is - https://vaibhav-assignment.herokuapp.com/


For sample login please use ***email- vaibhav@gmail.com*** and ***password- 12345678***

*Thank You*