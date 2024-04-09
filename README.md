# signswift

## Backend APIs

### User APIs

-   **(POST) /api/user/register** - Register a new user
-   **(POST) /api/user/login** - Login a existing user **(Provides auth token in response)**
-   **(GET) /api/user/details** - Get details of a user **(required: auth token)**

### Video APIs

-   **(GET) /api/videos/all** - Get details of all videos **(required: auth token)**
-   **(DELETE) /api/videos/all** - Delete all videos **(required: auth token)**
    <br/><br/>
-   **(GET) /api/videos** - Get details of a video **(required: auth token, video id)**
-   **(POST) /api/videos** - Add new video **(required: auth token, video file)**
-   **(DELETE) /api/videos** - Delete a video **(required: auth token, video id)**
-   **(PUT) /api/videos** - Update a video **(required: user id, video id, inference array)**
